import { randomBytes, createHmac, timingSafeEqual } from 'node:crypto';
import { AppError } from './errors.mjs';
const SECRET = randomBytes(32);
const sign = text => createHmac('sha256', SECRET).update(text).digest('hex');
const equals = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const left = Buffer.from(a); const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};
export function issueCsrf(res, secure = false) {
  const payload = `${Date.now()}.${randomBytes(24).toString('hex')}`;
  const token = `${payload}.${sign(payload)}`;
  res.setHeader('Set-Cookie', `patas_csrf=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=14400${secure ? '; Secure' : ''}`);
  return token;
}
export function verifyCsrf(req, publicOrigin = '') {
  const token = req.headers['x-csrf-token'];
  const cookie = (req.headers.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith('patas_csrf='))?.slice(11);
  const parts = typeof token === 'string' ? token.split('.') : [];
  const issuedAt = Number(parts[0]);
  const origin = req.headers.origin;
  let allowedOrigin = true;
  if (origin) {
    try { allowedOrigin = publicOrigin ? origin === new URL(publicOrigin).origin : new URL(origin).host === req.headers.host; }
    catch { allowedOrigin = false; }
  }
  const valid = parts.length === 3 && Number.isFinite(issuedAt) && Date.now() - issuedAt < 14400000 && issuedAt <= Date.now() && equals(token, cookie) && equals(parts[2], sign(`${parts[0]}.${parts[1]}`));
  if (!valid || !allowedOrigin || req.headers['sec-fetch-site'] === 'cross-site') throw new AppError(403, 'Sua sess\u00e3o de formul\u00e1rio expirou. Recarregue a p\u00e1gina.', 'CSRF_INVALID');
}
export function applyHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://images.unsplash.com https://heritage-vets.com; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'");
}
