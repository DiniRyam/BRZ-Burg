# Guia de Prompts v0: Construção do Sistema "BRZ Burg"

Este documento é o plano de ação para gerar as telas do sistema usando o **v0** com foco na **modularização** e **reutilização**.

**Objetivo:** Construir o front-end (React + Tailwind CSS) de forma eficiente, criando "blocos de lego" (componentes) primeiro, e depois montando as telas.

**Guia de Estilo (Lembretes para o v0):**
* **Design:** Minimalista.
* **Cores:** Fundo da página `off-white` (ex: `bg-gray-50`), cards/modais `branco` (`bg-white`), texto `preto` (`text-gray-900`).
* **Fonte:** `Inter`.
* **Hierarquia:** Títulos (`Inter Bold 700`), Nomes/Botões (`Inter Semi-Bold 600`), Descrições (`Inter Regular 400`).
* **Feedback:** Botões devem ter um estado `:active` (clique) que os torna `cinza` ou mais escuros.

---

## Fase 1: Construindo os "Blocos de Lego" (Componentes de UI Base)

Estes são os primeiros prompts para o v0. Vamos construir os blocos que usaremos em *todas* as outras telas.

### 1.1. O `Modal` (Popup Genérico)
* **Arquivo (Sugestão):** `src/components/Modal.js`
* **Prompt v0:**
    > "Crie um componente de popup modal em React. Ele deve ter um overlay (fundo) escuro semi-transparente que cobre a tela inteira. O modal em si deve ser um card branco (`bg-white`) com cantos arredondados no centro da tela. Adicione um título 'Título do Modal' (Inter Bold 700) no topo e um ícone 'X' no canto superior direito para fechar."
* **Nota do Desenvolvedor:** Vamos reutilizar este `Modal` para *todas* as ações de popup (Adicionar Item, Cadastrar Mesa, Confirmar Status, etc.).

### 1.2. O `Card` (Card Genérico)
* **Arquivo (Sugestão):** `src/components/Card.js`
* **Prompt v0:**
    > "Crie um componente de card clicável. Fundo branco (`bg-white`), cantos arredondados, e uma borda cinza-claro (`border-gray-200`) ou sombra leve (`shadow-sm`). O card deve ter um slot para uma imagem no topo, um título 'Título do Card' (Inter Semi-Bold 600) e um texto de descrição 'Descrição...' (Inter Regular 400)."
* **Nota do Desenvolvedor:** Vamos reutilizar este `Card` para os itens do `Cardápio`, as `Mesas` e os `Funcionários`.

### 1.3. Os `Botoes` (Ações Padronizadas)
* **Arquivo (Sugestão):** `src/components/Button.js`
* **Prompt v0:**
    > "Crie 3 botões com a fonte Inter Semi-Bold e cantos arredondados.
    > 1.  **Botão Primário:** Fundo verde (`bg-green-500`), texto branco.
    > 2.  **Botão Secundário:** Fundo cinza (`bg-gray-400`), texto branco.
    > 3.  **Botão de Perigo:** Fundo vermelho (`bg-red-500`), texto branco.
    > Todos os botões devem ter um feedback visual ao clique (estado `:active`), ficando um tom mais escuro ou cinza."

---

## Fase 2: Construindo os "Módulos" (Componentes de Tela Reutilizáveis)

Agora usamos os "Lego" para montar os componentes complexos que são compartilhados entre os atores.

### 2.1. O `PainelKDS` (Tela da Cozinha)
* **Arquivo (Sugestão):** `src/components/PainelKDS.js`
* **Prompt v0:**
    > "Crie um layout de painel Kanban com fundo off-white (`bg-gray-50`). Crie 3 colunas verticais roláveis: 'Pendentes', 'Em Preparo' e 'Finalizados'.
    > Agora, crie um card de pedido (fundo branco, borda cinza) para a coluna 'Pendentes'. O card deve mostrar 'MESA 9' (Inter Bold 700), '2x Hambúrguer Clássico' (Inter Semi-Bold 600) e 'Obs: sem cebola' (Inter Regular 400, cor cinza-médio)."
* **Nota do Desenvolvedor:**
    * Este componente será importado pelo `Cozinheiro` e pelo `Admin`.
    * Você implementará a prop `readOnly`. Se `readOnly={true}`, os cards não serão clicáveis (para o Admin).
    * Você implementará a lógica de Polling (5s) e as regras de cores (Verde, Vermelho, Cinza) aqui dentro.

### 2.2. O `PainelGarcom` (Tela do Garçom)
* **Arquivo (Sugestão):** `src/components/PainelGarcom.js`
* **Prompt v0:**
    > "Crie uma tela de dashboard para garçom com duas abas.
    > 1.  A primeira aba 'Alertas' é uma lista simples. Adicione um item de lista: '🍽️ MESA 9: Pedido Pronto!'.
    > 2.  A segunda aba 'Todas as Mesas' é uma grade de cards. Crie um card 'Mesa 1' com fundo verde (`bg-green-500`), texto 'Livre' (Inter Semi-Bold, branco). Crie outro card 'Mesa 2' com fundo amarelo (`bg-yellow-400`) e texto 'Ocupada'."
* **Nota do Desenvolvedor:**
    * Este componente será importado pelo `Garçom` e pelo `Admin`.
    * Você implementará a lógica de Polling (10s) para atualizar os alertas e as cores das mesas.

### 2.3. O `ComandaView` (Visor da Comanda)
* **Arquivo (Sugestão):** `src/components/ComandaView.js`
* **Prompt v0:**
    > "Crie um layout de 'Minha Comanda' para celular. É uma lista de cards (fundo branco).
    > Cada card deve ter: '2x Hambúrguer' (Inter Semi-Bold), 'Obs: sem cebola' (Inter Regular, cinza), e 'Status: Pendente' (Inter Regular).
    > O card deve ter um botão 'Cancelar' (vermelho, pequeno).
    > No final da página, fixo no rodapé, um texto 'Total: R$ 0,00' (Inter Bold 700)."
* **Nota do Desenvolvedor:**
    * Este componente será importado pelo `Cliente` e pelo `Garçom`.
    * Você implementará a prop `role` para mudar o botão ("Cancelar" para `role="cliente"` e "Devolver" para `role="garcom"`).

---

## Fase 3: Montando as Telas Finais (Prompts de Montagem)

Agora, nós apenas *montamos* os componentes que o v0 ajudou a criar.

### 3.1. Tela de Login (Para Funcionários)
* **Prompt v0:**
    > "Crie uma tela de login simples. Fundo off-white (`bg-gray-50`). No topo central, um avatar genérico (logo). Abaixo, o título 'BRZ Burg Login' (Inter Bold 700). Abaixo, dois campos de formulário (fundo branco, borda cinza) para 'Login' e 'Senha'. Por fim, um botão 'Entrar' (verde, largura total)."

### 3.2. Telas do Cliente (Cardápio e Comanda)
* **Prompt v0 (Header):**
    > "Crie um componente `HeaderBar` com fundo branco e borda inferior. À esquerda, um avatar (logo) e 'BRZ Burg' (Inter Bold 700). À direita, um botão-ícone de carrinho de compras (comanda)."
* **Prompt v0 (Cardápio):**
    > "Crie uma página de cardápio que usa o `HeaderBar`. Adicione um título de seção 'BURGERS' (Inter Bold 700). Abaixo, crie uma grade de `Card` (o componente que já criamos) para os itens."
* **Nota do Desenvolvedor:**
    * Você irá conectar o botão "Adicionar" do `Card` para abrir o `Modal` (que conterá o formulário de quantidade/observação).
    * O botão "Comanda" no header (que você controlará o status Verde/Cinza) navegará para a tela que renderiza o `<ComandaView role="cliente" />`.

### 3.3. Telas do Cozinheiro e Garçom
* **Nota do Desenvolvedor:** Não há prompts de v0 aqui.
* Após o login, o React fará o roteamento:
    * Se `role == 'COZINHEIRO'`, renderize `<PainelKDS readOnly={false} />`.
    * Se `role == 'GARCOM'`, renderize `<PainelGarcom />`.

### 3.4. Telas do Administrador
* **Prompt v0 (Layout Principal):**
    > "Crie um layout de admin de 2 colunas. À esquerda, uma `Sidebar` vertical (fundo branco, borda direita). À direita, a área de conteúdo principal (fundo off-white). Na sidebar, adicione links (Inter Semi-Bold) para: 'Dashboard', 'Gerenciar Cardápio', 'Gerenciar Mesas', 'Gestão de Funcionários', 'Checar Mesas' (Garçom), 'KDS' (Cozinha), 'Controle de Itens'."
* **Prompt v0 (Páginas de Gestão - Ex: Mesas):**
    > "Crie o layout para a área de conteúdo 'Gerenciar Mesas'. No topo, um `Botão Primário` (verde) 'Cadastrar Nova Mesa'. Abaixo, uma grade de `Card` (componente que já criamos)."
* **Prompt v0 (Formulários - Ex: Funcionário):**
    > "Crie um formulário para ser usado dentro do nosso `Modal`. Título 'Cadastrar Funcionário' (Inter Bold). Campos: 'Nome', 'CPF', 'Login', 'Senha'. Adicione um `Dropdown` (seletor) para 'Função' com as opções 'Admin', 'Cozinheiro', 'Garçom'."
* **Prompt v0 (Dashboard - Layout 2 Colunas):**
    > "Crie o layout para a área de conteúdo 'Dashboard'. Adicione um filtro de data no topo com botões 'Hoje', 'Semana', 'Mês'.
    > Abaixo do filtro, divida a área em **duas colunas**.
    > Na **coluna da esquerda**, adicione um card de KPI 'Receita Total' (Inter Bold 700) e, abaixo dele, uma tabela 'Top 5 Itens' (fundo branco).
    > Na **coluna da direita**, adicione um card de alerta 'Itens Cancelados' (fundo vermelho) e, abaixo dele, uma tabela 'Vendas por Garçom' (fundo branco)."
* **Nota do Desenvolvedor:**
    * Você usará o mesmo layout de "Gestão" (grade de cards + botão Adicionar) para `Cardápio`, `Mesas` e `Funcionários`.
    * Você usará o mesmo `Modal` para todos os formulários de cadastro/edição.
    * Você conectará os links da sidebar para renderizar os componentes corretos (ex: `Checar Mesas` renderiza `<PainelGarcom />`).