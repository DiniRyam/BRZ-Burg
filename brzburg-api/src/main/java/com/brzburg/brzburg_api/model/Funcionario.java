package com.brzburg.brzburg_api.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

// aqui ele usa o entity pra o springboot usar o ddl-auto=update para criar a tabela
// as outras @ sao para o hibernate gerar a tabela com os dados da classe
@Entity
@Table(name = "funcionarios") 
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

     // esse writed_only le o json do front que tem a senha, mas quando devolve um json ele nao manda a senha de volta
    @Column(name = "senha_hash", nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String senhaHash;

    // aqui tem as roles vugo funcoes admin, cozinheiro e garcom
    @Column(name = "funcao", nullable = false, length = 50)
    private String funcao;

    //aqui teve que fazer esse active pra nao excluir de vez do banco os dados do dashboard
    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    // Construtor sem nada que o jpa usa por padrao
    public Funcionario() {
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

    public String getSenhaHash() {
        return senhaHash;
    }

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