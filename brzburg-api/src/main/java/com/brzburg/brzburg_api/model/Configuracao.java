package com.brzburg.brzburg_api.model;

import jakarta.persistence.*;

@Entity
@Table(name = "configuracao")
public class Configuracao {

    @Id
    private Integer id = 1; // Singleton: Sempre será o ID 1

    @Column(name = "sistema_aberto", nullable = false)
    private boolean sistemaAberto = false; // Começa fechado por segurança

    public Configuracao() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    
    public boolean isSistemaAberto() { return sistemaAberto; }
    public void setSistemaAberto(boolean sistemaAberto) { this.sistemaAberto = sistemaAberto; }
}