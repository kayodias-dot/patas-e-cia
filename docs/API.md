# API HTTP - Patas & Cia

Base local: `http://localhost:3000/api`. A API é da própria aplicação. As requisições de escrita usam JSON, cookie de formulário e cabeçalho `X-CSRF-Token`.

**Atenção:** o token protege o contexto do formulário, mas não autentica um usuário. Este é um ambiente acadêmico compartilhado, somente para dados fictícios.

## Rotas

| Método | Rota | Finalidade |
|---|---|---|
| GET | /session | Obter token CSRF e cookie |
| GET | /health | Verificar funcionamento |
| GET | /stats | Indicadores e animais recentes |
| GET | /tutores | Listar tutores |
| GET | /tutores/ID | Consultar tutor e quantidade de animais |
| POST | /tutores | Criar tutor |
| PUT | /tutores/ID | Substituir os campos editáveis do tutor |
| DELETE | /tutores/ID | Excluir tutor sem animais |
| GET | /animais | Listar animais |
| GET | /animais/ID | Consultar animal e tutor |
| POST | /animais | Criar animal |
| PUT | /animais/ID | Substituir os campos editáveis do animal |
| DELETE | /animais/ID | Excluir animal |

Filtros em listas: `q`, `page` e `limit`. A lista de animais aceita também `tutor_id` e `especie`. O limite máximo é 100 registros por página. Valores aceitos para espécie: `cao`, `gato`, `ave`, `coelho`, `outro`.

Exemplo: `GET /api/animais?tutor_id=1&especie=gato&page=1&limit=10`.

Uma resposta de lista tem `data` e `meta`, contendo `total`, `page`, `limit` e `pages`. Cadastro/edição retorna o registro em `data`. Criação retorna HTTP 201 e o cabeçalho Location. Erros têm um objeto `error`, com `code`, `message` e, quando aplicável, `fields`.

## Demonstração pelo PowerShell

Execute com o servidor aberto. Utilize somente registros fictícios. Os comandos criam um tutor e um animal; não alteram cadastros preexistentes.

```powershell
$base = "http://localhost:3000"
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$handshake = Invoke-RestMethod -Uri "$base/api/session" -WebSession $session
$headers = @{ "X-CSRF-Token" = $handshake.data.csrf }

$tutorBody = @{
  nome = "Tutor Exemplo API"
  telefone = "85900000777"
  email = "exemplo@example.com"
  bairro = "Bairro de teste"
  observacoes = "Registro ficticio para demonstracao."
} | ConvertTo-Json

$tutor = Invoke-RestMethod -Method Post -Uri "$base/api/tutores" `
  -WebSession $session -Headers $headers -ContentType "application/json" `
  -Body ([System.Text.Encoding]::UTF8.GetBytes($tutorBody))

$tutor | ConvertTo-Json -Depth 5
$tutorId = $tutor.data.id

$animalBody = @{
  nome = "Animal Exemplo API"
  tutor_id = $tutorId
  especie = "cao"
  sexo = "nao_informado"
  peso_kg = 7.5
} | ConvertTo-Json

$animal = Invoke-RestMethod -Method Post -Uri "$base/api/animais" `
  -WebSession $session -Headers $headers -ContentType "application/json" `
  -Body ([System.Text.Encoding]::UTF8.GetBytes($animalBody))

$animal | ConvertTo-Json -Depth 5
$animalId = $animal.data.id

Invoke-RestMethod "$base/api/animais?tutor_id=$tutorId" | ConvertTo-Json -Depth 5

# Esta tentativa DEVE retornar HTTP 409, pois o tutor tem um animal:
try {
  Invoke-RestMethod -Method Delete -Uri "$base/api/tutores/$tutorId" `
    -WebSession $session -Headers $headers
} catch {
  $_.ErrorDetails.Message
}

# Depois de registrar a evidencia, remova somente os registros deste exemplo:
Invoke-RestMethod -Method Delete -Uri "$base/api/animais/$animalId" `
  -WebSession $session -Headers $headers
Invoke-RestMethod -Method Delete -Uri "$base/api/tutores/$tutorId" `
  -WebSession $session -Headers $headers
```

As instruções PowerShell são um roteiro de reprodução; não foram executadas em um Windows nesta preparação. Os endpoints correspondentes foram testados por HTTP no ambiente Node.js.

## Evidências no navegador

Abra a gestão, pressione F12 e selecione **Network/Rede**. Execute um cadastro ou uma edição. Na solicitação `/api/tutores` ou `/api/animais`, capture método, corpo enviado, status e resposta. Registre também uma validação inválida pela API e a exclusão bloqueada com status 409.

O formulário pode rejeitar dados inválidos antes de enviar a requisição. Para demonstrar especificamente a validação **do servidor**, use uma ferramenta HTTP com sessão/token ou adapte os testes automatizados, sem remover a validação da aplicação final.

## Códigos de erro principais

400: JSON, identificador ou filtro inválido. 403: token/origem de formulário inválido. 404: rota ou registro inexistente. 405: método não permitido. 409: tutor com animais não pode ser excluído. 413: JSON maior que 24 KiB. 415: Content-Type diferente de application/json. 422: campos inválidos ou tutor de animal inexistente. 500: falha interna, sem exposição dos detalhes na interface.
