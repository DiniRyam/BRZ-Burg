# Guia de Estilo (Design System V1): BRZ Burg

Este documento é a "fonte da verdade" (source of truth) para o design visual, estético e de interação de todo o sistema. O foco é um design minimalista, funcional e de alta legibilidade, otimizado para operações de restaurante.

## 1. Filosofia de Design

* **Função sobre Forma:** O design deve ser limpo, intuitivo e rápido. A funcionalidade é a prioridade.
* **Minimalismo:** Usamos uma paleta de cores restrita e uma única família de fontes para criar uma interface limpa e sem distrações.
* **Consistência:** Componentes reutilizáveis (`Card`, `Modal`, `HeaderBar`) devem ser usados em todo o sistema para criar uma experiência de usuário unificada.

## 2. Paleta de Cores

A paleta é dividida em cores de UI (a estrutura) e cores de Status (o feedback).

### 2.1. Cores de UI (Layout)

| Uso | Cor | Hex (Sugestão) | Tailwind (Sugestão) |
| :--- | :--- | :--- | :--- |
| **Fundo da Página (Base)** | Off-white | `#F9F9F9` | `bg-gray-50` |
| **Fundo do Card** | Branco (Puro) | `#FFFFFF` | `bg-white` |
| **Texto Principal** | Preto/Cinza Escuro | `#111827` | `text-gray-900` |
| **Texto Secundário** | Cinza Médio | `#6B7280` | `text-gray-500` |
| **Bordas / Divisórias** | Cinza Claro | `#E5E7EB` | `border-gray-200` |

### 2.2. Cores de Status (Feedback)

Usadas para botões, status e alertas.

| Uso | Cor | Hex (Sugestão) | Tailwind (Sugestão) |
| :--- | :--- | :--- | :--- |
| **Ativo / Concluído / Sucesso** | Verde | `#10B981` | `bg-green-500` |
| **Inativo / Devolvido** | Cinza | `#9CA3AF` | `bg-gray-400` |
| **Alerta / Cancelado / Erro** | Vermelho | `#EF4444` | `bg-red-500` |
| **Feedback de Clique (Botão)** | Cinza (Ativo) | `#D1D5DB` | `active:bg-gray-300` |

## 3. Tipografia (Fonte)

* **Família de Fonte:** `Inter` (Google Fonts). É uma fonte Sans-Serif moderna, otimizada para legibilidade em UI.

### 3.1. Hierarquia de Pesos da Fonte

A hierarquia de pesos é crucial para guiar o olho do usuário em um ambiente de restaurante.

#### Peso: `Inter Regular (400)`
* **Propósito:** Texto de suporte e informações base.
* **Onde Usar:**
    * Descrições de itens no cardápio.
    * Textos de ajuda (ex: *"Para itens com observações diferentes..."*).
    * Rótulos de formulários (ex: "CPF:", "Senha:").
    * Texto de status (ex: "Em Preparo", "Pendente").
    * A maioria dos textos em tabelas do Dashboard.
    * Cor: `text-gray-900` (Texto Secundário: `text-gray-500`).

#### Peso: `Inter Semi-Bold (600)`
* **Propósito:** Informação-chave, itens de ação e dados primários.
* **Onde Usar:**
    * **Nomes dos Itens no Cardápio** (ex: "**Hambúrguer Clássico**").
    * **Preços no Cardápio** (ex: "**R$ 25,00**").
    * **Texto de Botões** (ex: "**Adicionar à Comanda**").
    * Itens principais na Comanda e KDS (ex: "**2x Hambúrguer Clássico**").
    * Nomes de funcionários na lista de gestão.
    * O nome do funcionário logado na barra superior (ex: "**Maria Souza**").
    * Cor: `text-gray-900`.

#### Peso: `Inter Bold (700)`
* **Propósito:** Títulos principais, âncoras visuais e dados críticos.
* **Onde Usar:**
    * O nome do restaurante na barra superior (**BRZ Burg**).
    * Títulos de Seção no Cardápio (ex: "**BURGERS**").
    * O número/nome da Mesa no KDS (ex: "**MESA 09**").
    * O `Valor Total` na comanda (ex: "**Total: R$ 52,00**").
    * Os números de KPI no Dashboard (ex: "**R$ 8.500,00**").
    * Títulos de Popups (Modais) (ex: "**Adicionar Novo Funcionário**").
    * Cor: `text-gray-900`.

## 4. Componentes Visuais Chave

### 4.1. A Logotipo (Avatar Genérico)
* **Visual:** Um avatar genérico simples.
* **Uso:**
    1.  **Tela de Login:** Posicionado no canto superior central.
    2.  **Barra de Navegação Superior:** Posicionado no canto superior esquerdo.

### 4.2. Barra de Navegação Superior (Header Contextual)
Este é um componente reutilizável que muda com base no ator.
* **Versão Cliente (Cardápio):**
    * `[Logo]` `[BRZ Burg (Bold 700)]` `[Espaço]` `[Botão Comanda]`
    * **Botão Comanda (Status):**
        * Desativado: Cor `Cinza`.
        * Ativado: Cor `Verde`.
* **Versão Funcionário (Admin, Garçom, Cozinheiro):**
    * `[Logo]` `[Nome do Funcionário Logado (Semi-Bold 600)]`

### 4.3. Cards (`bg-white`)
* **Visual:** Todos os cards (para itens, mesas, funcionários) terão um fundo `Branco (#FFFFFF)`.
* **Estilo:** Minimalista, com uma leve sombra (`shadow-sm`) ou borda fina (`border-gray-200`) para se destacarem do fundo `Off-white`.

### 4.4. Botões (Interatividade)
* **Visual:** Cor sólida (Verde para confirmar, Cinza para secundário, Vermelho para perigo) com texto `Inter Semi-Bold (600)`.
* **Feedback de Clique (Regra de Responsividade):**
    * Todos os botões do sistema **devem** ter um feedback visual instantâneo ao serem clicados.
    * **Estado `:active` (Enquanto Pressionado):** O fundo do botão deve mudar para um **tom de cinza mais escuro** (ex: `active:bg-gray-300` ou `active:brightness-90`). Isso confirma ao usuário que o clique foi registrado.

## 5. Resumo da Aplicação (Exemplos)

* **Tela de Login:** Fundo `Off-white`. Logo (Avatar) no topo. Título "Login" (`Inter Bold`). Campos de formulário com rótulos `Inter Regular`. Botão "Entrar" (`Verde`, texto `Semi-Bold`, feedback `Cinza`).
* **Cardápio (Cliente):** Fundo `Off-white`. Header `[Logo] [BRZ Burg] [Botão Comanda (Cinza)]`. Título de Seção `Inter Bold`. Cards de Item `Branco`. Nome e Preço `Inter Semi-Bold`. Descrição `Inter Regular`.
* **KDS (Cozinha):** Fundo `Off-white`. Header `[Logo] [Nome do Cozinheiro]`. Colunas (`Pendentes`, `Em Preparo`, `Finalizados`). Cards `Branco`. Título do Card (Mesa) `Inter Bold`. Item `Inter Semi-Bold`. Cores de status (Verde, Vermelho, Cinza) usadas nos cards da 3ª coluna.