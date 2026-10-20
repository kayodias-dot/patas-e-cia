import { api } from './api.mjs';
import { icon, escapeHtml as e, phone, dateLabel, toast } from './ui.mjs';
import { ESPECIES, SEXOS, validateTutor, validateAnimal, normalizePhone } from './validation.mjs';
import { petIcon } from './views.mjs';
let current = null; let pendingDelete = null; let detailRecord = null; let saved = () => {};
const el = id => document.getElementById(id);
const optionList = (items, value) => items.map(([key,label]) => `<option value="${e(key)}" ${String(key) === String(value ?? '') ? 'selected' : ''}>${e(label)}</option>`).join('');
function field(name, label, value = '', { type = 'text', max = 120, required = false, wide = false, placeholder = '', hint = '', options = null, attrs = '' } = {}) {
  const id = `field-${name}`;
  const base = `id="${id}" name="${name}" aria-describedby="error-${name}${hint ? ` hint-${name}` : ''}" ${required ? 'required' : ''}`;
  let input;
  if (options) input = `<select ${base}>${optionList(options, value)}</select>`;
  else if (type === 'textarea') input = `<textarea ${base} maxlength="${max}" placeholder="${e(placeholder)}" rows="3">${e(value)}</textarea>`;
  else input = `<input ${base} type="${type}" value="${e(value)}" ${type !== 'number' && type !== 'date' ? `maxlength="${max}"` : ''} placeholder="${e(placeholder)}" ${attrs}>`;
  return `<div class="form-field ${wide ? 'wide' : ''}"><label for="${id}">${e(label)}${required ? ' <span class="required-star">*</span>' : ''}</label>${input}<p id="error-${name}" class="field-error" hidden></p>${hint ? `<p id="hint-${name}" class="field-hint">${e(hint)}</p>` : ''}</div>`;
}
export async function openForm(type, record = null, tutorId = null) {
  const dialog = el('form-dialog');
  if (dialog.open) dialog.close();
  el('form-alert').hidden = true; el('form-fieldset').disabled = false; el('form-submit').disabled = false;
  const data = record || {};
  current = { type, id: record?.id || null };
  el('form-title').textContent = `${record ? 'Editar' : 'Novo'} ${type}`;
  el('form-subtitle').textContent = type === 'tutor' ? 'O primeiro passo para uma nova hist\u00f3ria.' : 'Um novo amigo, conectado a quem cuida dele.';
  el('form-submit').textContent = record ? 'Salvar altera\u00e7\u00f5es' : `Cadastrar ${type}`;
  if (type === 'tutor') {
    el('form-fields').innerHTML = [
      field('nome','Nome do tutor',data.nome,{required:true,wide:true,max:120,placeholder:'Ex.: Marina Exemplo',attrs:'autocomplete="name"'}),
      field('telefone','Telefone com DDD',data.telefone ? phone(data.telefone) : '',{type:'tel',required:true,max:24,placeholder:'(85) 99999-0000',hint:'Celular com 11 d\u00edgitos ou fixo com 10 d\u00edgitos.',attrs:'autocomplete="tel"'}),
      field('email','E-mail',data.email,{type:'email',max:160,placeholder:'nome@example.com',attrs:'autocomplete="email"'}),
      field('bairro','Bairro',data.bairro,{max:100,wide:true,placeholder:'Ex.: Aldeota'}),
      field('observacoes','Observa\u00e7\u00f5es',data.observacoes,{type:'textarea',max:1000,wide:true,placeholder:'Informa\u00e7\u00f5es complementares do cadastro (opcional).'})
    ].join('');
  } else {
    const tutors = await api.tutorOptions();
    if (!tutors.length) {
      current = null;
      toast('Cadastre um tutor antes de adicionar o primeiro animal.', 'error');
      location.hash = 'tutores';
      return openForm('tutor');
    }
    el('form-fields').innerHTML = [
      field('nome','Nome do animal',data.nome,{required:true,max:80,placeholder:'Ex.: Bento'}),
      field('especie','Esp\u00e9cie',data.especie,{required:true,options:[['','Selecione a esp\u00e9cie'],...Object.entries(ESPECIES)]}),
      field('tutor_id','Tutor respons\u00e1vel',data.tutor_id || tutorId,{required:true,wide:true,options:[['','Selecione o tutor'],...tutors.map(t=>[t.id,t.nome])],hint:'Cada animal deve estar vinculado a exatamente um tutor.'}),
      field('raca','Ra\u00e7a',data.raca,{max:80,placeholder:'Ex.: Sem ra\u00e7a definida'}),
      field('sexo','Sexo',data.sexo || 'nao_informado',{options:Object.entries(SEXOS)}),
      field('data_nascimento','Data de nascimento',data.data_nascimento,{type:'date',attrs:`min="1900-01-01" max="${new Date().toISOString().slice(0,10)}"`}),
      field('peso_kg','Peso (kg)',data.peso_kg,{type:'number',placeholder:'Ex.: 8,5',attrs:'min="0.01" max="1000" step="any" inputmode="decimal"'}),
      field('observacoes','Observa\u00e7\u00f5es',data.observacoes,{type:'textarea',max:1000,wide:true,placeholder:'Caracter\u00edsticas ou informa\u00e7\u00f5es do cadastro (opcional).'})
    ].join('');
  }
  dialog.showModal(); el('field-nome')?.focus();
}
function clearErrors() {
  el('form-alert').hidden = true;
  el('record-form').querySelectorAll('[aria-invalid]').forEach(x => x.removeAttribute('aria-invalid'));
  el('record-form').querySelectorAll('.field-error').forEach(x => { x.textContent=''; x.hidden=true; });
}
function showErrors(error) {
  el('form-alert').textContent = error.message; el('form-alert').hidden = false;
  let first;
  for (const [name,message] of Object.entries(error.fields || {})) {
    const input = el('record-form').elements.namedItem(name);
    const output = el(`error-${name}`);
    if (input instanceof HTMLElement && output) { input.setAttribute('aria-invalid','true'); output.textContent=message; output.hidden=false; first ||= input; }
  }
  first?.focus();
}
async function submitForm(event) {
  event.preventDefault(); if (!current || el('form-submit').disabled) return;
  clearErrors();
  const raw = Object.fromEntries(new FormData(el('record-form')));
  let data;
  try { data = current.type === 'tutor' ? validateTutor(raw) : validateAnimal(raw); }
  catch (error) { showErrors(error); return; }
  const { type, id } = current;
  el('form-submit').disabled = true; el('form-fieldset').disabled = true;
  el('form-submit').textContent='Salvando...';
  try {
    const resource = type === 'tutor' ? 'tutores' : 'animais';
    await (id ? api.update(resource,id,data) : api.create(resource,data));
    el('form-dialog').close();
    toast(`${type === 'tutor' ? 'Tutor' : 'Animal'} ${id ? 'atualizado' : 'cadastrado'} com sucesso.`);
    await saved();
  } catch (error) {
    el('form-fieldset').disabled = false; showErrors(error);
  } finally {
    el('form-submit').disabled = false; el('form-fieldset').disabled = false;
    el('form-submit').textContent=id ? 'Salvar altera\u00e7\u00f5es' : `Cadastrar ${type}`;
  }
}
export function openDelete(type, record) {
  pendingDelete = { type, record };
  el('confirm-title').textContent = `Excluir ${type}?`;
  el('confirm-description').innerHTML = `Voc\u00ea est\u00e1 prestes a excluir <strong>${e(record.nome)}</strong>. Esta a\u00e7\u00e3o n\u00e3o pode ser desfeita.`;
  el('confirm-error').hidden = true; el('confirm-extra').hidden = true;
  el('confirm-delete').hidden = false; el('confirm-delete').disabled = false; el('confirm-delete').textContent='Sim, excluir';
  el('confirm-dialog').showModal();
  el('confirm-dialog').querySelector('[data-close-dialog]')?.focus();
}
async function confirmDelete() {
  if (!pendingDelete || el('confirm-delete').disabled) return;
  const { type, record } = pendingDelete;
  el('confirm-delete').disabled=true; el('confirm-delete').textContent='Excluindo...';
  try {
    await api.remove(type === 'tutor' ? 'tutores' : 'animais',record.id);
    el('confirm-dialog').close(); toast('Cadastro exclu\u00eddo com sucesso.'); await saved();
  } catch (error) {
    el('confirm-error').textContent=error.message; el('confirm-error').hidden=false;
    if (error.code === 'TUTOR_HAS_ANIMALS') {
      el('confirm-title').textContent='Este v\u00ednculo est\u00e1 protegido.';
      el('confirm-delete').hidden=true;
      el('confirm-extra').innerHTML=`<a class="text-link" id="view-linked-animals" href="#tutores/${record.id}">Ver animais deste tutor ${icon('arrow')}</a>`;
      el('confirm-extra').hidden=false;
      el('view-linked-animals').onclick=()=>el('confirm-dialog').close();
    }
  } finally { el('confirm-delete').disabled=false; el('confirm-delete').textContent='Sim, excluir'; }
}
export function openDetails(record) {
  detailRecord=record;
  el('detail-heading').innerHTML=`<div class="pet-avatar ${e(record.especie)}">${icon(petIcon(record.especie))}</div><div><h2 id="detail-title">${e(record.nome)}</h2><p>${e(ESPECIES[record.especie])} \u00b7 Cadastro #${String(record.id).padStart(3,'0')}</p></div>`;
  const item = (label,value,wide=false,extra='')=>`<div class="detail-item ${wide ? 'wide' : ''}"><label>${e(label)}</label><p class="${extra}">${e(value || 'N\u00e3o informado')}</p></div>`;
  el('detail-body').innerHTML=`<div class="detail-grid">${item('Ra\u00e7a',record.raca)}${item('Sexo',SEXOS[record.sexo])}${item('Nascimento',dateLabel(record.data_nascimento))}${item('Peso',record.peso_kg ? `${Number(record.peso_kg).toLocaleString('pt-BR')} kg` : '')}${item('Cadastrado em',dateLabel(record.criado_em))}${item('Atualizado em',dateLabel(record.atualizado_em))}${item('Observa\u00e7\u00f5es',record.observacoes,true,'detail-notes')}</div><div class="detail-tutor">${icon('user')}Tutor respons\u00e1vel:<a id="detail-tutor-link" href="#tutores/${record.tutor_id}">${e(record.tutor_nome)}</a><p class="field-hint">${e(phone(record.tutor_telefone))}</p></div>`;
  el('detail-tutor-link').onclick=()=>el('details-dialog').close();
  el('details-dialog').showModal();
}
export function initForms(onSaved) {
  saved=onSaved;
  el('record-form').addEventListener('submit',submitForm);
  el('record-form').addEventListener('input',event=>{
    const input=event.target;
    if (!input.name) return;
    input.removeAttribute('aria-invalid');
    const output=el(`error-${input.name}`); if(output) output.hidden=true;
  });
  el('record-form').addEventListener('focusout',event=>{
    if(event.target.name==='telefone') { const normalized=normalizePhone(event.target.value); if(normalized) event.target.value=phone(normalized); }
  });
  el('confirm-delete').addEventListener('click',confirmDelete);
  el('detail-edit').addEventListener('click',async()=>{
    el('details-dialog').close();
    try { await openForm('animal',detailRecord); } catch(error) { toast(error.message,'error'); }
  });
}
