package com.brzburg.brzburg_api.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.List;

// Aqui ele usa o entity pra o springboot usar o ddl-auto=update para criar a tabela as outras @ sao para o hibernate gerar a tabela com os dados da classe
@Entity
@Table(name = "funcionarios") 
public class Funcionario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // SERIAL
    private Integer id;

    @Column(name = "nome", nullable = false)
    private String nome;

    @Column(name = "cpf", unique = true, nullable = false, length = 11)
    private String cpf;

    @Column(name = "usuario", unique = true, nullable = false, length = 100)
    private String usuario;

     // Esse writed_only le o json do front que tem a senha, mas quando devolve um json ele nao manda a senha de volta
    @Column(name = "senha_hash", nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String senhaHash;

    // Aqui tem as roles vugo funções admin, cozinheiro e garcom
    @Column(name = "funcao", nullable = false, length = 50)
    private String funcao;

    // Aqui teve que fazer esse active pra não excluir de vez do banco os dados do dashboard
    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    // Construtor sem nada que o jpa usa por padrão
    public Funcionario() {
    }

    // Define a role do funcionário para a segurança
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (this.funcao == null) return List.of();
        // O SecurityConfig espera "ADMIN", "GARCOM", etc.
        // Se aqui estiver escrito "ROLE_" + this.funcao, VAI DAR ERRO 403.
        return List.of(new SimpleGrantedAuthority(this.funcao)); 
    }

    // O spring security vai usar a senha criptografada
    @Override
    public String getPassword() {
        return this.senhaHash; 
    }

    // O spring usará o "usuario" como username
    @Override
    public String getUsername() {
        return this.usuario;
    }

    // A conta não expira
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    // A conta nunca é bloqueada
    @Override
    public boolean isAccountNonLocked() {
        return true; 
    }

    // As credenciais nunca expiram
    @Override
    public boolean isCredentialsNonExpired() {
        return true; 
    }

    // A conta está ativa se o nosso is_active for true
    @Override
    public boolean isEnabled() {
        return this.isActive; 
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

    public String getUsuario() {
        return usuario;
    }

    public void setUsuario(String usuario) {
        this.usuario = usuario;
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