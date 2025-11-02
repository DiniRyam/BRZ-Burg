#  Documentação de Fluxos e Telas: Sistema de Gestão de Restaurante (V1)

Este documento é a "fonte da verdade" (source of truth) para o design de front-end, fluxos de usuário e regras de negócio do sistema.

## 1. Estratégia Técnica Principal (Decisões Globais)

* **Stack de Front-end:** React (com **v0** para geração de UI) e Tailwind CSS.
* **Back-end:** Java (usando **Spring Boot**).
* **Banco de Dados:** PostgreSQL (rodando localmente).
* **Comunicação:** API REST (JSON e Multipart/form-data).
* **Tempo Real (Simplificado):** **Sem WebSockets**. Usaremos **Polling (atualização automática `setInterval`)**:
    * **KDS (Cozinha):** Polling agressivo a cada **5 segundos**.
    * **Garçom & Cliente:** Polling padrão a cada **10 segundos**.
* **Autenticação:**
    * Uma tela de `Login` única é obrigatória para todos os funcionários (`Admin`, `Cozinheiro`, `Garçom`).
    * O `Admin` principal já vem cadastrado no banco.
    * O sistema usa **Roteamento Baseado em Função** (RBAC). O front-end (React) direcionará o usuário para a tela correta com base na função retornada pela API.
    * O `Cliente` não faz login.

## 2. Estratégia de Reutilização de Componentes

O desenvolvimento será focado em **componentes reutilizáveis** ("Blocos de Lego") para reduzir o trabalho.

* **Componentes de UI (Lego):** `Modal` (popup), `Card` (item, mesa, etc.), `Button`.
* **Componentes de Fluxo (Módulos):**
    * **`ComandaView.js`**: Usada pelo `Cliente` (com `role="cliente"`) e `Garçom` (com `role="garcom"`).
    * **`PainelKDS.js`**: Usada pelo `Cozinheiro` (com `readOnly={false}`) e `Admin` (com `readOnly={true}`).
    * **`PainelGarcom.js`**: Usada pelo `Garçom` e `Admin` (ambos com funcionalidade total).

---

## 3. Fluxo do Ator: Cliente (Interface do QR Code)

### Tela 1.1: Cardápio Digital
* **Fluxo:** Cliente escaneia QR Code, vê o cardápio. Ícone de "Comanda" (carrinho) está **desabilitado (Cinza)**. Clica em "Adicionar" em um item.

### Tela 1.2: Popup de Adição de Item
* **Fluxo:**
    1.  Cliente seleciona `quantidade` e `observacao`.
    2.  **Regra de Negócio (Validação):** Se `quantidade > 1`, um texto de ajuda aparece: *"Para itens com observações diferentes, por favor, adicione-os separadamente."*
    3.  Cliente clica em "Confirmar Adição".
    4.  O ícone "Comanda" (Tela 1.1) agora fica **ativo (Verde)**.
    5.  O item é enviado ao KDS.

### Tela 1.3: Tela "Minha Comanda"
* **Acesso:** Cliente clica no ícone "Comanda" (agora ativo).
* **Visual:** Carrega o `ComandaView`. Lista todos os itens, status (Pendente, Em Preparo, etc.) e o `Valor Total`.
* **Fluxo (Polling):** A tela usa **polling de 10 segundos** para atualizar o `status` dos itens.
* **Cores de Status:**
    * **Vermelho:** Item cancelado pelo cliente.
    * **Cinza:** Item devolvido pelo garçom.
* **Ações:**
    1.  **Botão "Cancelar Item"**: Abre o `Popup de Cancelamento` (1.4).
    2.  **Botão "Pedir Conta"**: Envia um alerta para o `PainelGarcom` (Tela 3.1).

### Tela 1.4: Popup de Cancelamento
* **Fluxo:**
    1.  Cliente seleciona a quantidade a cancelar.
    2.  Ao confirmar, o sistema valida a **Regra Híbrida de Cancelamento**:
        * **PERMITIDO se:** `(Tempo de Pedido < 60 segundos)` **OU** `(Status do Item == "Pendente")`.
        * **BLOQUEADO se:** A regra falhar (ex: se passaram 60s **E** o item já está "Em Preparo").

---

## 4. Fluxo do Ator: Cozinheiro (KDS)

### Tela 2.1: Painel KDS (Tela Única)
* **Acesso:** `Cozinheiro` faz login e esta é sua única tela (componente `PainelKDS`).
* **Visual:** Painel Kanban com 3 colunas: `Pendentes`, `Em Preparo`, `Finalizados / Outros`.
* **Fluxo (Polling):** Usa **polling agressivo de 5 segundos** para buscar novos pedidos.
* **Ações:**
    1.  Um novo pedido surge em `Pendentes`.
    2.  Cozinheiro clica no card -> Popup -> "Atualizar Status" -> Card move para `Em Preparo`.
    3.  Cozinheiro clica no card `Em Preparo` -> Popup -> "Atualizar Status".
    4.  O card move para `Finalizados / Outros` com a cor **Verde (Concluído)**.
* **Gatilho:** A mudança para "Concluído" dispara o alerta "Pedido Pronto!" no `PainelGarcom`.
* **Cores de Status (Coluna 3):**
    * **Verde:** Concluído (pelo Cozinheiro).
    * **Vermelho:** Cancelado (pelo Cliente).
    * **Cinza:** Devolvido (pelo Garçom). Se um Garçom devolve um item, o card (que estava Verde) **muda de cor para Cinza**.

---

## 5. Fluxo do Ator: Garçom

### Tela 3.1: Painel Principal do Garçom
* **Acesso:** `Garçom` faz login (componente `PainelGarcom`).
* **Visual:** Tela com duas abas.
* **Fluxo (Polling):** Usa **polling de 10 segundos**.
* **Aba 1: "ALERTAS":** Lista de ações urgentes (ex: "🍽️ MESA 9: Pedido Pronto!", "💰 MESA 12: Pediu a Conta!").
* **Aba 2: "TODAS AS MESAS":** Grade de cards com status `Verde (Livre)` ou `Amarelo (Ocupada)`.

### Tela 3.2: Tela de Comanda (Visão do Garçom)
* **Acesso:** Clicando em um alerta ou card de mesa.
* **Visual:** Carrega o `ComandaView` com `role="garcom"`.
* **Ações:**
    * **Botão "Devolver Item"**: Abre o `Popup de Devolução` (3.3).
    * **Botão "Fechar Conta"**: **(CORRIGIDO)** Abre o `Popup de Pagamento` (3.4).

### Tela 3.3: Popup de Devolução
* **Visual:** Popup modal que pergunta "Quantos itens devolver?".
* **Fluxo:** Ao confirmar, o card na comanda (3.2) fica **Cinza** e o KDS (2.1) é atualizado (o card Verde vira Cinza).

### Tela 3.4: Popup de Pagamento
* **Acesso:** Garçom clica em "Fechar Conta".
* **Visual:** Um popup modal com:
    * Título: "Fechar Conta"
    * Texto: "Valor Total: R$ 52,00"
    * Instrução: "Selecione o método de pagamento:"
    * **Botões:** `[ PIX ]` `[ Cartão ]` `[ Dinheiro ]`
* **Fluxo:**
    1.  Garçom realiza o pagamento físico.
    2.  Garçom clica no método correspondente no popup (ex: "PIX").
    3.  A API `POST /api/garcom/comanda/fechar` é chamada com o método de pagamento.
    4.  **Regra de Auditoria:** O back-end salva o `id` do garçom e o método de pagamento na `Conta` final.
    5.  A mesa é liberada e seu status muda para `Livre (Verde)` na Tela 3.1.

---

## 6. Fluxo do Ator: Administrador (Painel de Gestão)

* **Acesso:** `Admin` faz login e vê um painel com uma **Sidebar (Barra Lateral)**.

### Tela 4.1: Gerenciar Cardápio
* **Objetivo:** Configuração estrutural do menu.
* **Fluxo (Modo Rascunho Simplificado - V1):**
    1.  Admin clica em "Adicionar Item".
    2.  **(CORRIGIDO) Fluxo de Upload:** O popup de adição conterá um formulário `multipart/form-data` com campos de texto (nome, preco) e um campo `input type="file"` (para a imagem).
    3.  Ao salvar, o front-end envia *ambos* (dados e arquivo) em **uma única requisição** para a API (`POST /api/admin/cardapio/itens`).
    4.  **Regra de Exclusão (Soft Delete):** Para proteger o Dashboard, o Admin usa o botão **"Arquivar"** (muda `is_active=false`). Não há "Excluir" permanente.
    5.  *(A ideia do "Modo Rascunho" com "Atualizar" é complexa; para a V1, simplificamos para que as edições e arquivamentos sejam instantâneos, como na Gestão de Funcionários).*

### Tela 4.2: Controle de Itens do Dia
* **Objetivo:** Gerenciar o estoque da noite (o que "acabou").
* **Fluxo (Modo Rápido/Instantâneo):**
    * Uma lista de itens com um switch (interruptor) `[ ✓ ] Disponível`.
    * **Não há modo rascunho.** Desligar o switch **remove instantaneamente** o item do cardápio dos clientes.

### Tela 4.3: Gerenciar Mesas
* **Objetivo:** Cadastrar as mesas físicas.
* **Fluxo (Modo Rápido/Instantâneo):**
    * Admin cadastra/exclui mesas.
    * **Ação "Gerar QR Code"**: Um botão no popup de edição gera a imagem/PDF do QR Code.
    * **Regra de Segurança:** O sistema (via API) **bloqueia** a exclusão de qualquer mesa que esteja `Ocupada (Amarela)`.

### Tela 4.4: Checar Mesas (REUTILIZAÇÃO DE TELA)
* **Objetivo:** Supervisionar o salão.
* **Fluxo:** Carrega o componente **`PainelGarcom` (Tela 3.1)**. O Admin tem **funcionalidade total** (pode fechar contas, devolver itens, etc.).

### Tela 4.5: KDS (REUTILIZAÇÃO DE TELA)
* **Objetivo:** Supervisionar a cozinha.
* **Fluxo:** Carrega o componente **`PainelKDS` (Tela 2.1)**.
* **Regra de Segurança (Read-Only):** O componente é carregado com a prop `readOnly={true}`. O Admin vê o polling de 5s, mas **não pode clicar ou alterar o status** de nenhum item.

### Tela 4.6: Gestão de Funcionários
* **Objetivo:** Controlar o acesso ao sistema.
* **Fluxo (Modo Rápido/Instantâneo):**
    * Admin cadastra funcionários (popup com `Nome`, `Login`, `Senha`).
    * **Regra de Função:** Um **Dropdown** (seletor) define a função única (`Admin`, `Cozinheiro`, `Garçom`).
    * **Regra de Histórico (Soft Delete):** O botão "Excluir" apenas marca o funcionário como "inativo" (protege o histórico). Um botão "Histórico de Funcionários" permite ver os inativos.

### Tela 4.7: Dashboard (Relatórios)
* **Objetivo:** Análise de negócios.
* **Fluxo (Simplificado para V1):**
    * **Filtro de Data:** Botões `[ Hoje ]`, `[ Semana ]`, `[ Mês ]` e um botão `[ Escolher um dia... ]` que abre um mini-calendário.
    * **Front-end (Sem Gráficos):** Para simplificar, todos os dados serão exibidos em **KPIs (Cards), Listas e Tabelas**.
    * **Dados Exibidos:** KPIs (Receita Total, etc.), Tabelas (Top Itens, Vendas por Garçom, Vendas por Hora) e Alertas (Cancelados/Devolvidos).
    * **(CORRIGIDO):** O relatório "Vendas por Método de Pagamento" agora tem dados, graças ao fluxo corrigido do Garçom (3.4).