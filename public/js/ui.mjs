const paths = {
  paw: '<ellipse cx="7" cy="8" rx="2.2" ry="3" transform="rotate(-25 7 8)"/><ellipse cx="12" cy="5.8" rx="2.1" ry="2.8"/><ellipse cx="17" cy="8" rx="2.2" ry="3" transform="rotate(25 17 8)"/><path d="M5.6 17c0-3 3.8-6.3 6.4-6.3s6.4 3.3 6.4 6.3c0 3.5-3.2 2.9-6.4 2-3.2.9-6.4 1.5-6.4-2Z"/>',
  heart: '<path d="M20.8 5.7a5.4 5.4 0 0 0-7.6 0L12 7l-1.2-1.3a5.4 5.4 0 0 0-7.6 7.6L12 22l8.8-8.7a5.4 5.4 0 0 0 0-7.6Z"/>',
  arrow: '<path d="M4 12h15M13 6l6 6-6 6"/>',
  arrowUp: '<path d="M6 18 18 6M6 6h12v12"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  users: '<path d="M3 21v-2a5 5 0 0 1 5-5h3a5 5 0 0 1 5 5v2M16 4a4 4 0 0 1 0 8M19 15a5 5 0 0 1 3 4v2"/><circle cx="9.5" cy="6.5" r="4"/>',
  user: '<circle cx="12" cy="7" r="4"/><path d="M4 22v-3a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v3"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  edit: '<path d="m16 3 5 5-12 12-6 1 1-6L16 3ZM13 6l5 5"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>',
  phone: '<path d="M5 3H3c0 10 8 18 18 18v-5l-5-2-2 2a15 15 0 0 1-6-6l2-2-2-5H5Z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
  pin: '<path d="M19 10c0 6-7 12-7 12S5 16 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
  shield: '<path d="m12 2 9 4v6c0 6-9 10-9 10S3 18 3 12V6l9-4Z"/><path d="m8 12 3 3 5-6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 10v7M12 6v.3"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  back: '<path d="M20 12H5M11 6l-6 6 6 6"/>',
  leaf: '<path d="M20 3C7 1 1 9 7 16s15 0 13-13ZM5 21 16 9"/>',
  book: '<path d="M12 5C8 2 4 3 2 4v16c4-2 7-1 10 1 3-2 6-3 10-1V4c-2-1-6-2-10 1ZM12 5v16"/>',
  cat: '<path d="M5 8 4 2l6 4h4l6-4-1 6a8 8 0 1 1-14 0Z"/><path d="M8 12h.2M16 12h.2M11 15h2l-1 1-1-1ZM2 14l4 1M18 15l4-1M2 18h4M18 18h4"/>',
  dog: '<path d="M6 6C4 3 2 5 2 10c0 4 2 5 4 2M18 6c2-3 4-1 4 4 0 4-2 5-4 2M6 8a6 6 0 0 1 12 0v7a6 6 0 0 1-12 0V8Z"/><path d="M9 10h.1M15 10h.1M10 15h4l-2 2-2-2Z"/>',
  flower: '<path d="M12 7C5-2 0 9 8 12c-9 5 0 13 4 5 5 9 13 0 5-5 9-5 0-13-5-5Z"/><circle cx="12" cy="12" r="2"/>',
  external: '<path d="M15 3h6v6M21 3l-9 9M10 3H3v18h18v-7"/>',
  database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>'
};
export function icon(name, className = '') {
  return `<svg class="icon ${className}" viewBox="0 0 24 24" aria-hidden="true" fill="${name === 'paw' ? 'currentColor' : 'none'}" stroke="${name === 'paw' ? 'none' : 'currentColor'}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.paw}</svg>`;
}
export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]);
export const initials = value => String(value || '?').trim().split(/\s+/).slice(0, 2).map(x => x[0]).join('').toUpperCase();
export function phone(value) {
  const d = String(value || '').replace(/\D/g, '');
  return d.length === 11 ? `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}` : d.length === 10 ? `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}` : value;
}
export function dateLabel(value) {
  if (!value) return 'N\u00e3o informado';
  const d = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  return Number.isFinite(d.getTime()) ? d.toLocaleDateString('pt-BR') : 'N\u00e3o informado';
}
export function renderIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); el.removeAttribute('data-icon'); });
}
export function toast(message, type = 'success') {
  const box = document.getElementById('toasts');
  if (!box) return;
  const el = document.createElement('div'); el.className = `toast toast-${type}`;
  el.setAttribute('role', type === 'error' ? 'alert' : 'status');
  el.innerHTML = `${icon(type === 'error' ? 'info' : 'check')}<span></span><button class="icon-button" type="button" aria-label="Fechar mensagem">${icon('close')}</button>`;
  el.querySelector('span').textContent = message; el.querySelector('button').onclick = () => el.remove();
  box.append(el); setTimeout(() => el.remove(), type === 'error' ? 10000 : 5500);
}
export function setupCommon() {
  renderIcons();
  document.querySelectorAll('[data-remote-image]').forEach(img => {
    const mark = () => { if (img.naturalWidth) img.parentElement.classList.add('image-loaded'); };
    img.addEventListener('load', mark); mark();
  });
  const menu = document.getElementById('menu-toggle');
  const nav = document.getElementById('primary-nav');
  if (menu && nav) {
    const close = () => { menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); };
    menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); nav.classList.toggle('is-open', open); });
    nav.addEventListener('click', e => { if (e.target.closest('a')) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }
  document.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => document.getElementById(button.dataset.closeDialog)?.close()));
  document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', e => {
    if (e.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
  }));
}
