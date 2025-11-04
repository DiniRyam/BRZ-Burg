# Planeamento e Implementação do Back-end: BRZ Burg (Java/Spring Boot)
# PARTE 1: A CAMADA MODEL (E A ARQUITETURA GERAL)

O projeto de back-end (`brzburg-api`) foi criado com Java 21 e está configurado para se conectar ao `brzburg_db` e criar/atualizar as tabelas automaticamente, conforme o nosso `SETUP.md`.

## A Arquitetura: 4 Pacotes (Simples e Funcional)

Para manter o nosso projeto limpo, organizado e fácil de dar manutenção, vamos usar uma arquitetura de 4 camadas (pacotes). Cada "departamento" tem uma responsabilidade clara, e todos eles estarão dentro do nosso pacote base `com.brzburg.brzburg_api`.

1.  **`com.brzburg.brzburg_api.model` (ou `entity`)**
    * **Propósito:** O Molde.
    * **O que faz:** Contém as classes Java (ex: `Mesa.java`) que representam as **7 tabelas** do nosso `banco_de_dados.md`. Graças à nossa abordagem "simples e funcional", estas classes também serão usadas para enviar e receber JSONs.

2.  **`com.brzburg.brzburg_api.repository`**
    * **Propósito:** Acesso ao Banco.
    * **O que faz:** Esta é a única camada que fala diretamente com o PostgreSQL. Usando o Spring Data JPA, apenas definimos interfaces (ex: `MesaRepository.java`) e o Spring Boot escreve o SQL para nós (ex: `findAll()`, `save()`).

3.  **`com.brzburg.brzburg_api.service`**
    * **Propósito:** As regras de negocio.
    * **O que faz:** Contém **100% da lógica de negócio**. É chamado pelo `Controller`. Ele implementa as regras dos nossos documentos (ex: "não se pode apagar uma mesa ocupada", "a regra de cancelamento de 60s", "calcular KPIs do Dashboard").

4.  **`com.brzburg.brzburg_api.controller`**
    * **Propósito:** A API.
    * **O que faz:** É a única camada que fala com o front-end (React). Ela expõe os nossos endpoints (ex: `GET /api/admin/mesas`) usando a dependência `spring-boot-starter-web`. A sua única função é receber pedidos JSON, chamar o `Service` correto e devolver a resposta.

---

## Funcionalidade 1: Gestão de Mesas

### 1.1 A Camada `model`

Esta classe traduz a `Tabela 2: mesas` do nosso `banco_de_dados.md`.

* **Crie a pasta:** `brzburg-api/src/main/java/com/brzburg/brzburg_api/model`
* **Crie o ficheiro:** `Mesa.java`
* **Código:**

```java
package com.brzburg.brzburg_api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Representa a Tabela 2: mesas.
 * Esta classe é uma @Entity, o que significa que o Spring Data JPA
 * irá geri-la e criar/atualizar a tabela no banco de dados.
 */
@Entity
@Table(name = "mesas") // Garante que o nome da tabela é "mesas", como no nosso MD
public class Mesa {

    @Id // Marca como chave primária
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Diz ao Postgres para auto-numerar (SERIAL)
    private Integer id;

    @Column(name = "nome", nullable = false, length = 100) // Mapeia a coluna 'nome'
    private String nome;

    @Column(name = "status", nullable = false, length = 50) // Mapeia a coluna 'status'
    private String status;

    // Construtor vazio (obrigatório para o Spring Data JPA)
    public Mesa() {
    }

    // --- Getters e Setters ---
    // (Necessários para o Spring Boot converter esta classe para e de JSON)

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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
```
# Planeamento e Implementação do Back-end: BRZ Burg (Java/Spring Boot)
# PARTE 2: A CAMADA REPOSITORY

Este documento detalha a implementação da camada `repository` ("Almoxarifado").

**Propósito:** Esta camada é a única que fala diretamente com o banco de dados. Usando o Spring Data JPA (da dependência `spring-boot-starter-data-jpa`), apenas definimos interfaces e o Spring Boot escreve o SQL para nós.

---

## Funcionalidade 1: Gestão de Mesas

### 1.2 A Camada `repository`

Esta interface dá-nos o poder de `save()`, `findAll()`, `findById()` e `delete()` na tabela `mesas` sem escrever SQL. Ela "lê" a classe `Mesa.java` que definimos no Documento 1.

* **Crie a pasta:** `brzburg-api/src/main/java/com/brzburg/brzburg_api/repository`
* **Crie o ficheiro:** `MesaRepository.java`
* **Código:**

```java
package com.brzburg.brzburg_api.repository;

import com.brzburg.brzburg_api.model.Mesa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Representa o "Almoxarifado" para a entidade Mesa.
 * Ao estender JpaRepository (da dependência spring-boot-starter-data-jpa), 
 * o Spring Boot fornece automaticamente todos os métodos CRUD (Create, Read, Update, Delete) 
 * para a tabela 'mesas'.
 */
@Repository
// JpaRepository<TipoDoModelo, TipoDaChavePrimaria>
public interface MesaRepository extends JpaRepository<Mesa, Integer> {
    
    // O Spring Data JPA cria magicamente os métodos que precisamos:
    // 
    // - save(Mesa mesa): (Usado pelo nosso Service para Criar/Atualizar)
    // - findAll(): (Usado pelo nosso Service para a API GET /api/admin/mesas)
    // - findById(Integer id): (Usado pelo nosso Service para a API DELETE)
    // - delete(Mesa mesa): (Usado pelo nosso Service para a API DELETE)
    //
    // Nenhum código adicional é necessário aqui para o CRUD básico de Mesas.
}
```
# Planeamento e Implementação do Back-end: BRZ Burg (Java/Spring Boot)
# PARTE 3: A CAMADA SERVICE

Este documento detalha a implementação da camada `service` ("Chef de Cozinha" ou "Cérebro").

**Propósito:** Esta camada contém **100% da lógica de negócio**. Ela é chamada pelo `Controller` (Documento 4) e chama o `Repository` (Documento 2) para buscar ou salvar dados. É aqui que implementamos as regras dos nossos documentos de planeamento (ex: "não se pode apagar uma mesa ocupada").

---

## Funcionalidade 1: Gestão de Mesas

### 1.3 A Camada `service`

Esta classe implementa a lógica para as APIs de Mesas. Ela usa o `MesaRepository` (do Documento 2) para interagir com o banco de dados e aplica as nossas regras de negócio.

* **Crie a pasta:** `brzburg-api/src/main/java/com/brzburg/brzburg_api/service`
* **Crie o ficheiro:** `MesaService.java`
* **Código:**

```java
package com.brzburg.brzburg_api.service;

import com.brzburg.brzburg_api.model.Mesa;
import com.brzburg.brzburg_api.repository.MesaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service // Diz ao Spring que isto é um componente de lógica de negócio
public class MesaService {

    // Injeção de Dependência: O Spring automaticamente fornece o repositório
    // que definimos no Documento 2.
    @Autowired
    private MesaRepository mesaRepository;

    /**
     * Implementa a lógica para: GET /api/admin/mesas
     * Busca todas as mesas no banco.
     * (Neste caso, a lógica é simples: apenas repassar o pedido ao repositório).
     */
    public List<Mesa> getTodasAsMesas() {
        return mesaRepository.findAll();
    }

    /**
     * Implementa a lógica para: POST /api/admin/mesas
     * Cria uma nova mesa.
     */
    public Mesa criarMesa(Mesa mesa) {
        // Regra de Negócio: Conforme o banco_de_dados.md, 
        // toda nova mesa deve começar com o status "LIVRE".
        mesa.setStatus("LIVRE"); 
        return mesaRepository.save(mesa);
    }

    /**
     * Implementa a lógica para: DELETE /api/admin/mesas/{id}
     * Apaga uma mesa, mas apenas se a nossa regra de negócio permitir.
     */
    public void deletarMesa(Integer id) throws Exception {
        // 1. Busca a mesa no banco
        Optional<Mesa> mesaOptional = mesaRepository.findById(id);
        
        if (mesaOptional.isEmpty()) {
            // Se a mesa não existe, lança um erro
            throw new Exception("Mesa com ID " + id + " não encontrada.");
        }

        Mesa mesa = mesaOptional.get();

        // 2. A REGRA DE SEGURANÇA (definida no especificacao_das_apis.md)
        if ("OCUPADA".equals(mesa.getStatus())) {
            // Esta exceção será capturada pelo Controller (Documento 4) e enviada como Erro 409
            throw new Exception("A '" + mesa.getNome() + "' está em uso e não pode ser excluída.");
        }

        // 3. Se estiver "LIVRE", permite a deleção
        mesaRepository.delete(mesa);
    }
}
```
# Planeamento e Implementação do Back-end: BRZ Burg (Java/Spring Boot)
# PARTE 4: A CAMADA CONTROLLER

Este documento detalha a implementação da camada `controller` ("Balcão de Pedidos" ou "API").

**Propósito:** Esta é a única camada que fala com o mundo exterior (o front-end React). Ela é responsável por expor os nossos endpoints da API, como definido no `especificacao_das_apis.md`. Ela usa a dependência `spring-boot-starter-web`. A sua única função é receber pedidos JSON, chamar o `Service` (Documento 3) e devolver a resposta.

---

## Funcionalidade 1: Gestão de Mesas

### 1.4 A Camada `controller`

Esta classe expõe a lógica do `MesaService` para o front-end. Ela lida com as requisições HTTP, converte JSON para objetos `Mesa` (do Documento 1) e trata as exceções (como a de "Mesa em uso") vindas do `MesaService` (Documento 3).

* **Crie a pasta:** `brzburg-api/src/main/java/com/brzburg/brzburg_api/controller`
* **Crie o ficheiro:** `AdminController.java` (Vamos criar um único controller para o Admin, e adicionar as funções de Mesas a ele. Se o ficheiro já existir de um passo anterior, apenas adicione os métodos de Mesas).
* **Código:**

```java
package com.brzburg.brzburg_api.controller;

import com.brzburg.brzburg_api.model.Mesa;
import com.brzburg.brzburg_api.service.MesaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController // Diz ao Spring que esta classe é um Controller de API REST
@RequestMapping("/api/admin") // Define o URL base para todas as APIs de Admin
public class AdminController {

    // Injeção de Dependência: O Spring injeta o "Cérebro" (Service)
    @Autowired
    private MesaService mesaService;

    // (Outras dependências de Service, como FuncionarioService,
    // serão adicionadas aqui mais tarde)

    // --- CRUD de Mesas (Seção 5.3 da API) ---

    /**
     * Implementa: GET /api/admin/mesas
     * Busca e retorna a lista de todas as mesas.
     */
    @GetMapping("/mesas")
    public List<Mesa> getMesas() {
        // O Spring converterá a Lista<Mesa> para um JSON automaticamente
        return mesaService.getTodasAsMesas();
    }

    /**
     * Implementa: POST /api/admin/mesas
     * Recebe um JSON de uma nova mesa, chama o service para criá-la.
     */
    @PostMapping("/mesas")
    public ResponseEntity<Mesa> criarMesa(@RequestBody Mesa novaMesa) {
        // @RequestBody converte o JSON que vem do front-end para o objeto 'Mesa'
        Mesa mesaSalva = mesaService.criarMesa(novaMesa);
        
        // Retorna 201 Created (código de sucesso para criação)
        return new ResponseEntity<>(mesaSalva, HttpStatus.CREATED); 
    }

    /**
     * Implementa: DELETE /api/admin/mesas/{id}
     * Tenta deletar uma mesa pelo seu ID.
     */
    @DeleteMapping("/mesas/{id}")
    public ResponseEntity<?> deletarMesa(@PathVariable Integer id) {
        try {
            // Tenta executar a lógica de negócio (do Service)
            mesaService.deletarMesa(id);
            
            // Se tiver sucesso, retorna 204 No Content
            return ResponseEntity.noContent().build(); 

        } catch (Exception e) {
            // Se o Service lançar a exceção (ex: "Mesa em uso"), nós a capturamos.
            // Esta é a implementação da nossa regra de segurança da API.
            // Retornamos o Erro 409 (Conflito) que definimos no nosso Contrato de API
            return new ResponseEntity<>(
                Map.of("erro", "Mesa em uso", "mensagem", e.getMessage()), 
                HttpStatus.CONFLICT
            );
        }
    }
}