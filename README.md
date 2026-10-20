# Patas & Cia

Sistema web desenvolvido para o projeto da disciplina **N695 - Desenvolvimento de Plataformas Web**, da Universidade de Fortaleza.

O projeto foi baseado no **Cenário 1 - Clínica veterinária de bairro**.

## Acessos

### Aplicação publicada
https://kayodias-patas.alwaysdata.net

### Repositório
https://github.com/kayodias-dot/patas-e-cia

---

## Sobre o projeto

A Clínica Patas & Cia precisava substituir o controle manual de tutores e animais por uma solução web simples e organizada.

A aplicação permite gerenciar tutores e seus respectivos animais, mantendo o relacionamento entre as duas entidades e aplicando validações para evitar dados inválidos e exclusões indevidas.

## Funcionalidades

### Tutores
- Cadastrar tutor
- Listar tutores
- Pesquisar tutores
- Editar tutor
- Excluir tutor
- Validar telefone
- Impedir a exclusão de tutor que possua animais cadastrados

### Animais
- Cadastrar animal
- Listar animais
- Editar animal
- Excluir animal
- Vincular animal a um tutor
- Visualizar os animais de cada tutor

### Interface
- Layout responsivo
- Compatível com desktop e dispositivos móveis
- Mensagens de sucesso e erro
- Navegação entre área institucional e painel de gerenciamento
- Painel com indicadores

---

## Tecnologias utilizadas

### Front-end
- HTML5
- CSS3
- JavaScript
- Interface responsiva

### Back-end
- Node.js
- JavaScript com ES Modules
- API REST própria

### Banco de dados
- SQLite

### Hospedagem
- alwaysdata

### Controle de versão
- Git
- GitHub

---

## Estrutura do projeto

```text
patas-e-cia/
│
├── public/
│   ├── assets/
│   ├── css/
│   ├── js/
│   ├── index.html
│   └── painel.html
│
├── server/
│   ├── app.mjs
│   ├── database.mjs
│   ├── errors.mjs
│   ├── http.mjs
│   ├── index.mjs
│   ├── repository.mjs
│   ├── security.mjs
│   └── seed.mjs
│
├── database/
│   └── schema.sql
│
├── data/
│
├── docs/
│   └── evidencias/
│
├── tests/
│
├── package.json
├── Dockerfile
├── README.md
└── INICIAR_WINDOWS.bat