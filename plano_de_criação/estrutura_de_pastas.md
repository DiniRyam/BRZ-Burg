BRZ-Burg/ (A pasta principal do seu repositório Git)
├── .git/
├── SETUP.md (O guia de instalação que fizemos)
│
├── plano_de_criação/ (Os nossos 5 documentos de planeamento)
│   ├── arquitetura_das_telas.md
│   ├── banco_de_dados.md
│   ├── especificacao_das_apis.md
│   ├── guia_de_construção_das_telas.md
│   └── guia_de_estilo.md
│
├── brzburg-api/ (Este é o seu projeto Back-end Java Spring Boot)
│   ├── .mvn/
│   │   └── wrapper/
│   │       └── maven-wrapper.properties
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/brzburg/brzburg_api/
│   │   │   │       │
│   │   │   │       ├── BrzburgApiApplication.java vugo main
│   │   │   │       │
│   │   │   │       ├── model/ classes pro projeto
│   │   │   │       │   ├── Funcionario.java
│   │   │   │       │   ├── Mesa.java
│   │   │   │       │   ├── CardapioSecao.java
│   │   │   │       │   ├── CardapioItem.java
│   │   │   │       │   ├── Comanda.java
│   │   │   │       │   ├── ItemPedido.java
│   │   │   │       │   └── ContasFechadas.java
│   │   │   │       │
│   │   │   │       ├── repository/ acessar o banco
│   │   │   │       │   ├── FuncionarioRepository.java
│   │   │   │       │   ├── MesaRepository.java
│   │   │   │       │   └── ... (etc.)
│   │   │   │       │
│   │   │   │       ├── service/ a parte que vai fazer o pesado dos pedidos
│   │   │   │       │   ├── MesaService.java
│   │   │   │       │   ├── ComandaService.java
│   │   │   │       │   └── ... (etc.)
│   │   │   │       │
│   │   │   │       ├── controller/ funções de controle/pedido
│   │   │   │       │   ├── AdminController.java
│   │   │   │       │   ├── ClienteController.java
│   │   │   │       │   ├── GarcomController.java
│   │   │   │       │   ├── KdsController.java
│   │   │   │       │   └── AuthController.java
│   │   │   │       │
│   │   │   │       └── config/ para segurança
│   │   │   │           └── SecurityConfig.java
│   │   │   │
│   │   │   └── resources/
│   │   │       └── application.properties link do banco
│   │   │
│   │   └── test/
│   │       └── java/
│   │           └── ... (Testes)
│   │
│   ├── .gitignore 
│   ├── mvnw 
│   ├── mvnw.cmd 
│   └── pom.xml dependencias java
│
└── brzburg-ui/ (parte do front)
    ├── public/
    ├── src/
    │   ├── components/ (para reutilizar)
    │   │   ├── Modal.js
    │   │   ├── Card.js
    │   │   ├── PainelKDS.js
    │   │   ├── PainelGarcom.js
    │   │   └── ComandaView.js
    │   ├── pages/ (As telas montadas)
    │   │   ├── Admin/
    │   │   │   └── AdminDashboard.js
    │   │   ├── Cliente/
    │   │   │   └── ClienteCardapio.js
    │   │   └── ... (etc.)
    │   ├── App.js (O roteador principal)
    │   └── index.js
    ├── .gitignore
    └── package.json (dependencias do react)