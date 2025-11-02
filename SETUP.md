# Guia de Instalação e Configuração do Back-end: BRZ Burg

Este é o guia passo-a-passo para configurar e executar o servidor da API back-end do "BRZ Burg" após clonar este repositório do GitHub.

## 1. Stack Tecnológica

* **Linguagem:** Java 21 
* **Framework:** Spring Boot 3.x
* **Banco de Dados:** PostgreSQL 
* **Ambiente de Desenvolvimento:** VS Code 

## 2. Passo 1: Instalar o Servidor PostgreSQL

1.  **Download:** Vá ao [site oficial da EDB](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads) e baixe o instalador do PostgreSQL.
2.  **Instalação:** Execute o instalador.
    * **Componentes:** Deixe os componentes padrão marcados (`PostgreSQL Server`, `pgAdmin 4`).
    * **Senha:** O instalador pedirá uma senha para o superusuário (`postgres`). **Defina uma senha para o seu PC.** Cada um terá a sua própria senha local.
    * **Porta:** Mantenha a porta padrão: `5432`.

## 3. Passo 2: Criar o Banco de Dados (`brzburg_db`)

1.  **Abra o pgAdmin 4**.
2.  **Conecte-se ao Servidor:**
    * Na barra lateral, conecte ao seu servidor `PostgreSQL` local.
    * Ele pedirá a senha do usuário `postgres`. Use a **senha que você acabou de criar**.
3.  **Crie o Banco:**
    * Clique com o botão direito sobre **"Databases"**.
    * Selecione **"Create"** -> **"Database..."**.
    * Na janela de popup, no campo **"Database"**, digite o nome exato do nosso banco:
      `brzburg_db`
    * Clique em "Save".

## 4. Passo 3: Linkar o Projeto Java

1.  **Abra o Projeto:** Abra este projeto
2.  **Localize o Arquivo:** No explorador de arquivos, navegue até o arquivo de configuração principal do Spring Boot:
    `src/main/resources/application.properties`
3.  **Edite o Arquivo:** Cole o seguinte código dentro deste arquivo. Este arquivo vai ser enviado ao GitHub, mas a senha será específica de cada máquina.

    ```properties

    # 1. O Endereço (URL) do nosso banco conecta no localhost, na porta 5432 no banco brzburg_db
    spring.datasource.url=jdbc:postgresql://localhost:5432/brzburg_db

    # 2. Use o usuário postgres
    spring.datasource.username=postgres
    
    # 3. use a senha que voce criou para o PostgreSQL no Passo 1.
    spring.datasource.password=COLOQUE_A_SUA_SENHA_LOCAL_AQUI

    # 4. Geração Automática de Tabelas com o hibernate que olha as classes Java (@Entity) e cria ou atualiza as tabelas no banco para que correspondam."
    spring.jpa.hibernate.ddl-auto=update

    # 5. Mostrar o SQL no Console
    spring.jpa.show-sql=true
    spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
    ```

## 5. segurança para commits

1.  **Antes de Commitar:** altere a linha da senha de volta para:
    `spring.datasource.password=COLOQUE_A_SUA_SENHA_LOCAL_AQUI`
2.  **Quando clonar:** Cada pessoa deve, como primeiro passo, editar este arquivo e inserir a sua própria senha local para poder rodar o projeto.

## 6. Passo 4: Executar o Projeto

Com o banco `brzburg_db` criado e o `application.properties` preenchido com sua senha local:

1.  Abra o arquivo principal do aplicativo no VS Code:
    `src/main/java/com/brzburg/BrzburgApiApplication.java` (ou o nome `Application.java` principal).
2.  Clique no botão **"Run"** que o VS Code mostra acima da função `main`.

Se tudo estiver correto, você verá o Spring Boot iniciar, conectar-se ao `brzburg_db` pelo `ddl-auto=update` e criar as tabelas de acordo com as funções

O seu servidor de back-end estará rodando em `http://localhost:8080`.