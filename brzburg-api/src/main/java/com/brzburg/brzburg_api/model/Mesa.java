package com.brzburg.brzburg_api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

//aqui dis que é uma tabela para o jpa  e cria ela com o nome mesas no banco
@Entity
@Table(name = "mesas")
public class Mesa {

    //marca o id como chave primaria e cria a coluna id
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    //aqui cria a coluna nome
    @Column(name = "nome", nullable = false, length = 100)
    private String nome;

    //aqui cria a coluna status
    @Column(name = "status", nullable = false, length = 50)
    private String status;

    //construtor vazio para o JPA para criar tabelas no banco
    public Mesa() {
    }

    //metodos getters e setters
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
