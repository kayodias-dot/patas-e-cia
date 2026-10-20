import { setupCommon, icon, escapeHtml, toast } from './ui.mjs';
import { api, session } from './api.mjs';
import { dashboardView, tutorsView, animalsView, connectionError } from './views.mjs';
import { initForms, openForm, openDelete, openDetails } from './forms.mjs';
setupCommon();
const content=document.getElementById('page-content');
const connection=document.getElementById('connection');
const filters=new Map();
let generation=0; let searchTimer; let lastRoute='';
function route() {
  const value=location.hash.slice(1) || 'inicio';
  if (['inicio','tutores','animais'].includes(value)) return {key:value,section:value,tutorId:null};
  const match=value.match(/^tutores\/(\d+)$/);
  return match ? {key:value,section:'tutores',tutorId:Number(match[1])} : {key:'inicio',section:'inicio',tutorId:null};
}
function filterState() {
  const key=route().key;
  if(!filters.has(key)) filters.set(key,{q:'',especie:'',page:1,limit:9});
  return filters.get(key);
}
function updateNavigation(current) {
  document.querySelectorAll('[data-nav]').forEach(a=>{
    const active=a.dataset.nav===current.section;
    a.classList.toggle('active',active); if(active) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
  });
  const label=current.tutorId ? 'Animais do tutor' : {inicio:'Vis\u00e3o geral',tutores:'Tutores',animais:'Animais'}[current.section];
  document.getElementById('breadcrumb-current').textContent=label;
  document.title=`${label} | Patas & Cia`;
}
async function render({ preserveFocus=false } = {}) {
  const current=route(); const ticket=++generation;
  const focused=document.activeElement;
  const focusId=preserveFocus ? focused?.id : null;
  const caret=preserveFocus && typeof focused?.selectionStart==='number' ? focused.selectionStart : null;
  updateNavigation(current); content.setAttribute('aria-busy','true');
  try {
    await session();
    let html;
    if(current.section==='inicio') html=dashboardView((await api.get('/stats')).data);
    else {
      const f=filterState(); const params=new URLSearchParams({q:f.q,page:String(f.page),limit:String(f.limit)});
      if(current.section==='tutores' && !current.tutorId) {
        const result=await api.get(`/tutores?${params}`);
        if(f.page>result.meta.pages) {f.page=result.meta.pages; return render({preserveFocus});}
        html=tutorsView(result,f);
      } else {
        if(f.especie) params.set('especie',f.especie);
        if(current.tutorId) params.set('tutor_id',String(current.tutorId));
        const [result,tutor]=await Promise.all([api.get(`/animais?${params}`),current.tutorId ? api.get(`/tutores/${current.tutorId}`) : Promise.resolve(null)]);
        if(f.page>result.meta.pages) {f.page=result.meta.pages; return render({preserveFocus});}
        html=animalsView(result,f,tutor?.data);
      }
    }
    if(ticket!==generation) return;
    content.innerHTML=html; connection.textContent='SQLite conectado'; connection.classList.remove('offline');
    if(focusId) {
      const replacement=document.getElementById(focusId); replacement?.focus({preventScroll:true});
      if(caret!==null && replacement?.setSelectionRange) replacement.setSelectionRange(caret,caret);
    } else if(lastRoute && lastRoute!==current.key) {
      content.querySelector('h1')?.focus({preventScroll:true}); window.scrollTo({top:0,behavior:'instant'});
    }
    lastRoute=current.key;
  } catch(error) {
    if(ticket!==generation) return;
    if(error.status===404) content.innerHTML=`<section class="panel screen-message">${icon('search')}<h2>Este cadastro n\u00e3o est\u00e1 mais aqui.</h2><p>Ele pode ter sido exclu\u00eddo em outra janela. Volte \u00e0 lista para continuar.</p><a class="btn btn-primary" href="#tutores">Voltar para tutores</a></section>`;
    else {content.innerHTML=connectionError(error.message);connection.textContent='Sem conex\u00e3o';connection.classList.add('offline');}
  } finally {if(ticket===generation) content.setAttribute('aria-busy','false');}
}
initForms(()=>render());
content.addEventListener('input',event=>{
  if(event.target.id!=='list-search') return;
  const f=filterState(); f.q=event.target.value; f.page=1;
  // Invalidate in-flight results immediately, not just after the debounce.
  generation++; clearTimeout(searchTimer); searchTimer=setTimeout(()=>render({preserveFocus:true}),300);
});
content.addEventListener('change',event=>{
  if(event.target.id==='species-filter') { const f=filterState(); f.especie=event.target.value; f.page=1; render({preserveFocus:true}); }
});
content.addEventListener('click',async event=>{
  const action=event.target.closest('[data-action]'); if(!action) return;
  const name=action.dataset.action; const id=Number(action.dataset.id);
  action.disabled=true;
  try {
    if(name==='retry') {await session(true); await render();}
    else if(name==='page') {filterState().page=Number(action.dataset.page); await render();}
    else if(name==='new-tutor') await openForm('tutor');
    else if(name==='new-animal') await openForm('animal',null,action.dataset.tutor || null);
    else if(['edit-tutor','delete-tutor','edit-animal','delete-animal','detail-animal'].includes(name)) {
      action.disabled=true;
      const type=name.endsWith('tutor') ? 'tutor' : 'animal';
      const {data}=await api.get(`/${type==='tutor' ? 'tutores' : 'animais'}/${id}`);
      if(name.startsWith('edit')) await openForm(type,data);
      else if(name.startsWith('delete')) openDelete(type,data);
      else openDetails(data);
    }
  } catch(error) {toast(error.message,'error');}
  finally {action.disabled=false;}
});
const sidebar=document.getElementById('sidebar');
const backdrop=document.getElementById('sidebar-backdrop');
const toggle=document.getElementById('sidebar-toggle');
function showSidebar(open) {
  sidebar.classList.toggle('is-open',open); backdrop.classList.toggle('is-open',open);
  toggle.setAttribute('aria-expanded',String(open));
  document.querySelector('.app-main').inert=open;
  if(open) sidebar.querySelector('.app-nav a')?.focus();
  else if(document.activeElement && sidebar.contains(document.activeElement)) toggle.focus();
}
toggle.addEventListener('click',()=>showSidebar(!sidebar.classList.contains('is-open')));
backdrop.addEventListener('click',()=>showSidebar(false));
sidebar.addEventListener('click',event=>{if(event.target.closest('a')) showSidebar(false);});
document.addEventListener('keydown',event=>{if(event.key==='Escape') showSidebar(false);});
matchMedia('(min-width:761px)').addEventListener('change',event=>{if(event.matches) showSidebar(false);});
document.querySelector('.skip-link').addEventListener('click',event=>{event.preventDefault();document.getElementById('app-main').focus();});
window.addEventListener('hashchange',()=>{clearTimeout(searchTimer);render();});
if(location.protocol==='file:') {
  content.innerHTML=connectionError('Voc\u00ea abriu o HTML diretamente. Para usar a API e o banco, inicie o servidor Node.js.');
  connection.textContent='Servidor necess\u00e1rio'; connection.classList.add('offline');
} else render();
