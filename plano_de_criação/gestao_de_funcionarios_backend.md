# Implementação do Back-end: BRZ Burg (Java/Spring Boot)
# PARTE 1: A CAMADA MODEL (Funcionalidade: Funcionários)

Este documento detalha a implementação da classe `Funcionario` no pacote `model`.

**Propósito:** O pacote `model` contém as classes Java que são "moldes" das nossas tabelas do `banco_de_dados.md`. O Spring Boot (graças ao `ddl-auto=update`) lerá estas classes para criar as tabelas automaticamente.

---

## Funcionalidade 2: Gestão de Funcionários

### 2.1 A Camada `model`

Esta classe é a tradução 1-para-1 da `Tabela 1: funcionarios`. Ela é a base para a nossa API de `Login` e para o CRUD de "Gestão de Funcionários" do Admin.

* **Crie o ficheiro:** `brzburg-api/src/main/java/com/brzburg/brzburg_api/model/Funcionario.java`
* **Código:**

```java
package com.brzburg.brzburg_api.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Representa a Tabela 1: funcionarios.
 * Mapeia os dados de login e função de todos os funcionários.
 * Esta classe @Entity será lida pelo ddl-auto=update 
 * para criar a tabela.
 */
@Entity
@Table(name = "funcionarios") // Mapeia para o nome da tabela do nosso banco_de_dados.md
public class Funcionario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // SERIAL
    private Integer id;

    @Column(name = "nome", nullable = false)
    private String nome;

    @Column(name = "cpf", unique = true, nullable = false, length = 11)
    private String cpf;

    @Column(name = "login", unique = true, nullable = false, length = 100)
    private String login;

    /**
     * Esta é a nossa trava de segurança "Simples e Funcional".
     * WRITE_ONLY: O Spring pode LER o JSON que vem do front-end 
     * (para criar/atualizar um usuário), mas NUNCA irá ESCREVER (enviar) 
     * este campo num JSON de resposta, protegendo a senha.
     */
    @Column(name = "senha_hash", nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String senhaHash;

    @Column(name = "funcao", nullable = false, length = 50)
    private String funcao; // ADMIN, COZINHEIRO, GARCOM

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true; // Padrão 'true' como no banco

    // Construtor vazio (obrigatório para JPA)
    public Funcionario() {
    }

    // --- Getters e Setters ---
    // (O VS Code pode gerar isto: clique direito -> Source Action -> Generate Getters and Setters)
    
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getLogin() {
        return login;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    // O Jackson (JSON) não pode ver este Getter
    public String getSenhaHash() {
        return senhaHash;
    }

    // O Jackson (JSON) pode usar este Setter
    public void setSenhaHash(String senhaHash) {
        this.senhaHash = senhaHash;
    }

    public String getFuncao() {
        return funcao;
    }

    public void setFuncao(String funcao) {
        this.funcao = funcao;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        this.isActive = active;
    }
}
```
# Implementação do Back-end: BRZ Burg (Java/Spring Boot)
# PARTE 2: A CAMADA REPOSITORY (Funcionalidade: Funcionários)

Este documento detalha a implementação da interface `FuncionarioRepository` no pacote `repository`.

**Propósito:** O pacote `repository` é a única camada que fala com o PostgreSQL. Usando o Spring Data JPA, nós definimos interfaces e o Spring Boot escreve o SQL para nós.

---

## Funcionalidade 2: Gestão de Funcionários

### 2.2 A Camada `repository`

Esta interface estende `JpaRepository` para nos dar os métodos CRUD básicos (`save`, `findById`, `delete`). Além disso, nós definimos **métodos de consulta personalizados** que o Spring Boot implementará automaticamente, baseados no nome do método.

* **Crie o ficheiro:** `brzburg-api/src/main/java/com/brzburg/brzburg_api/repository/FuncionarioRepository.java`
* **Código:**

```java
package com.brzburg.brzburg_api.repository;

import com.brzburg.brzburg_api.model.Funcionario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Representa o "Almoxarifado" para a entidade Funcionario.
 * Estende JpaRepository (da dependência spring-boot-starter-data-jpa).
 */
@Repository
// JpaRepository<TipoDoModelo, TipoDaChavePrimaria>
public interface FuncionarioRepository extends JpaRepository<Funcionario, Integer> {

    // O Spring Data JPA cria estes métodos personalizados automaticamente
    // apenas por lhes darmos um nome que segue as suas convenções.

    /**
     * Este método é necessário para a API:
     * - GET /api/admin/funcionarios (onde is_active = true)
     * - GET /api/admin/funcionarios/historico (onde is_active = false)
     * * O Spring gera o SQL: "SELECT * FROM funcionarios WHERE is_active = ?"
     */
    List<Funcionario> findByIsActive(boolean isActive);

    /**
     * Este método é crucial para a nossa API de Autenticação:
     * - POST /api/auth/login
     * * O Spring gera o SQL: "SELECT * FROM funcionarios WHERE login = ? LIMIT 1"
     */
    Optional<Funcionario> findByLogin(String login);
}
```
# Implementação do Back-end: BRZ Burg (Java/Spring Boot)
# PARTE 3: A CAMADA SERVICE (Funcionalidade: Funcionários)

Este documento detalha a implementação da classe `FuncionarioService` no pacote `service`.

**Propósito:** O pacote `service` contém a **lógica de negócio** (o "Cérebro"). Ele implementa as regras definidas nos nossos documentos, como a regra de "Soft Delete" (Arquivar) da `arquitetura_das_telas.md`.

---

## Funcionalidade 2: Gestão de Funcionários

### 2.3 A Camada `service`

Esta classe é chamada pelo `AdminController` e usa o `FuncionarioRepository` (do Documento 2) para executar a lógica de negócio do CRUD de Funcionários, conforme a Seção 5.4 da nossa API.

* **Crie o ficheiro:** `brzburg-api/src/main/java/com/brzburg/brzburg_api/service/FuncionarioService.java`
* **Código:**

```java
package com.brzburg.brzburg_api.service;

import com.brzburg.brzburg_api.model.Funcionario;
import com.brzburg.brzburg_api.repository.FuncionarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service // Diz ao Spring que isto é um componente de lógica de negócio
public class FuncionarioService {

    @Autowired // O Spring injeta o repositório que definimos no Documento 2
    private FuncionarioRepository funcionarioRepository;

    // NOTA: A lógica de Hashing de Senha (criptografia) é crucial
    // e será adicionada aqui quando implementarmos a Funcionalidade 3 (Autenticação).
    // Por agora, vamos salvar a senha como texto puro para testes.
    // TODO: Implementar PasswordEncoder do Spring Security aqui.

    /**
     * Implementa a lógica para: POST /api/admin/funcionarios
     * Cria um novo funcionário.
     */
    public Funcionario criarFuncionario(Funcionario funcionario) {
        // TODO: funcionario.setSenhaHash(passwordEncoder.encode(funcionario.getSenhaHash()));
        funcionario.setActive(true); // Garante que o novo funcionário está ativo
        return funcionarioRepository.save(funcionario);
    }

    /**
     * Implementa a lógica para: PUT /api/admin/funcionarios/{id}
     * Atualiza um funcionário existente.
     */
    public Funcionario atualizarFuncionario(Integer id, Funcionario dadosFuncionario) throws Exception {
        // 1. Busca o funcionário no banco
        Funcionario funcionario = funcionarioRepository.findById(id)
                .orElseThrow(() -> new Exception("Funcionário não encontrado com id: " + id));

        // 2. Atualiza os dados
        funcionario.setNome(dadosFuncionario.getNome());
        funcionario.setCpf(dadosFuncionario.getCpf());
        funcionario.setLogin(dadosFuncionario.getLogin());
        funcionario.setFuncao(dadosFuncionario.getFuncao());
        
        // 3. Verifica se uma *nova* senha foi enviada
        if (dadosFuncionario.getSenhaHash() != null && !dadosFuncionario.getSenhaHash().isEmpty()) {
            // TODO: funcionario.setSenhaHash(passwordEncoder.encode(dadosFuncionario.getSenhaHash()));
            funcionario.setSenhaHash(dadosFuncionario.getSenhaHash()); // Temporário
        }

        // 4. Salva o funcionário atualizado
        return funcionarioRepository.save(funcionario);
    }

    /**
     * Implementa a lógica para: GET /api/admin/funcionarios
     * Busca apenas funcionários ativos (is_active = true).
     */
    public List<Funcionario> getFuncionariosAtivos() {
        return funcionarioRepository.findByIsActive(true);
    }

    /**
     * Implementa a lógica para: GET /api/admin/funcionarios/historico
     * Busca apenas funcionários inativos (is_active = false).
     */
    public List<Funcionario> getFuncionariosInativos() {
        return funcionarioRepository.findByIsActive(false);
    }

    /**
     * Implementa a lógica para: DELETE /api/admin/funcionarios/{id}
     * Aplica a regra de "Soft Delete".
     */
    public void arquivarFuncionario(Integer id) throws Exception {
        Funcionario funcionario = funcionarioRepository.findById(id)
                .orElseThrow(() -> new Exception("Funcionário não encontrado com id: " + id));

        // Regra de Negócio: Não apagar, apenas inativar.
        funcionario.setActive(false);
        funcionarioRepository.save(funcionario);
    }
}
```
# Planeamento e Implementação do Back-end: BRZ Burg (Java/Spring Boot)
# PARTE 4: A CAMADA CONTROLLER (Funcionalidade: Funcionários)

Este documento detalha a implementação da camada `controller` ("Balcão de Pedidos" ou "API") para a gestão de funcionários.

**Propósito:** Esta camada expõe a lógica do `FuncionarioService` (do Documento 3) para o front-end. Ela é responsável por mapear os URLs da nossa API (definidos na Seção 5.4 do `especificacao_das_apis.md`) para os métodos de serviço corretos, usando a dependência `spring-boot-starter-web`.

---

## Funcionalidade 2: Gestão de Funcionários

### 2.4 A Camada `controller`

Vamos **adicionar** estes métodos ao ficheiro `AdminController.java` que já criámos na funcionalidade anterior. Isto unifica todas as APIs de `Admin` num só local.

* **Ficheiro (para editar):** `brzburg-api/src/main/java/com/brzburg/brzburg_api/controller/AdminController.java`
* **Código:**

```java
package com.brzburg.brzburg_api.controller;

import com.brzburg.brzburg_api.model.Funcionario; // Importar o novo model
import com.brzburg.brzburg_api.model.Mesa;
import com.brzburg.brzburg_api.service.FuncionarioService; // Importar o novo service
import com.brzburg.brzburg_api.service.MesaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin") // O URL base continua o mesmo
public class AdminController {

    // --- Dependências ---
    
    @Autowired // A dependência de MesaService (já existente)
    private MesaService mesaService;

    @Autowired // A NOVA dependência para a Funcionalidade 2
    private FuncionarioService funcionarioService;

    
    // --- CRUD de Mesas (Funcionalidade 1 - Já implementada) ---

    @GetMapping("/mesas")
    public List<Mesa> getMesas() {
        return mesaService.getTodasAsMesas();
    }

    @PostMapping("/mesas")
    public ResponseEntity<Mesa> criarMesa(@RequestBody Mesa novaMesa) {
        Mesa mesaSalva = mesaService.criarMesa(novaMesa);
        return new ResponseEntity<>(mesaSalva, HttpStatus.CREATED); 
    }

    @DeleteMapping("/mesas/{id}")
    public ResponseEntity<?> deletarMesa(@PathVariable Integer id) {
        try {
            mesaService.deletarMesa(id);
            return ResponseEntity.noContent().build(); 
        } catch (Exception e) {
            return new ResponseEntity<>(
                Map.of("erro", "Mesa em uso", "mensagem", e.getMessage()), 
                HttpStatus.CONFLICT
            );
        }
    }

    // --- CRUD de Funcionários (Funcionalidade 2 - Nova) ---
    // Implementa a Seção 5.4 da API

    /**
     * Implementa: GET /api/admin/funcionarios
     * Busca e retorna a lista de funcionários ativos.
     */
    @GetMapping("/funcionarios")
    public List<Funcionario> getFuncionariosAtivos() {
        // A anotação @JsonProperty(WRITE_ONLY) no Model (Documento 1)
        // garante que a senhaHash NUNCA seja enviada nesta resposta.
        return funcionarioService.getFuncionariosAtivos();
    }

    /**
     * Implementa: GET /api/admin/funcionarios/historico
     * Busca e retorna a lista de funcionários inativos (arquivados).
     */
    @GetMapping("/funcionarios/historico")
    public List<Funcionario> getFuncionariosHistorico() {
        return funcionarioService.getFuncionariosInativos();
    }

    /**
     * Implementa: POST /api/admin/funcionarios
     * Recebe um JSON de um novo funcionário e o cria.
     */
    @PostMapping("/funcionarios")
    public ResponseEntity<Funcionario> criarFuncionario(@RequestBody Funcionario novoFuncionario) {
        Funcionario funcionarioSalvo = funcionarioService.criarFuncionario(novoFuncionario);
        return new ResponseEntity<>(funcionarioSalvo, HttpStatus.CREATED);
    }

    /**
     * Implementa: PUT /api/admin/funcionarios/{id}
     * Atualiza um funcionário existente.
     */
    @PutMapping("/funcionarios/{id}")
    public ResponseEntity<?> atualizarFuncionario(@PathVariable Integer id, @RequestBody Funcionario dadosFuncionario) {
        try {
            Funcionario funcionarioAtualizado = funcionarioService.atualizarFuncionario(id, dadosFuncionario);
            return ResponseEntity.ok(funcionarioAtualizado);
        } catch (Exception e) {
            // Retorna 404 Not Found se o service lançar a exceção "não encontrado"
            return new ResponseEntity<>(
                Map.of("erro", "Não encontrado", "mensagem", e.getMessage()), 
                HttpStatus.NOT_FOUND
            );
        }
    }

    /**
     * Implementa: DELETE /api/admin/funcionarios/{id}
     * Arquiva (Soft Delete) um funcionário.
     */
    @DeleteMapping("/funcionarios/{id}")
    public ResponseEntity<?> arquivarFuncionario(@PathVariable Integer id) {
        try {
            funcionarioService.arquivarFuncionario(id);
            // Retorna 204 No Content (sucesso, sem conteúdo)
            return ResponseEntity.noContent().build(); 
        } catch (Exception e) {
            // Retorna 404 Not Found se o service lançar a exceção "não encontrado"
            return new ResponseEntity<>(
                Map.of("erro", "Não encontrado", "mensagem", e.getMessage()), 
                HttpStatus.NOT_FOUND
            );
        }
    }
}