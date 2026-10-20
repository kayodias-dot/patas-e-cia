import { normalize } from '../public/js/validation.mjs';
import { AppError, notFound } from './errors.mjs';
import { transaction } from './database.mjs';
const NOW = "strftime('%Y-%m-%dT%H:%M:%fZ','now')";
const pattern = value => `%${normalize(value).replace(/[!%_]/g, '!$&')}%`;
const TUTOR_SELECT = `SELECT t.*, (SELECT COUNT(*) FROM animais a WHERE a.tutor_id=t.id) AS total_animais FROM tutores t`;
const ANIMAL_SELECT = `SELECT a.*, t.nome AS tutor_nome, t.telefone AS tutor_telefone FROM animais a JOIN tutores t ON t.id=a.tutor_id`;

export class Repository {
  constructor(db) { this.db = db; }
  getTutor(id) {
    const item = this.db.prepare(`${TUTOR_SELECT} WHERE t.id=?`).get(id);
    if (!item) throw notFound(); return item;
  }
  getAnimal(id) {
    const item = this.db.prepare(`${ANIMAL_SELECT} WHERE a.id=?`).get(id);
    if (!item) throw notFound(); return item;
  }
  listTutors({ q = '', page = 1, limit = 10 } = {}) {
    const where = q ? " WHERE normalizar(t.nome) LIKE ? ESCAPE '!' OR t.telefone LIKE ? ESCAPE '!' OR normalizar(t.bairro) LIKE ? ESCAPE '!'" : '';
    const params = q ? [pattern(q), pattern(q), pattern(q)] : [];
    const total = this.db.prepare(`SELECT COUNT(*) AS total FROM tutores t${where}`).get(...params).total;
    const data = this.db.prepare(`${TUTOR_SELECT}${where} ORDER BY t.nome COLLATE NOCASE, t.id LIMIT ? OFFSET ?`).all(...params, limit, (page - 1) * limit);
    return { data, meta: { total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) } };
  }
  listAnimals({ q = '', especie = '', tutor_id = null, page = 1, limit = 10 } = {}) {
    const clauses = []; const params = [];
    if (q) { clauses.push("(normalizar(a.nome) LIKE ? ESCAPE '!' OR normalizar(a.raca) LIKE ? ESCAPE '!' OR normalizar(t.nome) LIKE ? ESCAPE '!')"); params.push(pattern(q), pattern(q), pattern(q)); }
    if (especie) { clauses.push('a.especie=?'); params.push(especie); }
    if (tutor_id !== null) { clauses.push('a.tutor_id=?'); params.push(tutor_id); }
    const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';
    const total = this.db.prepare(`SELECT COUNT(*) AS total FROM animais a JOIN tutores t ON t.id=a.tutor_id${where}`).get(...params).total;
    const data = this.db.prepare(`${ANIMAL_SELECT}${where} ORDER BY a.nome COLLATE NOCASE, a.id LIMIT ? OFFSET ?`).all(...params, limit, (page - 1) * limit);
    return { data, meta: { total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) } };
  }
  createTutor(data) {
    const { nome, telefone, email, bairro, observacoes } = data;
    const result = this.db.prepare('INSERT INTO tutores (nome,telefone,email,bairro,observacoes) VALUES (?,?,?,?,?)').run(nome,telefone,email,bairro,observacoes);
    return this.getTutor(Number(result.lastInsertRowid));
  }
  updateTutor(id, data) {
    this.getTutor(id);
    const { nome, telefone, email, bairro, observacoes } = data;
    this.db.prepare(`UPDATE tutores SET nome=?,telefone=?,email=?,bairro=?,observacoes=?,atualizado_em=${NOW} WHERE id=?`).run(nome,telefone,email,bairro,observacoes,id);
    return this.getTutor(id);
  }
  deleteTutor(id) {
    return transaction(this.db, () => {
      const tutor = this.getTutor(id);
      if (tutor.total_animais > 0) throw new AppError(409, 'Este tutor ainda tem animais cadastrados. Transfira ou exclua os animais antes de excluir o tutor.', 'TUTOR_HAS_ANIMALS');
      this.db.prepare('DELETE FROM tutores WHERE id=?').run(id);
    });
  }
  assertTutor(id) {
    if (!this.db.prepare('SELECT id FROM tutores WHERE id=?').get(id)) throw new AppError(422, 'O tutor selecionado n\u00e3o existe mais. Selecione outro tutor.', 'INVALID_TUTOR', { tutor_id: 'Selecione um tutor cadastrado.' });
  }
  createAnimal(data) {
    return transaction(this.db, () => {
      this.assertTutor(data.tutor_id);
      const { tutor_id, nome, especie, raca, sexo, data_nascimento, peso_kg, observacoes } = data;
      const result = this.db.prepare('INSERT INTO animais (tutor_id,nome,especie,raca,sexo,data_nascimento,peso_kg,observacoes) VALUES (?,?,?,?,?,?,?,?)').run(tutor_id,nome,especie,raca,sexo,data_nascimento,peso_kg,observacoes);
      return this.getAnimal(Number(result.lastInsertRowid));
    });
  }
  updateAnimal(id, data) {
    return transaction(this.db, () => {
      this.getAnimal(id); this.assertTutor(data.tutor_id);
      const { tutor_id, nome, especie, raca, sexo, data_nascimento, peso_kg, observacoes } = data;
      this.db.prepare(`UPDATE animais SET tutor_id=?,nome=?,especie=?,raca=?,sexo=?,data_nascimento=?,peso_kg=?,observacoes=?,atualizado_em=${NOW} WHERE id=?`).run(tutor_id,nome,especie,raca,sexo,data_nascimento,peso_kg,observacoes,id);
      return this.getAnimal(id);
    });
  }
  deleteAnimal(id) { this.getAnimal(id); this.db.prepare('DELETE FROM animais WHERE id=?').run(id); }
  stats() {
    const tutores = this.db.prepare('SELECT COUNT(*) AS n FROM tutores').get().n;
    const animais = this.db.prepare('SELECT COUNT(*) AS n FROM animais').get().n;
    const especies = this.db.prepare('SELECT especie,COUNT(*) AS total FROM animais GROUP BY especie ORDER BY total DESC').all();
    const recentes = this.db.prepare(`${ANIMAL_SELECT} ORDER BY a.id DESC LIMIT 5`).all();
    return { tutores, animais, especies, recentes };
  }
}
