# Matriz de requisitos - Cenário 1

## Base do enunciado

Fonte: `N695_Proposta_de_Trabalho_2026_2.pdf`, fornecido pelo usuário, páginas 2 e 3 para o cenário; páginas 1, 2 e 4 a 8 para escopo, entrega e avaliação.

O cenário descreve a Clínica Patas & Cia, com registros em caderno, e solicita um sistema Web de cadastro de **Tutor e Animal**. O relato sobre consultas é contexto do problema, não uma exigência de implementar uma terceira entidade de agendamentos.

| Requisito do enunciado | Implementação desta versão | Evidência sugerida |
|---|---|---|
| Criar, listar, atualizar e excluir tutores | Página Tutores + API `/api/tutores` | Lista, formulário e requisições |
| Criar, listar, atualizar e excluir animais | Página Animais e animais do tutor + API `/api/animais` | Lista e formulário |
| Um tutor pode ter vários animais | `animais.tutor_id` referencia `tutores.id` | Ficha do tutor e esquema do banco |
| Cada animal pertence a um tutor | Referência obrigatória e chave estrangeira | Cadastro sem tutor rejeitado |
| Lista de tutores | `painel.html#tutores` | Captura de tela |
| Cadastro/edição de tutor | Formulário modal reutilizável | Captura de cadastro e edição |
| Lista de animais de um tutor com cadastro/edição | `painel.html#tutores/ID` | Captura do vínculo e formulário |
| Campos obrigatórios | Validação compartilhada, aplicada novamente na API | Mensagens por campo e HTTP 422 |
| Telefone em formato válido | DDD + fixo com 10 dígitos ou celular com 11; aceita `+55` | Telefone inválido rejeitado |
| Impedir exclusão de tutor com animais | API HTTP 409 + transação + chave estrangeira RESTRICT | Mensagem de bloqueio e teste |
| Interface consome serviço próprio | Cliente HTTP com `fetch`; API Node.js | Aba Network do navegador |
| Persistência em banco | SQLite em disco, fora da pasta pública | Reiniciar e confirmar os cadastros |
| Mensagens claras e tratamento de erros | Campos destacados, confirmações e mensagens de conexão | Capturas dos erros |
| Nomes significativos e separação em camadas | Interface, validação, roteamento e repositório | Links para arquivos do GitHub |
| Repositório público e aplicação publicada | Pendente de ação da equipe | Links reais após publicação |
| PDF no modelo obrigatório | Base Markdown em 13 seções; PDF final pendente | PDF revisado pela equipe |

## Escolhas do projeto que não foram detalhadas pelo enunciado

O PDF não fornece uma lista exata de atributos. Para esta implementação, foram definidos:

**Tutor:** nome e telefone obrigatórios; e-mail, bairro e observações opcionais. Identificador e datas de criação/atualização são automáticos.

**Animal:** nome, espécie e tutor obrigatórios; raça, sexo, nascimento, peso e observações opcionais. Identificador e datas são automáticos.

As espécies iniciais são cachorro, gato, ave, coelho e outro. O sistema verifica formato de telefone, não a existência da linha telefônica. Validações adicionais de e-mail, data existente/não futura e peso positivo são decisões desta implementação, não novas exigências do enunciado.

Painel de indicadores, busca, filtro por espécie, paginação e site institucional são recursos adicionais.

## Antes de entregar

- Formar equipe de 4 a 6 integrantes; confirmar alocação no AVA.
- Inserir nome completo e matrícula de **todos** na capa.
- Produzir um único PDF de **8 a 20 páginas**, na ordem dos 13 tópicos; usar links para código no GitHub, não colar o código no PDF.
- Publicar a aplicação com banco persistente e tornar o repositório público; testar os links em janela anônima.
- Declarar o uso de IA, as ferramentas e as finalidades.
- Registrar o desenvolvimento com commits. O enunciado considera apenas commits até **27/11** e exige acessibilidade da aplicação e do repositório até **10/12**.
- Cada integrante deve submeter o PDF no AVA até **27/11**. Conferir também eventuais comunicações oficiais da turma.

A conclusão da implementação, isoladamente, não garante pontuação: a rubrica inclui funcionamento publicado, documentação, evidências e reflexão da equipe.
