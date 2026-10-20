PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA busy_timeout = 5000;

CREATE TABLE IF NOT EXISTS tutores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL CHECK(length(trim(nome)) BETWEEN 3 AND 120),
  telefone TEXT NOT NULL CHECK(length(telefone) IN (10, 11)),
  email TEXT NOT NULL DEFAULT '',
  bairro TEXT NOT NULL DEFAULT '',
  observacoes TEXT NOT NULL DEFAULT '',
  criado_em TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  atualizado_em TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE IF NOT EXISTS animais (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tutor_id INTEGER NOT NULL,
  nome TEXT NOT NULL CHECK(length(trim(nome)) BETWEEN 1 AND 80),
  especie TEXT NOT NULL CHECK(especie IN ('cao','gato','ave','coelho','outro')),
  raca TEXT NOT NULL DEFAULT '',
  sexo TEXT NOT NULL DEFAULT 'nao_informado' CHECK(sexo IN ('macho','femea','nao_informado')),
  data_nascimento TEXT,
  peso_kg REAL CHECK(peso_kg IS NULL OR peso_kg > 0),
  observacoes TEXT NOT NULL DEFAULT '',
  criado_em TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  atualizado_em TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  CONSTRAINT fk_animais_tutor FOREIGN KEY (tutor_id) REFERENCES tutores(id) ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_animais_tutor ON animais(tutor_id);
CREATE INDEX IF NOT EXISTS idx_animais_especie ON animais(especie);
CREATE INDEX IF NOT EXISTS idx_tutores_nome ON tutores(nome);
