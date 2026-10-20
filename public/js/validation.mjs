/** Domain rules shared by the interface and the service. The server always revalidates. */
export const ESPECIES = Object.freeze({ cao: 'Cachorro', gato: 'Gato', ave: 'Ave', coelho: 'Coelho', outro: 'Outro' });
export const SEXOS = Object.freeze({ macho: 'Macho', femea: 'F\u00eamea', nao_informado: 'N\u00e3o informado' });
export class ValidationError extends Error {
  constructor(fields) {
    super('Revise os campos destacados.');
    this.name = 'ValidationError'; this.status = 422; this.code = 'VALIDATION_ERROR'; this.fields = fields;
  }
}
export function normalize(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
function text(data, key, max, errors, minimum = 0) {
  if (data[key] != null && typeof data[key] !== 'string') {
    errors[key] = 'Informe um texto v\u00e1lido.'; return '';
  }
  const value = (data[key] ?? '').trim();
  if (value.length < minimum) errors[key] = minimum === 1 ? 'Este campo \u00e9 obrigat\u00f3rio.' : `Informe pelo menos ${minimum} caracteres.`;
  if (value.length > max) errors[key] = `Use no m\u00e1ximo ${max} caracteres.`;
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(value)) errors[key] = 'O texto cont\u00e9m caracteres inv\u00e1lidos.';
  return value;
}
export function normalizePhone(value) {
  if (typeof value !== 'string' || !/^[\d\s()+.\-]+$/.test(value)) return '';
  let digits = value.replace(/\D/g, '');
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) digits = digits.slice(2);
  return /^[1-9]{2}(?:[2-5]\d{7}|9\d{8})$/.test(digits) ? digits : '';
}
export function validateTutor(data) {
  const errors = {};
  const nome = text(data, 'nome', 120, errors, 3);
  const rawPhone = text(data, 'telefone', 24, errors, 1);
  const telefone = normalizePhone(rawPhone);
  if (!telefone) errors.telefone = 'Informe DDD + telefone: (85) 3333-0000 ou (85) 99999-0000.';
  const email = text(data, 'email', 160, errors);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Informe um e-mail v\u00e1lido.';
  const bairro = text(data, 'bairro', 100, errors);
  const observacoes = text(data, 'observacoes', 1000, errors);
  if (Object.keys(errors).length) throw new ValidationError(errors);
  return { nome, telefone, email, bairro, observacoes };
}
export function validateAnimal(data) {
  const errors = {};
  const nome = text(data, 'nome', 80, errors, 1);
  const tutor_id = Number(data.tutor_id);
  if (!['number', 'string'].includes(typeof data.tutor_id) || !Number.isSafeInteger(tutor_id) || tutor_id < 1) errors.tutor_id = 'Selecione o tutor respons\u00e1vel.';
  const especie = text(data, 'especie', 20, errors, 1);
  if (!Object.hasOwn(ESPECIES, especie)) errors.especie = 'Selecione uma esp\u00e9cie v\u00e1lida.';
  const raca = text(data, 'raca', 80, errors);
  const sexo = data.sexo || 'nao_informado';
  if (typeof sexo !== 'string' || !Object.hasOwn(SEXOS, sexo)) errors.sexo = 'Selecione uma op\u00e7\u00e3o v\u00e1lida.';
  const birth = text(data, 'data_nascimento', 10, errors);
  if (birth) {
    const date = new Date(`${birth}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birth) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== birth || birth < '1900-01-01' || birth > new Date().toISOString().slice(0, 10)) errors.data_nascimento = 'Informe uma data existente, de 1900 at\u00e9 hoje.';
  }
  const rawWeight = data.peso_kg;
  let peso_kg = null;
  if (rawWeight !== undefined && rawWeight !== null && rawWeight !== '') {
    peso_kg = typeof rawWeight === 'string' ? Number(rawWeight.replace(',', '.')) : rawWeight;
    if (!['number', 'string'].includes(typeof rawWeight) || !Number.isFinite(peso_kg) || peso_kg <= 0 || peso_kg > 1000) errors.peso_kg = 'Informe um peso maior que zero e de at\u00e9 1.000 kg.';
  }
  const observacoes = text(data, 'observacoes', 1000, errors);
  if (Object.keys(errors).length) throw new ValidationError(errors);
  return { nome, tutor_id, especie, raca, sexo, data_nascimento: birth || null, peso_kg, observacoes };
}
