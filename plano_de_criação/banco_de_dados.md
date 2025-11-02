# Documentação do Esquema do Banco de Dados (PostgreSQL V1)
# Projeto: BRZ Burg

Este documento é a "fonte da verdade" (source of truth) para a arquitetura do banco de dados `brzburg_db`. Ele detalha as 7 tabelas essenciais, suas colunas, seus relacionamentos e o código SQL para criá-las.

**Convenção:** Nomes de tabelas e colunas usam `snake_case`.

---

## Tabela 1: `funcionarios`

**Propósito:** Armazena os dados de login e função de todos os funcionários (`Admin`, `Cozinheiro`, `Garçom`). Esta é a tabela-mestra de autenticação e autorização.

### 1.1 O Esquema (As Colunas)

| Nome da Coluna | Tipo de Dado (PostgreSQL) | Regras/Notas |
| :--- | :--- | :--- |
| `id` | `SERIAL PRIMARY KEY` | Chave primária. `SERIAL` numera automaticamente (1, 2, 3...). |
| `nome` | `VARCHAR(255)` | O nome do funcionário. |
| `cpf` | `VARCHAR(11)` | CPF (só números). Deve ser **Único**. |
| `login` | `VARCHAR(100)` | O login usado na Tela de Login. Deve ser **Único** e **Não Nulo**. |
| `senha_hash` | `VARCHAR(255)` | A senha *criptografada* (hBcrypt). **Nunca** salve a senha real. |
| `funcao` | `VARCHAR(50)` | O papel do funcionário. Restrito a `ADMIN`, `COZINHEIRO` ou `GARCOM`. |
| `is_active` | `BOOLEAN` | `true` = Ativo, `false` = Inativo (para o "Histórico/Soft Delete"). `DEFAULT true`. |

### 1.2 Justificativa das Colunas

* `login`, `senha_hash`, `funcao`: Essenciais para a **API de Autenticação** (`POST /api/auth/login`) e para o roteamento baseado em função.
* `nome`, `cpf`, `funcao`: Usados pela **API de Gestão de Funcionários** (`POST /api/admin/funcionarios`).
* `is_active`: É a coluna-chave para o "soft delete", permitindo que o `DELETE /api/admin/funcionarios/{id}` (Arquivar) e o `GET /api/admin/funcionarios/historico` funcionem sem corromper o histórico de vendas.

### 1.3 O Código SQL

```sql
-- Cria a tabela 'funcionarios'
CREATE TABLE funcionarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(11) UNIQUE NOT NULL,
    login VARCHAR(100) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    
    -- Restringe a coluna 'funcao' para apenas os 3 valores que definimos
    funcao VARCHAR(50) NOT NULL CHECK (funcao IN ('ADMIN', 'COZINHEIRO', 'GARCOM')),
    
    -- 'DEFAULT true' significa que todo novo funcionário já começa como ativo
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- INICIALIZAÇÃO (Bootstrap): Insere o primeiro Admin para permitir o primeiro login.
-- NOTA: O 'admin_hash_exemplo' deve ser substituído por um hash Bcrypt real gerado pelo Java.
INSERT INTO funcionarios (nome, cpf, login, senha_hash, funcao)
VALUES ('Admin Principal', '00000000000', 'admin', 'admin_hash_exemplo', 'ADMIN');
``` 
## Tabela 2: `mesas`

**Propósito:** Armazena o mapa de mesas físicas do restaurante e seu status em tempo real.

### 2.1 O Esquema (As Colunas)

| Nome da Coluna | Tipo de Dado (PostgreSQL) | Regras/Notas |
| :--- | :--- | :--- |
| `id` | `SERIAL PRIMARY KEY` | Chave primária. Este `id` será usado na URL do QR Code (ex: `/m/9`). |
| `nome` | `VARCHAR(100)` | O nome da mesa (ex: "Mesa 01", "Balcão VIP"). `NOT NULL`. |
| `status` | `VARCHAR(50)` | O status em tempo real. Restrito a `LIVRE` ou `OCUPADA`. `DEFAULT 'LIVRE'`. |

### 2.2 Justificativa das Colunas

* `id`: É a chave que conecta o mundo físico (QR Code) ao digital. É usado pela API do Cliente (`/api/cliente/iniciar-sessao?mesaId=9`).
* `nome`: Usado pela API do Admin (`POST /api/admin/mesas`).
* `status`: É o coração do `PainelGarcom`. A API (`GET /api/garcom/dashboard`) lê esta coluna para pintar os cards de Verde (LIVRE) ou Amarelo (OCUPADA). É também a trava de segurança da API (`DELETE /api/admin/mesas/{id}`).

### 2.3 O Código SQL

```sql
-- Cria a tabela 'mesas'
CREATE TABLE mesas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    
    -- Restringe a coluna 'status' para apenas os 2 valores que definimos
    status VARCHAR(50) NOT NULL CHECK (status IN ('LIVRE', 'OCUPADA')) DEFAULT 'LIVRE'
);
```
## Tabela 3: `cardapio_secoes`

**Propósito:** Armazena as categorias do cardápio (ex: "Burgers", "Bebidas").

### 3.1 O Esquema (As Colunas)

| Nome da Coluna | Tipo de Dado (PostgreSQL) | Regras/Notas |
| :--- | :--- | :--- |
| `id` | `SERIAL PRIMARY KEY` | Chave primária. |
| `nome_secao` | `VARCHAR(100)` | O nome da seção. `UNIQUE` e `NOT NULL`. |

### 3.2 Justificativa das Colunas

* Esta tabela existe para **Normalização**. Ela garante que não haja erros de digitação (ex: "Burgers" vs "Burger") e permite ao Admin renomear uma seção inteira editando apenas uma linha.
* `id`: Será usado como Chave Estrangeira (`secao_id`) na próxima tabela (`cardapio_itens`) para agrupar os produtos.

### 3.3 O Código SQL

```sql
-- Cria a tabela 'cardapio_secoes'
CREATE TABLE cardapio_secoes (
    id SERIAL PRIMARY KEY,
    
    -- UNIQUE garante que você não possa ter duas seções com o mesmo nome
    nome_secao VARCHAR(100) UNIQUE NOT NULL
);
```
## Tabela 4: `cardapio_itens`

**Propósito:** Armazena cada produto individual que o restaurante vende.

### 4.1 O Esquema (As Colunas)

| Nome da Coluna | Tipo de Dado (PostgreSQL) | Regras/Notas |
| :--- | :--- | :--- |
| `id` | `SERIAL PRIMARY KEY` | Chave primária. |
| `secao_id` | `INTEGER` | **Chave Estrangeira** (liga com `cardapio_secoes.id`). `NOT NULL`. |
| `nome` | `VARCHAR(150)` | O nome do produto. `NOT NULL`. |
| `descricao` | `TEXT` | A descrição do produto. |
| `preco` | `DECIMAL(10, 2)` | O preço de venda (ex: 25.50). `NOT NULL`. |
| `imagem_url` | `VARCHAR(255)` | O caminho para a imagem (ex: "/uploads/burger.jpg"). |
| `is_active` | `BOOLEAN` | **(Soft Delete):** `false` = Arquivado. `NOT NULL DEFAULT true`. |
| `is_disponivel` | `BOOLEAN` | **(Controle do Dia):** `false` = Acabou hoje. `NOT NULL DEFAULT true`. |

### 4.2 Justificativa das Colunas

* `secao_id`: É a "cola" que liga este item à sua seção ("Burger").
* `nome`, `descricao`, `preco`, `imagem_url`: São os dados da API `POST /api/admin/cardapio/itens` (o upload `multipart/form-data`).
* `is_active`: É a coluna do "soft delete" (Arquivar). A API do Cliente **não** deve mostrar itens com `is_active = false`.
* `is_disponivel`: É o switch da "Tela de Controle do Dia". A API do Cliente **não** deve mostrar itens com `is_disponivel = false`.

### 4.3 O Código SQL

```sql
-- Cria a tabela 'cardapio_itens'
CREATE TABLE cardapio_itens (
    id SERIAL PRIMARY KEY,
    
    -- Chave Estrangeira que se conecta à tabela cardapio_secoes
    secao_id INTEGER NOT NULL,
    
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10, 2) NOT NULL CHECK (preco >= 0),
    imagem_url VARCHAR(255),
    
    -- Para o "Arquivar" do Admin (soft delete)
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Para o "Controle de Itens do Dia" (o switch "acabou hoje")
    is_disponivel BOOLEAN NOT NULL DEFAULT true,
    
    -- Define a relação: a coluna 'secao_id' aponta para 'id' da 'cardapio_secoes'.
    CONSTRAINT fk_secao
        FOREIGN KEY(secao_id) 
        REFERENCES cardapio_secoes(id)
        -- Impede o Admin de apagar uma Seção se ela ainda tiver itens.
        ON DELETE RESTRICT 
);
```
## Tabela 5: `comandas`

**Propósito:** Armazena o "carrinho de compras" de uma mesa. É o contêiner que agrupa os pedidos.

### 5.1 O Esquema (As Colunas)

| Nome da Coluna | Tipo de Dado (PostgreSQL) | Regras/Notas |
| :--- | :--- | :--- |
| `id` | `SERIAL PRIMARY KEY` | Chave primária. |
| `mesa_id` | `INTEGER` | **Chave Estrangeira** (liga com `mesas.id`). `NOT NULL`. |
| `status` | `VARCHAR(50)` | "ATIVA" ou "FECHADA". `NOT NULL DEFAULT 'ATIVA'`. |
| `status_solicitacao` | `VARCHAR(50)` | (Nulável) "PEDIU_CONTA". Usado para o alerta do Garçom. `DEFAULT NULL`. |
| `data_abertura` | `TIMESTAMP` | Hora que o primeiro item foi pedido. `NOT NULL DEFAULT NOW()`. |

### 5.2 Justificativa das Colunas

* `mesa_id`: É como a API do Cliente (`GET /api/cliente/iniciar-sessao`) encontra a comanda correta para a mesa escaneada.
* `status`: É a chave do ciclo de vida. A API do Garçom (`POST /api/garcom/comanda/fechar`) muda para "FECHADA".
* `status_solicitacao`: É a coluna que a API (`POST /api/cliente/pedir-conta`) atualiza e que a API (`GET /api/garcom/dashboard`) lê para gerar o alerta 💰.

### 5.3 O Código SQL

```sql
-- Cria a tabela 'comandas'
CREATE TABLE comandas (
    id SERIAL PRIMARY KEY,
    
    -- Chave Estrangeira que se conecta à tabela mesas
    mesa_id INTEGER NOT NULL,
    
    -- Status principal da comanda (se está em andamento ou finalizada)
    status VARCHAR(50) NOT NULL CHECK (status IN ('ATIVA', 'FECHADA')) DEFAULT 'ATIVA',
    
    -- Status secundário para alertas (ex: cliente pediu a conta)
    status_solicitacao VARCHAR(50) CHECK (status_solicitacao IN ('PEDIU_CONTA', NULL)) DEFAULT NULL,
    
    -- Guarda a data e hora que a comanda foi aberta
    data_abertura TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Define a relação: a coluna 'mesa_id' aponta para 'id' da 'mesas'.
    CONSTRAINT fk_mesa
        FOREIGN KEY(mesa_id) 
        REFERENCES mesas(id)
        -- Impede o Admin de apagar uma Mesa se ela tiver comandas associadas.
        ON DELETE RESTRICT 
);
```
## Tabela 6: `item_pedido`

**Propósito:** A tabela **mais importante da operação**. Armazena cada item individual de cada comanda. É o que o KDS lê.

### 6.1 O Esquema (As Colunas)

| Nome da Coluna | Tipo de Dado (PostgreSQL) | Regras/Notas |
| :--- | :--- | :--- |
| `id` | `SERIAL PRIMARY KEY` | Chave primária. |
| `comanda_id` | `INTEGER` | **Chave Estrangeira** (liga com `comandas.id`). `NOT NULL`. |
| `item_id` | `INTEGER` | **Chave Estrangeira** (liga com `cardapio_itens.id`). `NOT NULL`. |
| `quantidade` | `INTEGER` | A quantidade pedida (ex: 2). `NOT NULL`. |
| `observacao` | `TEXT` | O texto de observação (ex: "sem cebola"). |
| `preco_no_momento` | `DECIMAL(10, 2)` | **Crucial:** O preço do item *no momento* da venda. `NOT NULL`. |
| `status` | `VARCHAR(50)` | O status do KDS. "PENDENTE", "EM_PREPARO", "CONCLUIDO", "CANCELADO", "DEVOLVIDO". |
| `timestamp_pedido` | `TIMESTAMP` | A hora exata do pedido. `NOT NULL DEFAULT NOW()`. |

### 6.2 Justificativa das Colunas

* `comanda_id`: Agrupa os itens no mesmo "carrinho".
* `item_id`: Identifica *o que* foi pedido.
* `quantidade`, `observacao`: Dados da API `POST /api/cliente/pedido`.
* `preco_no_momento`: **Trava de Segurança do Dashboard**. Garante que relatórios antigos não mudem se o Admin atualizar o preço do item no `cardapio_itens`.
* `status`: É o **motor do KDS** e das cores (Verde, Vermelho, Cinza). É lido pela API `GET /api/kds/dashboard` e escrito pelas APIs de Cliente, Cozinheiro e Garçom.
* `timestamp_pedido`: É a coluna usada pela API de cancelamento para validar a **"Regra Híbrida de 60 segundos"**.

### 6.3 O Código SQL

```sql
-- Cria a tabela 'item_pedido'
CREATE TABLE item_pedido (
    id SERIAL PRIMARY KEY,
    
    -- Chave Estrangeira que se conecta à tabela comandas
    comanda_id INTEGER NOT NULL,
    
    -- Chave Estrangeira que se conecta à tabela cardapio_itens
    item_id INTEGER NOT NULL,
    
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    observacao TEXT,
    
    -- Guarda o preço do item no momento exato da venda (para proteger o histórico)
    preco_no_momento DECIMAL(10, 2) NOT NULL,
    
    -- O status de produção do item, lido pelo KDS
    status VARCHAR(50) NOT NULL CHECK (
        status IN ('PENDENTE', 'EM_PREPARO', 'CONCLUIDO', 'CANCELADO', 'DEVOLVIDO')
    ) DEFAULT 'PENDENTE',
    
    -- Guarda a data e hora que o item foi pedido (para a regra de 60s)
    timestamp_pedido TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Define a relação com a comanda
    CONSTRAINT fk_comanda
        FOREIGN KEY(comanda_id) 
        REFERENCES comandas(id)
        ON DELETE RESTRICT,
        
    -- Define a relação com o item do cardápio
    CONSTRAINT fk_item
        FOREIGN KEY(item_id) 
        REFERENCES cardapio_itens(id)
        ON DELETE RESTRICT
);
```
## Tabela 7: `contas_fechadas`

**Propósito:** O "livro-caixa" financeiro. Armazena o registro de cada transação concluída para alimentar o Dashboard.

### 7.1 O Esquema (As Colunas)

| Nome da Coluna | Tipo de Dado (PostgreSQL) | Regras/Notas |
| :--- | :--- | :--- |
| `id` | `SERIAL PRIMARY KEY` | Chave primária. |
| `comanda_id` | `INTEGER` | **Chave Estrangeira** (liga com `comandas.id`). `UNIQUE`. |
| `funcionario_id` | `INTEGER` | **Chave Estrangeira** (liga com `funcionarios.id`). `NOT NULL`. |
| `valor_total` | `DECIMAL(10, 2)` | O valor final pago. `NOT NULL`. |
| `metodo_pagamento` | `VARCHAR(50)` | "PIX", "Cartão" ou "Dinheiro". `NOT NULL`. |
| `data_fechamento` | `TIMESTAMP` | A hora exata do fechamento. `NOT NULL DEFAULT NOW()`. |

### 7.2 Justificativa das Colunas

* `comanda_id`: Liga o registro financeiro à comanda operacional. `UNIQUE` garante que uma comanda não possa ser paga duas vezes.
* `funcionario_id`: **(Auditoria)** É o que a API `GET /api/reports/vendas-garcom` usa para agrupar as vendas por funcionário.
* `valor_total`: Usado pela API `GET /api/reports/kpis` para calcular a "Receita Total".
* `metodo_pagamento`: **(Correção)** É o dado que o Garçom insere no `Popup de Pagamento` (Tela 3.4). É lido pela API `GET /api/reports/vendas-pagamento`.
* `data_fechamento`: A coluna **mais importante** para o Dashboard. É usada por *todas* as APIs de relatório (`/api/reports/...`) para filtrar por data (Hoje, Semana, Mês).

### 7.3 O Código SQL

```sql
-- Cria a tabela 'contas_fechadas'
CREATE TABLE contas_fechadas (
    id SERIAL PRIMARY KEY,
    
    -- Chave Estrangeira que se conecta à tabela comandas
    -- UNIQUE garante que uma comanda não possa ser fechada duas vezes
    comanda_id INTEGER NOT NULL UNIQUE,
    
    -- Chave Estrangeira que se conecta à tabela funcionarios (quem fechou a conta)
    funcionario_id INTEGER NOT NULL,
    
    valor_total DECIMAL(10, 2) NOT NULL,
    
    -- Restringe o método de pagamento aos 3 que definimos
    metodo_pagamento VARCHAR(50) NOT NULL CHECK (metodo_pagamento IN ('PIX', 'Cartão', 'Dinheiro')),
    
    -- Guarda a data e hora do fechamento (para os filtros do Dashboard)
    data_fechamento TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Define a relação com a comanda
    CONSTRAINT fk_comanda_fechada
        FOREIGN KEY(comanda_id) 
        REFERENCES comandas(id)
        ON DELETE RESTRICT,
        
    -- Define a relação com o funcionário
    CONSTRAINT fk_funcionario_fechou
        FOREIGN KEY(funcionario_id) 
        REFERENCES funcionarios(id)
        -- Impede o Admin de apagar um Funcionário se ele tiver histórico de vendas.
        ON DELETE RESTRICT 
);
```