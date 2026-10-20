# Publicação e preparação do repositório

## Situação desta entrega

Os arquivos estão prontos para execução local. **Não existe um link público nem um repositório GitHub criado por esta entrega.** O PDF final precisa desses links reais.

## Antes de publicar

Substitua as fotografias vinculadas ao site de referência por imagens próprias/licenciadas, ou remova as tags `<img class="remote">` em `public/index.html`. A ilustração de reserva e os ícones locais continuam formando o layout.

Revise e compreenda o código com a equipe. Reexecute os testes e use apenas dados fictícios. Esta versão não possui login: é uma demonstração acadêmica compartilhada, não um sistema apto a tratar cadastros reais publicamente.

## GitHub

Crie um repositório público na conta da equipe e envie o código completo, preservando a organização. O `.gitignore` já exclui banco, arquivos de configuração local e dependências.

Não envie `data/patas-e-cia.sqlite`, senhas, arquivos `.env`, tokens, dados pessoais reais ou fontes de terceiros. O esquema do banco está em `database/schema.sql` e os dados fictícios podem ser gerados por `npm run seed`.

Façam commits ao longo do trabalho e confirmem o acesso em janela anônima. Depois, substituam os campos pendentes do modelo de entrega por links para os **arquivos reais do repositório**, preferencialmente com referência a um commit da versão entregue.

## Hospedagem necessária

A plataforma deve suportar processo Node.js, variável `PORT`, conexões HTTP e diretório gravável persistente. A API e os arquivos estáticos são servidos pelo mesmo processo, na mesma origem.

Configurações usuais:

```text
Comando de inicio: npm start
HOST: 0.0.0.0
PORT: fornecido pela hospedagem
DATA_DIR: caminho absoluto do disco persistente
PUBLIC_ORIGIN: https://endereco-real-da-aplicacao
```

Se a plataforma atribuir `PORT`, não substitua o valor por uma porta arbitrária. Configure HTTPS. `PUBLIC_ORIGIN` ajusta a verificação de origem e o cookie Secure para o acesso público HTTPS.

A hospedagem apenas de arquivos estáticos não executa este backend. Uma pasta temporária de deploy não substitui disco persistente. Para esta arquitetura, use uma instância do processo por banco SQLite, sem distribuir cópias independentes do banco entre várias instâncias.

Nenhum provedor, plano ou permanência de gratuidade foi verificado ou contratado nesta entrega.

## Opção com Docker

Foi incluído um Dockerfile para facilitar a preparação do ambiente. O contêiner não foi construído/testado nesta sessão; a execução validada foi diretamente em Node.js.

```bash
docker build -t patas-e-cia .
docker run --rm -p 3000:3000 -v patas_dados:/app/data patas-e-cia
```

O volume nomeado preserva o banco entre execuções. Em HTTPS atrás de proxy reverso, passe também `PUBLIC_ORIGIN` com a origem real. Não exponha este ambiente com dados reais.

## Validação final da publicação

Acesse o link em outro dispositivo e em janela anônima. Crie um tutor e um animal fictícios; tente excluir o tutor; confirme o bloqueio; edite e exclua os registros de teste. Reinicie a aplicação e verifique se os demais dados permanecem.

Confira a disponibilidade dos dois links até a data exigida no enunciado (10/12), o prazo de submissão (27/11) e a regra de que apenas commits até 27/11 serão considerados. A equipe deve confirmar as orientações oficiais da turma.
