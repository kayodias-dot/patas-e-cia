# Verificações realizadas e roteiro de revisão

## Testes automatizados de regras e API

**Ambiente:** Node.js 22.16.0 em Linux. Banco SQLite real, criado em diretório temporário e removido ao final dos testes. Comando: `npm test`.

**Resultado:** 64 testes aprovados, zero falhas, zero testes ignorados. Os arquivos de teste estão em `tests/validation.test.mjs` e `tests/api.test.mjs`.

Cobertura de comportamento: campos obrigatórios, formato/normalização de telefone, e-mail opcional, limites de campos, tipos inválidos, espécie, vínculo com tutor, peso, datas, busca sem acentos, CRUD para ambas as entidades, filtro por tutor, paginação, exclusão protegida, restrição direta de chave estrangeira, transferência de animal, persistência após reinício, CSRF/origem, JSON inválido ou grande demais, Content-Type e arquivos internos não expostos.

Isso não é uma afirmação de cobertura de 100% das linhas nem uma auditoria completa de segurança.

## Verificação da interface

Foi usado Chromium headless com Playwright para renderizar a interface e exercitar cadastros, telefone inválido, vínculo tutor/animal, ficha, edição, exclusão bloqueada e exclusão após retirar o vínculo.

Foram verificadas as páginas inicial, painel, tutores, animais e animais de um tutor nas larguras 320, 390, 768, 1024 e 1440 pixels: **25 combinações, sem rolagem horizontal da página detectada**. Não houve exceções JavaScript no fluxo executado. O menu de gestão e o formulário também foram abertos em tamanho de celular.

**Condição do ambiente:** o navegador deste ambiente bloqueia a navegação direta para URLs locais. Por isso, a interface foi renderizada em um documento isolado, com os módulos reunidos para teste e as chamadas HTTP encaminhadas à API local real. Nenhuma política do navegador foi alterada. Os testes HTTP/SQLite separados acessaram diretamente o servidor local.

As imagens externas foram bloqueadas durante a verificação visual; as capturas mostram a ilustração de reserva. Isso **não** verifica o carregamento das fotografias na internet, a correspondência pixel a pixel com a referência ou a navegação em uma hospedagem pública.

As capturas em `evidencias/` são evidências de desenvolvimento. Algumas mostram registros temporários chamados “Tutor Browser Teste” e “Pet Browser Teste”, removidos depois do fluxo automatizado. Não são pessoas ou pacientes reais.

## O que a equipe ainda precisa verificar

Reexecute `npm test` no computador usado no desenvolvimento. Abra a aplicação via HTTP no navegador do Windows e teste as operações normalmente. Teste em um celular real e nos navegadores que forem usados na apresentação. O lançador Windows e os comandos PowerShell são fornecidos, mas não foram executados em um Windows nesta sessão.

Após publicar, repita o fluxo completo, confirme o HTTPS, o disco persistente e o acesso aos links em janela anônima. Verifique o comportamento de duas pessoas editando os mesmos registros: esta versão não possui detecção de conflito de edição; a última gravação prevalece.

## Roteiro curto de demonstração

1. Mostrar o site e abrir a gestão.
2. Criar um tutor fictício, demonstrando a mensagem de telefone inválido antes de corrigir.
3. Abrir esse tutor e cadastrar dois animais relacionados.
4. Editar um dos animais, consultar sua ficha e filtrar a lista.
5. Tentar excluir o tutor e mostrar que a API retorna HTTP 409.
6. Excluir ou transferir os animais; só então excluir o tutor.
7. Reiniciar o servidor e mostrar que os demais cadastros permanecem.
8. Apresentar a organização das camadas, os testes e os links da versão publicada.
