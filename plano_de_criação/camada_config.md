# Implementação do Back-end: BRZ Burg (Java/Spring Boot)
# PARTE 1: A CAMADA CONFIG (Funcionalidade: Autenticação)

Este documento detalha a implementação da classe `SecurityConfig` num novo pacote `config`.

**Propósito:** O pacote `config` define as regras globais do Spring Boot. Esta classe é a **mais importante** para a segurança. Ela usa a dependência `spring-boot-starter-security` para:
1.  **Desativar** a segurança padrão (que gera a senha no log).
2.  **Definir as nossas regras:** Quais APIs são públicas e quais são protegidas.
3.  **Criar o `PasswordEncoder`:** A ferramenta que usaremos para **criptografar** as senhas dos funcionários.

---

## Funcionalidade 3: Autenticação (Login e Segurança)

### 3.1 A Camada `config`

Este ficheiro diz ao Spring Security como se comportar, seguindo o nosso `especificacao_das_apis.md` (que define rotas públicas de cliente e login).

* **Crie a pasta:** `brzburg-api/src/main/java/com/brzburg/brzburg_api/config`
* **Crie o ficheiro:** `SecurityConfig.java`
* **Código:**

```java
package com.brzburg.brzburg_api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration // Diz ao Spring que esta é uma classe de configuração
@EnableWebSecurity // Ativa a segurança web do Spring
public class SecurityConfig {

    /**
     * Este é o "Bean" (componente) que usaremos para criptografar senhas.
     * Nós vamos injetá-lo (@Autowired) no nosso FuncionarioService.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Este é o "Filtro de Segurança" principal.
     * É aqui que definimos as regras de acesso (o "porteiro" da API).
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Desativa a proteção CSRF (não necessária para uma API RESTful stateless)
            .csrf(csrf -> csrf.disable())
            
            // 2. Define a política de sessão como STATELESS (sem estado)
            // O servidor não guardará a sessão. Cada pedido deve ser autenticado
            // (isto será feito com Tokens JWT no futuro).
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // 3. Define as regras de autorização (quem pode aceder ao quê)
            .authorizeHttpRequests(authorize -> authorize
                
                // 3a. Permite acesso PÚBLICO (sem login) a estas rotas:
                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll() // Nossa API de Login
                .requestMatchers("/api/cliente/**").permitAll() // Todas as APIs do Cliente

                // 3b. Exige autenticação para TODAS as outras rotas
                .anyRequest().authenticated()
            );

        // (Mais tarde, adicionaremos o filtro de Token JWT aqui)

        return http.build();
    }
}
```
# Implementação do Back-end: BRZ Burg (Java/Spring Boot)
# PARTE 2: A CAMADA SERVICE (Atualização: Criptografia de Senha)

Este documento detalha a **atualização** necessária no `FuncionarioService.java` (que já criámos).

**Propósito:** Agora que temos um "Bean" `PasswordEncoder` (definido no `SecurityConfig.java`), precisamos de injetá-lo no `FuncionarioService` para criptografar (fazer o "hash") das senhas antes de as salvar no banco de dados.

---

## Funcionalidade 3: Autenticação (Login e Segurança)

### 3.2 A Camada `service` (Atualização)

Vamos modificar o `FuncionarioService.java` para que ele use o `PasswordEncoder`.

* **Ficheiro (para editar):** `brzburg-api/src/main/java/com/brzburg/brzburg_api/service/FuncionarioService.java`
* **Código (Atualizado):**

```java
package com.brzburg.brzburg_api.service;

import com.brzburg.brzburg_api.model.Funcionario;
import com.brzburg.brzburg_api.repository.FuncionarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
// IMPORTAR A NOVA FERRAMENTA DE CRIPTOGRAFIA
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FuncionarioService {

    @Autowired
    private FuncionarioRepository funcionarioRepository;

    // --- NOVA DEPENDÊNCIA ---
    // 1. Injeta o PasswordEncoder que criámos no SecurityConfig.java
    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Implementa a lógica para: POST /api/admin/funcionarios
     * Cria um novo funcionário.
     */
    public Funcionario criarFuncionario(Funcionario funcionario) {
        // 2. CRIPTOGRAFA A SENHA
        // Pega a senha em texto puro que veio do JSON e a transforma em um hash
        String senhaCriptografada = passwordEncoder.encode(funcionario.getSenhaHash());
        funcionario.setSenhaHash(senhaCriptografada);

        funcionario.setActive(true);
        return funcionarioRepository.save(funcionario);
    }

    /**
     * Implementa a lógica para: PUT /api/admin/funcionarios/{id}
     * Atualiza um funcionário existente.
     */
    public Funcionario atualizarFuncionario(Integer id, Funcionario dadosFuncionario) throws Exception {
        Funcionario funcionario = funcionarioRepository.findById(id)
                .orElseThrow(() -> new Exception("Funcionário não encontrado com id: " + id));

        funcionario.setNome(dadosFuncionario.getNome());
        funcionario.setCpf(dadosFuncionario.getCpf());
        funcionario.setLogin(dadosFuncionario.getLogin());
        funcionario.setFuncao(dadosFuncionario.getFuncao());
        
        // 3. ATUALIZA A SENHA (se uma nova foi enviada)
        // Verifica se o campo 'senhaHash' no JSON não está vazio
        if (dadosFuncionario.getSenhaHash() != null && !dadosFuncionario.getSenhaHash().isEmpty()) {
            // Criptografa a nova senha antes de salvar
            String novaSenhaCriptografada = passwordEncoder.encode(dadosFuncionario.getSenhaHash());
            funcionario.setSenhaHash(novaSenhaCriptografada);
        }

        return funcionarioRepository.save(funcionario);
    }

    // --- MÉTODOS EXISTENTES (sem alteração) ---

    /**
     * Implementa a lógica para: GET /api/admin/funcionarios
     */
    public List<Funcionario> getFuncionariosAtivos() {
        return funcionarioRepository.findByIsActive(true);
    }

    /**
     * Implementa a lógica para: GET /api/admin/funcionarios/historico
     */
    public List<Funcionario> getFuncionariosInativos() {
        return funcionarioRepository.findByIsActive(false);
    }

    /**
     * Implementa a lógica para: DELETE /api/admin/funcionarios/{id}
     */
    public void arquivarFuncionario(Integer id) throws Exception {
        Funcionario funcionario = funcionarioRepository.findById(id)
                .orElseThrow(() -> new Exception("Funcionário não encontrado com id: " + id));

        funcionario.setActive(false);
        funcionarioRepository.save(funcionario);
    }
}
```
# Implementação do Back-end: BRZ Burg (Java/Spring Boot)
# PARTE 3: ATUALIZAÇÃO DO `pom.xml` (Dependências de JWT)

Este documento detalha a **atualização** necessária no `pom.xml`.

**Propósito:** Para que o nosso `AuthController` possa devolver um `token` (como prometido na `especificacao_das_apis.md`), precisamos de bibliotecas que saibam criar e ler **JSON Web Tokens (JWT)**. A `spring-boot-starter-security` não inclui isto por defeito.

Vamos adicionar a biblioteca `jjwt` (Java JWT), que é a mais popular para esta tarefa.

---

## Funcionalidade 3: Autenticação (Login e Segurança)

### 3.3 A Atualização do `pom.xml`

* **Ficheiro (para editar):** `brzburg-api/pom.xml`
* **Ação:** Adicione o bloco `<dependency>` seguinte dentro da sua secção `<dependencies>` (junto às outras dependências do Spring Boot).

```xml
        <dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-security-test</artifactId>
			<scope>test</scope>
		</dependency>

        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.12.3</version> </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.12.3</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.12.3</version>
            <scope>runtime</scope>
        </dependency>

	</dependencies>

	<build>
```
    # Implementação do Back-end: BRZ Burg (Java/Spring Boot)
# PARTE 3: A CAMADA SERVICE (Criação do TokenService e AuthService)

Este documento detalha a criação dos novos serviços no pacote `service` que são necessários para a **Funcionalidade 3: Autenticação**.

**Propósito:** Agora que temos as dependências JWT (`jjwt` no `pom.xml`) e um `PasswordEncoder` (do `SecurityConfig.java`), precisamos da lógica que:
1.  Gere um Token JWT quando o login for bem-sucedido.
2.  Valide as credenciais de login (usuário e senha) comparando-as com o banco de dados.

---

## Funcionalidade 3: Autenticação (Login e Segurança)

### 3.1 A Camada `service` (Novo: `TokenService.java`)

Este é um serviço utilitário que lida apenas com a criação e validação de tokens JWT.

* **Crie o ficheiro:** `brzburg-api/src/main/java/com/brzburg/brzburg_api/service/TokenService.java`
* **Código:**

```java
package com.brzburg.brzburg_api.service;

import com.brzburg.brzburg_api.model.Funcionario;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class TokenService {

    // 1. Precisamos de uma "chave secreta" para assinar os tokens.
    // Vamos defini-la no application.properties
    @Value("${app.jwt.secret}")
    private String jwtSecret;

    // 2. Define o tempo de expiração do token (ex: 24 horas)
    private static final long EXPIRATION_TIME = 86400000; // 24 horas em milissegundos

    /**
     * Gera um novo Token JWT para um funcionário autenticado.
     */
    public String gerarToken(Funcionario funcionario) {
        // Converte a nossa chave secreta (String) num objeto SecretKey
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));

        // Define os "claims" (informações) que queremos guardar no token
        Map<String, Object> claims = new HashMap<>();
        claims.put("nome", funcionario.getNome());
        claims.put("funcao", funcionario.getFuncao());
        // (Não colocamos o ID ou CPF por segurança)

        return Jwts.builder()
                .setSubject(funcionario.getLogin()) // O "dono" do token (o login)
                .setIssuer("BRZ-Burg-API") // Quem emitiu o token
                .setIssuedAt(new Date(System.currentTimeMillis())) // Data de emissão
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME)) // Data de expiração
                .addClaims(claims) // Adiciona os nossos claims (nome e função)
                .signWith(key, SignatureAlgorithm.HS256) // Assina o token com a nossa chave
                .compact(); // Constrói o token (String)
    }

    // (Mais tarde, adicionaremos métodos aqui para VALIDAR um token
    // quando o front-end fizer pedidos para rotas protegidas)
}
```
## Funcionalidade 4: Autenticação (Login e Segurança)

### 4 A Camada `service` (Novo: `AuthService.java`)

Este serviço lida com a lógica de negócio da API POST /api/auth/login.

* **Crie o ficheiro:** `brzburg-api/src/main/java/com/brzburg/brzburg_api/service/AuthService.java`
* **Código:**

```java
package com.brzburg.brzburg_api.service;

import com.brzburg.brzburg_api.model.Funcionario;
import com.brzburg.brzburg_api.repository.FuncionarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private FuncionarioRepository funcionarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; // A ferramenta de criptografia

    @Autowired
    private TokenService tokenService; // O nosso novo serviço de token

    /**
     * Implementa a lógica para: POST /api/auth/login
     * Verifica as credenciais e retorna um token se forem válidas.
     */
    public String login(String login, String senha) throws Exception {
        // 1. Encontrar o funcionário pelo login
        // (Usamos o método que definimos no FuncionarioRepository)
        Funcionario funcionario = funcionarioRepository.findByLogin(login)
                .orElseThrow(() -> new Exception("Login ou senha inválidos."));

        // 2. Verificar se o funcionário está ativo
        if (!funcionario.isActive()) {
            throw new Exception("Esta conta de funcionário está inativa.");
        }

        // 3. Verificar se a senha (em texto puro) corresponde à senha (criptografada) no banco
        //    (Usamos o PasswordEncoder do SecurityConfig)
        if (passwordEncoder.matches(senha, funcionario.getSenhaHash())) {
            
            // 4. Se a senha corresponder, gerar e retornar um novo token
            return tokenService.gerarToken(funcionario);
        } else {
            // Se a senha não corresponder, lançar o mesmo erro genérico
            throw new Exception("Login ou senha inválidos.");
        }
    }
}
```
# Implementação do Back-end: BRZ Burg (Java/Spring Boot)
# PARTE 5: A CAMADA CONTROLLER (Funcionalidade: Autenticação)

Este documento detalha a implementação da classe `AuthController` no pacote `controller`.

**Propósito:** Esta classe é a "porta de entrada" (API) para o nosso sistema de segurança. A sua única função é implementar a Seção 1 do `especificacao_das_apis.md`, que é o endpoint `POST /api/auth/login`.

---

## Funcionalidade 3: Autenticação (Login e Segurança)

### 3.5 A Camada `controller` (Novo: `AuthController.java`)

Esta classe é um novo Controller, separado do `AdminController`, porque lida com um prefixo de API diferente (`/api/auth`).

* **Crie o ficheiro:** `brzburg-api/src/main/java/com/brzburg/brzburg_api/controller/AuthController.java`
* **Código:**

```java
package com.brzburg.brzburg_api.controller;

import com.brzburg.brzburg_api.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth") // Define o URL base para a autenticação
public class AuthController {

    @Autowired // Injeta o serviço de lógica de login
    private AuthService authService;

    /**
     * Implementa: POST /api/auth/login
     * Recebe o login e a senha do front-end.
     * Tenta autenticar o usuário.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        // Usamos um Map simples para receber o JSON `{ "login": "...", "senha": "..." }`
        // como definido na nossa API
        
        try {
            String login = loginRequest.get("login");
            String senha = loginRequest.get("senha");

            // 1. Chama o AuthService (que usa o PasswordEncoder e o TokenService)
            String token = authService.login(login, senha);

            // 2. Se o login for bem-sucedido, retorna o token
            // (O Spring converte este Map para o JSON `{ "token": "..." }`
            // que a nossa API promete)
            return ResponseEntity.ok(Map.of("token", token));

        } catch (Exception e) {
            // 3. Se o AuthService lançar uma exceção (ex: "Login ou senha inválidos.")
            // Nós retornamos o erro 401 Unauthorized (Não Autorizado).
            return new ResponseEntity<>(
                Map.of("erro", "Não autorizado", "mensagem", e.getMessage()), 
                HttpStatus.UNAUTHORIZED
            );
        }
    }
}