# BASE EDITÁVEL - NÃO SUBMETER SEM COMPLETAR

Este texto segue a ordem da Parte II do enunciado. Substitua todas as marcações `[PREENCHER]`, inclua as evidências reais e organize a versão final em um PDF de 8 a 20 páginas. As notas de preparação devem ser retiradas do PDF final. **Não cole o código-fonte; use links para os arquivos no GitHub.**

# 1. Identificação (capa)

**Universidade de Fortaleza**

**Centro de Ciências Tecnológicas**

**Disciplina:** N695 - Desenvolvimento de Plataformas Web

**Turma:** [PREENCHER]

**Cenário escolhido:** 1 - Clínica veterinária de bairro

**Título:** Patas & Cia: plataforma Web de gestão de tutores e animais

| Integrante | Nome completo | Matrícula |
|---|---|---|
| 1 | [PREENCHER] | [PREENCHER] |
| 2 | [PREENCHER] | [PREENCHER] |
| 3 | [PREENCHER] | [PREENCHER] |
| 4 | [PREENCHER] | [PREENCHER] |
| 5, se houver | [PREENCHER] | [PREENCHER] |
| 6, se houver | [PREENCHER] | [PREENCHER] |

**Local e ano:** [PREENCHER]

# 2. Links de acesso

**Repositório público no GitHub:** [PREENCHER COM O LINK REAL]

**Aplicação publicada:** [PREENCHER COM O LINK REAL]

**Data em que a equipe verificou o acesso anônimo aos dois links:** [PREENCHER]

> Nota de preparação: `localhost` é um endereço local de teste, não o link de uma aplicação publicada. O código entregue neste pacote ainda não foi publicado.

# 3. Cenário escolhido e justificativa

O cenário selecionado é o da Clínica Patas & Cia. No enunciado, a clínica atende cerca de 40 animais por semana e utiliza um caderno para registrar informações. Esse processo dificulta localizar os animais e identificar seus responsáveis.

O projeto propõe um sistema Web que organiza tutores e animais em cadastros relacionados, permitindo consultar e atualizar informações sem depender do registro manual. O problema permite aplicar interface Web, formulários, consumo de serviços, regras de validação e persistência em uma solução integrada.

**Justificativa específica da escolha pela equipe:** [PREENCHER COM OS MOTIVOS REAIS DA EQUIPE]

# 4. Visão geral da solução

A aplicação possui um site institucional e uma área de gestão. O site apresenta a clínica fictícia e encaminha para o sistema. A gestão apresenta indicadores, lista de tutores, lista de animais e os animais vinculados a cada tutor.

As entidades do cenário são **Tutor** e **Animal**. Um tutor pode ter vários animais, mas cada animal pertence a exatamente um tutor. O relacionamento é representado por uma chave estrangeira na tabela de animais.

| Entidade | Atributos principais adotados |
|---|---|
| Tutor | Nome, telefone, e-mail, bairro e observações |
| Animal | Nome, espécie, tutor, raça, sexo, nascimento, peso e observações |

Esses atributos são escolhas da implementação: o enunciado define as entidades e as regras, mas não uma relação completa de campos.

Quando uma solicitação de exclusão envolve um tutor com animais cadastrados, o servidor recusa a operação e explica como proceder. Não existem, nesta versão, agendamento de consultas, prontuários ou pagamentos.

**Inserir diagrama ou captura do relacionamento:** [PREENCHER]

# 5. Ferramentas e stack utilizadas

| Camada | Tecnologia usada nesta versão | Finalidade |
|---|---|---|
| Interface | HTML, CSS e JavaScript modular | Páginas, responsividade e interação |
| Comunicação | Fetch API e JSON sobre HTTP | Consumo do serviço próprio |
| Serviço Web | Node.js, módulo HTTP nativo | Rotas, validação e respostas |
| Dados | SQLite, por `node:sqlite` | Banco relacional persistido em disco |
| Testes | Executor de testes nativo do Node.js | Regras e integração HTTP/SQLite |
| Versionamento | Git e GitHub | [PREENCHER COM O REPOSITÓRIO REAL] |
| Hospedagem | [PREENCHER] | Execução da aplicação e disco persistente |

**Versão do Node.js usada pela equipe:** [PREENCHER]

**Ferramentas efetivamente utilizadas pela equipe:** [PREENCHER]

> Nota: a versão inicial foi testada com Node.js 22.16.0. A equipe deve informar o ambiente que realmente utilizar. O site indicado pelo usuário foi referência visual, não fonte de código do sistema de gestão.

# 6. Interface

A navegação permite acessar a visão geral, os tutores e os animais. O nome ou a quantidade de animais de um tutor abre a listagem relacionada. Os formulários reutilizam a estrutura visual para cadastro e edição. Confirmações e mensagens de erro são exibidas na própria interface.

**Inserir capturas reais e legendas:** página inicial; painel; lista de tutores; cadastro e edição de tutor; animais do tutor; cadastro e edição de animal; exemplo em tela de celular. [PREENCHER]

As imagens em `docs/evidencias/` são capturas de desenvolvimento com dados fictícios. Para a entrega, a equipe deve confirmar que elas correspondem à versão publicada ou produzir novas capturas.

# 7. Serviço Web

A interface envia solicitações HTTP a um serviço implementado no próprio projeto. A API responde em JSON e oferece as quatro operações para cada entidade.

| Entidade | Criar | Listar/consultar | Atualizar | Excluir |
|---|---|---|---|---|
| Tutor | POST /api/tutores | GET /api/tutores e /api/tutores/ID | PUT /api/tutores/ID | DELETE /api/tutores/ID |
| Animal | POST /api/animais | GET /api/animais e /api/animais/ID | PUT /api/animais/ID | DELETE /api/animais/ID |

O filtro `tutor_id` retorna somente os animais do responsável selecionado. Há também busca, paginação e filtro por espécie. Operações de escrita exigem token de formulário obtido na mesma origem.

**Link para o roteamento, `server/app.mjs`:** [PREENCHER COM LINK GITHUB]

**Link para o cliente HTTP, `public/js/api.mjs`:** [PREENCHER COM LINK GITHUB]

**Capturas de requisição e resposta para as duas entidades:** [PREENCHER]

**Captura do HTTP 409 quando a exclusão de tutor é bloqueada:** [PREENCHER]

> Nota: a documentação `docs/API.md` ajuda a reproduzir essas solicitações. Não substitua as capturas reais por resultados que a equipe não executou.

# 8. Persistência dos dados

O sistema utiliza banco de dados SQLite em disco. O esquema possui as tabelas `tutores` e `animais`. A coluna `animais.tutor_id` referencia o tutor e não pode ficar sem valor. A chave estrangeira impede excluir um tutor ainda referenciado por animais.

A camada de acesso aos dados utiliza consultas parametrizadas. A exclusão de tutor e as operações de vínculo de animal são realizadas em transações. O arquivo do banco fica fora da pasta pública da interface.

**Link para `database/schema.sql`:** [PREENCHER COM LINK GITHUB]

**Link para `server/database.mjs`:** [PREENCHER COM LINK GITHUB]

**Link para `server/repository.mjs`:** [PREENCHER COM LINK GITHUB]

**Evidência de persistência após reiniciar e informação do disco persistente na hospedagem:** [PREENCHER]

# 9. Validação de entrada e tratamento de erros

Nome e telefone são obrigatórios para o tutor. Nome, espécie e tutor são obrigatórios para o animal. O telefone deve conter DDD e quantidade/formato de dígitos compatíveis com telefone fixo ou celular. O sistema verifica formato; não confirma a existência de uma linha telefônica.

Como validações complementares da implementação, e-mail deve ter formato válido quando preenchido; nascimento deve ser uma data existente e não futura; peso deve ser positivo quando informado. A API recusa animais sem tutor existente e impede a exclusão de tutor com animais.

A interface destaca os campos com erro. O serviço retorna mensagens em JSON com códigos apropriados, como 422 para campos inválidos, 404 para registro inexistente e 409 para exclusão impedida pelo relacionamento.

**Link para `public/js/validation.mjs`:** [PREENCHER COM LINK GITHUB]

**Link para `public/js/forms.mjs`:** [PREENCHER COM LINK GITHUB]

**Links para as regras correspondentes na API e no repositório:** [PREENCHER]

**Capturas das mensagens e dos casos de erro testados pela equipe:** [PREENCHER]

# 10. Técnicas de clean code aplicadas

| Prática | Onde demonstrar | Explicação da escolha |
|---|---|---|
| Nomes significativos | [LINK para validateTutor, listAnimals, deleteTutor] | Os nomes indicam a entidade e a operação executada. |
| Funções curtas com responsabilidade única | [LINK para normalizePhone, positiveInteger, json] | Cada função resolve uma operação delimitada e pode ser testada separadamente. |
| Separação em camadas | [LINKS para interface, cliente HTTP, rotas, repositório e banco] | A apresentação não executa SQL; a camada de dados não monta as telas. |
| Ausência de código duplicado | [LINK para validation.mjs e seus imports no cliente e servidor] | As mesmas regras são reutilizadas, com revalidação obrigatória na API. |

**Revisão e melhorias realizadas pela equipe no código inicial:** [PREENCHER]

# 11. Declaração de uso de IA generativa

**Texto-base que deve ser ajustado para relatar o uso real:**

Foi utilizado o ChatGPT como apoio à preparação da versão inicial do projeto, incluindo proposta de estrutura, elaboração de interface, geração de código de serviço e acesso a dados, testes e rascunho de documentação. O site Heritage Animal Hospital foi indicado como referência visual. O uso de IA não dispensa a compreensão e a responsabilidade dos integrantes pelo código entregue.

**Outras ferramentas de IA, se utilizadas:** [PREENCHER OU INFORMAR QUE NÃO HOUVE]

**Partes que a equipe revisou, alterou e testou por conta própria:** [PREENCHER COM O QUE REALMENTE FOI FEITO]

> Não declare que não houve IA: esta base foi preparada com apoio do ChatGPT. Não afirme que a equipe revisou todo o código antes de essa revisão acontecer.

# 12. Considerações finais e aprendizados da equipe

[PREENCHER PELOS INTEGRANTES APÓS A IMPLEMENTAÇÃO, A REVISÃO E OS TESTES. NÃO INVENTAR EXPERIÊNCIAS.]

Relatem o que aprenderam sobre a comunicação entre interface e serviço, a relação entre tutores e animais, a diferença entre validação no navegador e no servidor e a publicação com banco persistente. Identifiquem dificuldades reais, soluções experimentadas e contribuições dos integrantes. Relacionem a experiência aos percursos da disciplina.

Limitações técnicas desta versão que podem ser discutidas, se pertinentes: demonstração compartilhada sem autenticação; ausência de agenda/prontuário; necessidade de imagens próprias/licenciadas e de infraestrutura adequada para uso real.

# 13. Referências

UNIVERSIDADE DE FORTALEZA. **N695 - Desenvolvimento de Plataformas Web: Proposta de Atividade e Modelo de Entrega.** 2026.2. Documento de 8 páginas fornecido para a atividade.

HERITAGE ANIMAL HOSPITAL. **Site institucional.** Disponível em: https://heritage-vets.com/. Referência visual indicada para esta adaptação. Acesso para a preparação inicial: 20 out. 2026.

NODE.JS. **HTTP: documentação oficial.** https://nodejs.org/api/http.html.

NODE.JS. **SQLite: documentação oficial.** https://nodejs.org/api/sqlite.html.

SQLITE. **SQLite Foreign Key Support.** https://sqlite.org/foreignkeys.html.

**Adicionar outras fontes efetivamente consultadas pela equipe e padronizar conforme a orientação da disciplina:** [PREENCHER]
