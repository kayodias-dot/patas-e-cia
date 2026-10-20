import { AppError } from './errors.mjs';
export function json(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(payload));
}
export async function readJson(req) {
  if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '')) throw new AppError(415, 'Envie o corpo como application/json.', 'CONTENT_TYPE');
  const MAX = 24 * 1024;
  if (Number(req.headers['content-length']) > MAX) throw new AppError(413, 'O formul\u00e1rio excedeu o tamanho permitido.', 'BODY_TOO_LARGE');
  let size = 0; const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX) throw new AppError(413, 'O formul\u00e1rio excedeu o tamanho permitido.', 'BODY_TOO_LARGE');
    chunks.push(chunk);
  }
  let data;
  try { data = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new AppError(400, 'JSON inv\u00e1lido.', 'INVALID_JSON'); }
  if (data === null || typeof data !== 'object' || Array.isArray(data)) throw new AppError(400, 'Envie um objeto JSON.', 'INVALID_JSON');
  return data;
}
export function positiveInteger(value, label = 'Identificador') {
  if (!/^\d+$/.test(String(value)) || !Number.isSafeInteger(Number(value)) || Number(value) < 1) throw new AppError(400, `${label} inv\u00e1lido.`, 'INVALID_PARAMETER');
  return Number(value);
}
export function listParams(search) {
  const page = search.has('page') ? positiveInteger(search.get('page'), 'P\u00e1gina') : 1;
  const limit = search.has('limit') ? positiveInteger(search.get('limit'), 'Limite') : 10;
  if (limit > 100 || page > 1000000) throw new AppError(400, 'Limite m\u00e1ximo: 100 registros por p\u00e1gina.', 'INVALID_PARAMETER');
  const q = (search.get('q') || '').trim();
  if (q.length > 120) throw new AppError(400, 'A busca aceita at\u00e9 120 caracteres.', 'INVALID_PARAMETER');
  return { page, limit, q };
}
