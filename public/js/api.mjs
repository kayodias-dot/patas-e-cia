let csrf = '';
let sessionPromise;
export class ApiError extends Error {
  constructor(message, status = 0, code = '', fields = undefined) { super(message); this.name = 'ApiError'; this.status = status; this.code = code; this.fields = fields; }
}
async function http(path, options = {}) {
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(`/api${path}`, { credentials: 'same-origin', ...options, signal: controller.signal });
    let payload;
    try { payload = await response.json(); } catch { throw new ApiError('O servidor n\u00e3o retornou uma resposta JSON. Inicie o projeto com npm start.'); }
    if (!response.ok) throw new ApiError(payload.error?.message || 'N\u00e3o foi poss\u00edvel concluir a opera\u00e7\u00e3o.', response.status, payload.error?.code, payload.error?.fields);
    return payload;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(error.name === 'AbortError' ? 'A conex\u00e3o demorou mais que o esperado. Tente novamente.' : 'N\u00e3o foi poss\u00edvel conectar ao servidor. Verifique se ele est\u00e1 em execu\u00e7\u00e3o.');
  } finally { clearTimeout(timer); }
}
export async function session(force = false) {
  if (force) sessionPromise = null;
  if (!sessionPromise) sessionPromise = http('/session').then(result => { csrf = result.data.csrf; return result.data; }).catch(error => { sessionPromise = null; throw error; });
  return sessionPromise;
}
async function write(method, path, data, retry = true) {
  await session();
  try { return await http(path, { method, headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf }, ...(data !== undefined ? { body: JSON.stringify(data) } : {}) }); }
  catch (error) {
    if (retry && error.code === 'CSRF_INVALID') { await session(true); return write(method, path, data, false); }
    throw error;
  }
}
export const api = {
  get: path => http(path),
  create: (resource, data) => write('POST', `/${resource}`, data),
  update: (resource, id, data) => write('PUT', `/${resource}/${id}`, data),
  remove: (resource, id) => write('DELETE', `/${resource}/${id}`),
  async tutorOptions() {
    let page = 1; const items = [];
    for (;;) {
      const result = await http(`/tutores?limit=100&page=${page}`); items.push(...result.data);
      if (page >= result.meta.pages) break;
      page++;
    }
    return items;
  }
};
