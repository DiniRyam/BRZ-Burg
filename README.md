# BRZ-Burg - Sistema de Gerenciamento de Restaurante

Sistema completo para gerenciamento de restaurantes com painel de administrador, garçom, cozinheiro e cliente.

---

## Pré-requisitos

- **Java 21** ou superior
- **Node.js** (v16 ou superior) com npm
- **Git**

---

## Guia de Execução

### Backend (Java Spring Boot)

#### Passo 1: Navegar para o diretório do backend
```bash
cd BRZ-Burg/brzburg-api
```

#### Passo 2: Compilar o projeto
```bash
./mvnw clean install
```
(No Windows, use: `.\mvnw clean install`)

#### Passo 3: Executar o servidor backend
```bash
./mvnw spring-boot:run
```
(No Windows, use: `.\mvnw spring-boot:run`)

O backend será iniciado em **http://localhost:8080**

Você deve ver uma mensagem como:
```
Tomcat started on port 8080 (http) with context path '/'
Started BrzburgApiApplication in X seconds
```

---

### Frontend (React + Vite)

#### Passo 1: Abrir um novo terminal e navegar para o diretório do frontend
```bash
cd BRZ-Burg/brzburg-ui
```

#### Passo 2: Instalar dependências
```bash
npm install
```

#### Passo 3: Iniciar o servidor de desenvolvimento
```bash
npm run dev
```

O frontend será iniciado em **http://localhost:5173** (ou a porta que o Vite indicar)

---

## Acessar a Aplicação

1. Abra seu navegador e acesse: **http://localhost:5173**
2. Faça login com:
   - **Usuário:** `admin`
   - **Senha:** `123456`

---

## Credenciais Padrão do Admin

Estas são criadas automaticamente quando o backend é iniciado pela primeira vez:
- **Usuário:** `admin`
- **Senha:** `123456`

---

## Parando os Servidores

- **Backend:** Pressione `Ctrl + C` no terminal do Maven
- **Frontend:** Pressione `Ctrl + C` no terminal do npm

---

## Solução de Problemas

**Backend não inicia?**
- Certifique-se de que a porta 8080 está disponível
- Verifique se Java 21+ está instalado: `java -version`

**Frontend não inicia?**
- Delete a pasta `node_modules` e execute `npm install` novamente
- Certifique-se de que a porta 5173 está disponível

**Login falha?**
- Certifique-se de que o backend está rodando em http://localhost:8080
- Verifique o console do navegador (F12) para mensagens de erro
- Limpe o localStorage e tente novamente

---

## Estrutura do Projeto

```
BRZ-Burg/
├── brzburg-api/          # Backend Java Spring Boot
│   ├── src/
│   ├── pom.xml
│   └── ...
├── brzburg-ui/           # Frontend React + Vite
│   ├── src/
│   ├── package.json
│   └── ...
└── README.md
```

---

## Funcionalidades

- **Admin:** Gerenciamento de cardápio, mesas, funcionários e estoque
- **Garçom:** Gerenciamento de mesas e comandas
- **Cozinheiro:** Visualização de pedidos (KDS - Kitchen Display System)
- **Cliente:** Consulta do cardápio e realização de pedidos

---

## Tecnologias Utilizadas

**Backend:**
- Java 21
- Spring Boot 3.5.7
- Spring Data JPA
- Spring Security
- JWT (JSON Web Tokens)
- H2 Database (desenvolvimento)
- PostgreSQL (produção)

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- Axios

---

## Contato e Suporte

Para dúvidas ou problemas, abra uma issue no repositório.