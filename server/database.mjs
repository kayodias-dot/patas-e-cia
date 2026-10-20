import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalize } from '../public/js/validation.mjs';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export function openDatabase(filename = resolve(process.env.DATA_DIR || resolve(ROOT, 'data'), 'patas-e-cia.sqlite')) {
  if (filename !== ':memory:') mkdirSync(dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename);
  db.function('normalizar', { deterministic: true }, value => normalize(value));
  db.exec(readFileSync(resolve(ROOT, 'database/schema.sql'), 'utf8'));
  return db;
}
/** Transactions contain synchronous database operations only; no async work interleaves them. */
export function transaction(db, fn) {
  db.exec('BEGIN IMMEDIATE');
  try { const result = fn(); db.exec('COMMIT'); return result; }
  catch (error) { db.exec('ROLLBACK'); throw error; }
}
