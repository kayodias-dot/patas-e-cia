import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname, extname, sep } from 'node:path';
import { Repository } from './repository.mjs';
import { AppError } from './errors.mjs';
import { validateTutor, validateAnimal, ESPECIES } from '../public/js/validation.mjs';
import { applyHeaders, issueCsrf, verifyCsrf } from './security.mjs';
import { json, readJson, positiveInteger, listParams } from './http.mjs';
const PUBLIC = resolve(dirname(fileURLToPath(import.meta.url)), '../public');
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon' };

async function routeApi(req, res, url, repo, publicOrigin) {
  const method = req.method;
  if (url.pathname === '/api/session' && method === 'GET') return json(res, 200, { data: { csrf: issueCsrf(res, publicOrigin.startsWith('https://')), mode: 'academic', database: 'SQLite' } });
  if (url.pathname === '/api/health' && method === 'GET') return json(res, 200, { data: { status: 'ok' } });
  if (url.pathname === '/api/stats' && method === 'GET') return json(res, 200, { data: repo.stats() });
  const match = url.pathname.match(/^\/api\/(tutores|animais)(?:\/(\d+))?\/?$/);
  if (!match) throw new AppError(404, 'Rota n\u00e3o encontrada.', 'NOT_FOUND');
  const [, resource, rawId] = match;
  const id = rawId ? positiveInteger(rawId) : null;
  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(method) || (id && method === 'POST') || (!id && ['PUT', 'DELETE'].includes(method))) {
    res.setHeader('Allow', id ? 'GET, PUT, DELETE' : 'GET, POST');
    throw new AppError(405, 'M\u00e9todo n\u00e3o permitido nesta rota.', 'METHOD_NOT_ALLOWED');
  }
  const tutor = resource === 'tutores';
  if (method === 'GET') {
    if (id) return json(res, 200, { data: tutor ? repo.getTutor(id) : repo.getAnimal(id) });
    const params = listParams(url.searchParams);
    if (!tutor) {
      params.especie = url.searchParams.get('especie') || '';
      if (params.especie && !Object.hasOwn(ESPECIES, params.especie)) throw new AppError(400, 'Esp\u00e9cie inv\u00e1lida.', 'INVALID_PARAMETER');
      params.tutor_id = url.searchParams.has('tutor_id') ? positiveInteger(url.searchParams.get('tutor_id'), 'Tutor') : null;
      if (params.tutor_id) repo.getTutor(params.tutor_id);
    }
    return json(res, 200, tutor ? repo.listTutors(params) : repo.listAnimals(params));
  }
  verifyCsrf(req, publicOrigin);
  if (method === 'DELETE') {
    tutor ? repo.deleteTutor(id) : repo.deleteAnimal(id);
    return json(res, 200, { data: { id }, message: 'Registro exclu\u00eddo.' });
  }
  const body = await readJson(req);
  const data = tutor ? validateTutor(body) : validateAnimal(body);
  const item = method === 'POST' ? (tutor ? repo.createTutor(data) : repo.createAnimal(data)) : (tutor ? repo.updateTutor(id, data) : repo.updateAnimal(id, data));
  if (method === 'POST') res.setHeader('Location', `/api/${resource}/${item.id}`);
  return json(res, method === 'POST' ? 201 : 200, { data: item, message: 'Cadastro salvo com sucesso.' });
}
async function serveStatic(req, res, pathname) {
  if (!['GET', 'HEAD'].includes(req.method)) throw new AppError(405, 'M\u00e9todo n\u00e3o permitido.', 'METHOD_NOT_ALLOWED');
  let decoded;
  try { decoded = decodeURIComponent(pathname); } catch { throw new AppError(400, 'Caminho inv\u00e1lido.'); }
  if (decoded.includes('\0') || decoded.includes('\\') || decoded.split('/').some(part => part.startsWith('.'))) throw new AppError(404, 'Arquivo n\u00e3o encontrado.');
  const target = resolve(PUBLIC, `.${decoded === '/' ? '/index.html' : decoded}`);
  if (!target.startsWith(PUBLIC + sep) || !Object.hasOwn(TYPES, extname(target))) throw new AppError(404, 'Arquivo n\u00e3o encontrado.');
  let content;
  try { content = await readFile(target); } catch { throw new AppError(404, 'Arquivo n\u00e3o encontrado.'); }
  res.writeHead(200, { 'Content-Type': TYPES[extname(target)], 'Content-Length': content.length, 'Cache-Control': 'no-cache' });
  res.end(req.method === 'HEAD' ? undefined : content);
}
export function createApp(db, { publicOrigin = process.env.PUBLIC_ORIGIN || '' } = {}) {
  const repo = new Repository(db);
  const server = createServer(async (req, res) => {
    applyHeaders(res);
    try {
      const url = new URL(req.url, 'http://local.invalid');
      if (url.pathname.startsWith('/api/')) await routeApi(req, res, url, repo, publicOrigin);
      else await serveStatic(req, res, url.pathname);
    } catch (error) {
      if (res.headersSent) { res.destroy(); return; }
      const status = Number.isInteger(error.status) ? error.status : 500;
      if (status === 500) console.error('[server]', error);
      json(res, status, { error: { code: error.code || 'INTERNAL_ERROR', message: status === 500 ? 'N\u00e3o foi poss\u00edvel concluir a opera\u00e7\u00e3o. Tente novamente.' : error.message, ...(error.fields ? { fields: error.fields } : {}) } });
    }
  });
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  server.maxHeadersCount = 60;
  return server;
}
