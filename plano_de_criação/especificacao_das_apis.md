# Especificação do Contrato de API (V1): BRZ Burg (Corrigido)

Este documento define todos os endpoints da API para a comunicação between o front-end (React) e o back-end (Java).

## 1. API de Autenticação

### `POST /api/auth/login`
* **Função:** Autentica um funcionário e retorna um token de acesso.
* **Requisição (Body JSON):** `{ "login": "...", "senha": "..." }`
* **Resposta (Sucesso 200 OK):** `{ "token": "...", "usuario": { "nome": "...", "funcao": "ADMIN" } }`

---

## 2. API do Cliente

### `GET /api/cliente/iniciar-sessao?mesaId=9`
* **Função:** Busca o cardápio (apenas itens `is_active=true` E `isDisponivel=true`) e a comanda ativa.
* **Resposta (Sucesso 200 OK):** `{ "nomeRestaurante": "...", "cardapio": [ ... ], "comanda": { ... } }`

### `POST /api/cliente/pedido`
* **Função:** Adiciona um novo item à comanda.
* **Requisição (Body JSON):** `{ "mesaId": 9, "itemId": 101, "quantidade": 1, "observacao": "..." }`
* **Resposta (Sucesso 201 Created):** Retorna o objeto `comanda` atualizado.

### `GET /api/cliente/comanda?mesaId=9`
* **Função:** Chamada de **Polling (10s)**. Busca a comanda ativa para atualizar status.
* **Resposta (Sucesso 200 OK):** O objeto `comanda` (ou `null`).

### `POST /api/cliente/pedido/cancelar`
* **Função:** Solicita o cancelamento de um item.
* **Requisição (Body JSON):** `{ "itemPedidoId": 501, "quantidadeCancelar": 1 }`
* **Implementação (Back-end):** Valida a **Regra Híbrida** (60s ou Pendente).
* **Resposta (Erro 403 Forbidden):** Se a regra de cancelamento falhar.

### `POST /api/cliente/pedir-conta`
* **Função:** Envia um alerta para os garçons.
* **Requisição (Body JSON):** `{ "mesaId": 9 }`

---

## 3. API do KDS (Cozinheiro)

### `GET /api/kds/dashboard`
* **Função:** Chamada de **Polling (5s)**. Busca todos os itens para as 3 colunas (Pendentes, Em Preparo, Finalizados).
* **Resposta (Sucesso 200 OK):** `{ "pendentes": [ ... ], "emPreparo": [ ... ], "finalizados": [ {..., "statusFinal": "CONCLUIDO" | "CANCELADO" | "DEVOLVIDO"} ] }`

### `POST /api/kds/pedido/atualizar-status`
* **Função:** Move um item na linha de produção.
* **Segurança:** O Back-end **DEVE** verificar se a função (`role`) é `COZINHEIRO`.
* **Requisição (Body JSON):** `{ "itemPedidoId": 502 }`

---

## 4. API do Garçom

### `GET /api/garcom/dashboard`
* **Função:** Chamada de **Polling (10s)**. Busca alertas e status das mesas.
* **Resposta (Sucesso 200 OK):** `{ "alertas": [ ... ], "mesas": [ { "mesaId": 1, "status": "LIVRE" } ... ] }`

### `GET /api/garcom/comanda/{mesaId}`
* **Função:** Busca os detalhes de uma comanda específica.
* **Resposta (Sucesso 200 OK):** O objeto `comanda`.

### `POST /api/garcom/pedido/devolver`
* **Função:** Marca um item como devolvido.
* **Requisição (Body JSON):** `{ "itemPedidoId": 501, "quantidadeDevolver": 1 }`
* **Resposta (Sucesso 200 OK):** Retorna o objeto `comanda` atualizado (item ficará Cinza).

### `POST /api/garcom/comanda/fechar`
* **Função:** Fecha a conta de uma mesa, registrando o método de pagamento.
* **Requisição (Body JSON):**
    ```json
    {
      "mesaId": 9,
      "metodoPagamento": "PIX"
    }
    ```
* **Implementação (Back-end):** Salva o `funcionarioId` (do token) e o `metodoPagamento` na tabela `contas_fechadas`.
* **Resposta (Sucesso 200 OK):** `{ "status": "sucesso", "mensagem": "Mesa 9 fechada." }`

---

## 5. API do Administrador

### 5.1. Gerenciar Cardápio
* `GET /api/admin/cardapio-editor`: Busca todas as seções e itens (incluindo `isArchived`).
* **`POST /api/admin/cardapio/itens`:**
    * **Função:** Cria um novo item (com upload de imagem).
    * **Tipo de Requisição:** `multipart/form-data` (NÃO é JSON).
    * **Requisição (Body):** O "pacote" FormData contendo os campos: `nome` (Texto), `preco` (Texto), `descricao` (Texto), `secaoId` (Texto), `imagem` (Arquivo).
    * **Implementação (Back-end):** Salva o arquivo, obtém a URL e salva o item no banco em uma única transação.
* `PUT /api/admin/cardapio/itens/{itemId}`: Atualiza dados de um item (sem imagem, para simplificar V1).
* `DELETE /api/admin/cardapio/itens/{itemId}`: **Arquiva (Soft Delete)** (`is_active = false`).
* `POST /api/admin/cardapio/itens/{itemId}/restaurar`: **Restaura** (`is_active = true`).

### 5.2. Controle de Itens do Dia
* `GET /api/admin/itens-disponibilidade`: Busca itens e seus status `isDisponivel`.
* `PUT /api/admin/itens-disponibilidade/{itemId}`: Altera instantaneamente a disponibilidade.
    * **Requisição (Body JSON):** `{ "isDisponivel": false }`

### 5.3. Gerenciar Mesas (CORRIGIDO)
* `GET /api/admin/mesas`: Busca todas as mesas e seus `status` (LIVRE/OCUPADA).
* `POST /api/admin/mesas`: Cria uma nova mesa.
    * **Requisição (Body JSON):** `{ "nomeMesa": "Mesa 10" }`
* `DELETE /api/admin/mesas/{mesaId}`: Exclui uma mesa.
    * **Regra (Back-end):** **Bloqueia** se `status="OCUPADA"` (retorna Erro 409).

### 5.4. Gestão de Funcionários
* `GET /api/admin/funcionarios`: Busca funcionários `is_active=true`.
* `GET /api/admin/funcionarios/historico`: Busca funcionários `is_active=false` (soft-deleted).
* `POST /api/admin/funcionarios`: Cria um novo funcionário.
    * **Requisição (Body JSON):** `{ "nome": "...", "cpf": "...", "login": "...", "senha": "...", "funcao": "GARCOM" }`
* `PUT /api/admin/funcionarios/{funcionarioId}`: Atualiza dados (incluindo `senha` e `funcao`).
* `DELETE /api/admin/funcionarios/{funcionarioId}`: **Arquiva (Soft Delete)** (`is_active = false`).

### 5.5. Dashboard (Relatórios)
Todos os endpoints aceitam parâmetros de data: `?inicio=AAAA-MM-DD&fim=AAAA-MM-DD`.

* `GET /api/reports/kpis`: Retorna `{ receitaTotal, comandasFechadas, ticketMedio }`.
* `GET /api/reports/top-items`: Retorna `[ { nome, vendidos }, ... ]`.
* `GET /api/reports/perdas`: Retorna `{ cancelados: {total, valor}, devolvidos: {total, valor} }`.
* `GET /api/reports/vendas-garcom`: Retorna `[ { nomeGarcom, comandasFechadas, receitaGerada }, ... ]`.
* `GET /api/reports/vendas-hora`: Retorna `[ { hora, totalVendido }, ... ]`.
* `GET /api/reports/vendas-pagamento`: Retorna `[ { metodo, total }, ... ]`.