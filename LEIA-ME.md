# Patas & Cia
## Site institucional + sistema de gestão de tutores e animais

**Projeto acadêmico N695 - Desenvolvimento de Plataformas Web. Cenário 1: Clínica veterinária de bairro.**

Primeira versão funcional. A identidade da Patas & Cia adapta a estrutura e o estilo do site indicado como referência: https://heritage-vets.com/. Não é uma reprodução pixel a pixel, nem um site oficial daquela clínica.

## Comece por aqui no Windows

1. Instale **Node.js 24 LTS**. O código foi testado com Node.js 22.16.0; o mínimo declarado é 22.13.0. Download oficial: https://nodejs.org/.
2. Extraia **todo** o ZIP para uma pasta. Não execute os arquivos dentro do ZIP.
3. Abra `INICIAR_WINDOWS.bat`. Mantenha a janela aberta e acesse **http://localhost:3000** no navegador.

Também é possível abrir o terminal na pasta que contém `package.json` e executar:

```bash
npm start
```

**Não é necessário executar `npm install`.** Esta versão usa somente módulos incluídos no Node.js. Não exige XAMPP, MySQL, Composer, ferramenta de compilação ou chave de serviço externo.

Para encerrar o servidor, pressione `Ctrl+C` na janela do terminal. Não basta fechar a aba do navegador.

## Dados de demonstração

O banco é criado automaticamente e **começa vazio**. Para carregar quatro tutores e seis animais fictícios, execute, na pasta do projeto:

```bash
npm run seed
npm start
```

Caso já existam registros, o comando de demonstração **não apaga nem substitui os seus cadastros**. As capturas em `docs/evidencias/` usam dados fictícios gerados durante os testes; os identificadores podem ser diferentes no seu computador.

## Onde acessar

| Página | Endereço local |
|---|---|
| Site institucional | http://localhost:3000 |
| Painel | http://localhost:3000/painel.html |
| Tutores | http://localhost:3000/painel.html#tutores |
| Animais | http://localhost:3000/painel.html#animais |
| Saúde da API | http://localhost:3000/api/health |

Abrir `public/painel.html` por duplo clique **não inicia a API**. Execute o servidor e utilize o endereço local.

## O que foi implementado

- Site institucional responsivo com apresentação, essência da clínica, diferenciais, acesso à gestão e perguntas frequentes.
- CRUD completo de tutores: criar, listar, editar e excluir; busca por nome, telefone ou bairro; paginação.
- CRUD completo de animais: criar, listar, consultar a ficha, editar e excluir; busca e filtro por espécie; listagem dos animais de cada tutor.
- Relação de um tutor para vários animais. Cada animal tem exatamente um tutor.
- Bloqueio da exclusão de tutor com animais, validado pela API e pela chave estrangeira no banco.
- Formulários com validação no navegador e nova validação no servidor, mensagens junto aos campos e confirmações de exclusão.
- Indicadores derivados do banco, sem números fictícios fixados no painel.

## Tecnologia e organização

Interface em HTML, CSS e JavaScript modular. Serviço HTTP próprio em Node.js. Banco relacional SQLite, usando o módulo nativo `node:sqlite`.

Nesta versão, o SQLite substitui o MySQL mencionado na proposta inicial, para simplificar a instalação. A escolha da tecnologia é livre no enunciado. SQLite é um banco de dados: não se trata de guardar os cadastros em JSON, CSV, memória ou `localStorage`.

```text
patas-e-cia/
  public/                 Interface servida ao navegador
    index.html            Site institucional
    painel.html           Estrutura da gestao
    css/                  Estilos e responsividade
    js/                   Views, formularios, cliente HTTP e validacao
    assets/               Icones e ilustracao original de reserva
  server/                 Servico Web, roteamento, acesso a dados e seguranca
  database/schema.sql     Estrutura relacional do banco
  data/                   Banco criado durante a execucao (fora do site publico)
  tests/                  Testes de regras e integracao HTTP/SQLite
  docs/                   Modelo de entrega, API, requisitos e evidencias
```

`public/js/validation.mjs` é compartilhado entre interface e servidor. Isso evita duplicar as regras, mas **o servidor sempre valida novamente**. Os valores enviados pelo navegador nunca são aceitos apenas porque passaram na interface.

## Como usar os cadastros

Abra **Tutores**, clique em **Cadastrar tutor** e informe nome e telefone com DDD. E-mail, bairro e observações são opcionais.

Clique no nome do tutor ou na quantidade de animais para abrir sua família. Use **Cadastrar animal**: o tutor já virá selecionado. Nome, espécie e tutor são obrigatórios. Raça, sexo, nascimento, peso e observações complementam o cadastro.

Os ícones de lápis editam registros. A lixeira solicita confirmação. Se houver animais associados, a exclusão do tutor é recusada: transfira os animais para outro tutor ou exclua seus cadastros primeiro.

## Testes

```bash
npm test
```

Foram executados **64 testes automatizados**, todos aprovados, abrangendo regras de validação, CRUD real pela API, integração com SQLite, persistência após reiniciar, transferência de animais, proteção da relação, paginação e rejeição de requisições inválidas.

Houve verificação adicional da interface em Chromium com fluxo de cadastro/edição/exclusão e 25 combinações de página/largura: 320, 390, 768, 1024 e 1440 pixels. Não foi detectada rolagem horizontal da página nessas combinações. Leia `docs/TESTES.md` para as condições e limitações.

## Dados, segurança e limites

**Esta aplicação é uma demonstração acadêmica compartilhada, sem autenticação.** Todos que acessarem a gestão podem consultar e modificar os registros. Utilize somente dados fictícios. Não publique dados pessoais reais, informações clínicas, matrículas dos integrantes no banco de demonstração ou credenciais.

O projeto inclui consultas parametrizadas, limitação do tamanho do JSON, escape de textos na interface, tratamento de erros, tokens CSRF em operações de escrita e restrição dos arquivos públicos. Essas medidas **não substituem autenticação, autorização, revisão de segurança e backup para uso real em uma clínica**.

Não estão implementados: agendamentos, prontuários, pagamentos, login de funcionários, upload de fotos, integração com WhatsApp ou envio de mensagens. O enunciado do cenário 1 não exige esses recursos.

## Banco e backup

O arquivo de banco é criado em `data/patas-e-cia.sqlite`. Para uma cópia manual simples, **encerre o servidor antes** e copie a pasta `data` inteira. Não apague essa pasta para atualizar o código. O `.gitignore` impede o envio acidental do banco e de arquivos `.env` ao GitHub.

## Imagens e referência visual

As fotografias do site de referência estão **vinculadas externamente para esta prévia**, não baixadas nem incluídas no ZIP. A disponibilidade e a autorização de reutilização delas não foram verificadas. Antes de publicar o trabalho, substitua-as por fotografias próprias/licenciadas ou remova os elementos `<img class="remote">` em `public/index.html` para usar somente as ilustrações e os ícones locais.

Se as imagens externas não carregarem, o layout mostra automaticamente a ilustração original de cachorro e gato e os ícones locais. Não há arquivos de fontes de terceiros no pacote. A interface usa fontes alternativas do sistema.

Referências e endereços das imagens: `docs/REFERENCIAS_VISUAIS.md`.

## Publicação

O projeto **ainda não foi publicado** e nenhum repositório GitHub foi criado por esta entrega. Veja `docs/PUBLICACAO.md`.

A hospedagem precisa executar Node.js e oferecer **disco persistente**. Hospedar somente a pasta `public` não atende à atividade, pois a API e o banco deixariam de funcionar. Disco temporário pode perder os cadastros ao reiniciar ou reimplantar a aplicação.

## Documentação para o trabalho

`docs/MODELO_ENTREGA.md` contém uma base de texto na ordem dos **13 tópicos obrigatórios**. Ela não é um PDF final pronto para submissão: faltam identificação da equipe, links públicos, capturas finais e considerações escritas pelos integrantes. Não invente nomes, matrículas, experiências ou URLs.

O enunciado exige PDF de 8 a 20 páginas, incluindo capa, evidências e capturas, sem colar código-fonte. Cada integrante deve enviar o arquivo. O uso de IA deve ser declarado. Consulte o enunciado fornecido e o checklist em `docs/REQUISITOS.md` antes de submeter.

## Problemas comuns

**“node não é reconhecido”:** instale o Node.js e reabra o terminal.

**“No such built-in module: node:sqlite”:** atualize o Node.js. Use a versão 24 LTS.

**Aviso “ExperimentalWarning: SQLite” no Node 22:** o aviso é emitido pelo módulo nativo nessa versão; não significa que os cadastros falharam. Não suprima outros erros sem verificar.

**Porta 3000 ocupada:** feche a outra instância ou use, no PowerShell:

```powershell
$env:PORT="3001"
npm start
```

Acesse então `http://localhost:3001`.

**“Sem conexão” no painel:** mantenha o terminal do servidor aberto e acesse o endereço HTTP, não o arquivo HTML por duplo clique.
