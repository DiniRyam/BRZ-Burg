package com.brzburg.brzburg_api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

// Mapeia para o nome da tabela
@Entity
@Table(name = "cardapio_secoes")  
public class CardapioSecao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "nome_secao", unique = true, nullable = false, length = 100)
    private String nomeSecao;

    // Construtor vazio obrigatório para JPA
    public CardapioSecao() {
    }

    //getters e setters 

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNomeSecao() {
        return nomeSecao;
    }

    public void setNomeSecao(String nomeSecao) {
        this.nomeSecao = nomeSecao;
    }
}