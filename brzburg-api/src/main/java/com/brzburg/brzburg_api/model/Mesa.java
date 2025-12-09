package com.brzburg.brzburg_api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

// Aqui diz que é uma tabela para o jpa e o hibernate e cria ela com o nome mesas no banco
@Entity
@Table(name = "mesas")
public class Mesa {

    // Marca o id como chave primaria e cria a coluna id
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Cria a coluna nome
    @Column(name = "nome", nullable = false, length = 100)
    private String nome;

    // Cria a coluna status
    @Column(name = "status", nullable = false, length = 50)
    private String status;

    // cria coluna is_active para o softdelete da mesa
    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    // Construtor vazio para o JPA para criar tabelas no banco com o hibernate
    public Mesa() {
    }

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

    public boolean isActive() {
         return isActive; 
    }
    public void setActive(boolean active) { 
        isActive = active; 
    }
}
