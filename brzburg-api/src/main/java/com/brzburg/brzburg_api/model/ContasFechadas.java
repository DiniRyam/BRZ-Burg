package com.brzburg.brzburg_api.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "contas_fechadas")
public class ContasFechadas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Relacionamento um pra um, uma conta fechada pertence a uma comanda e depende de comanda.java
    @OneToOne
    @JoinColumn(name = "comanda_id", nullable = false, unique = true)
    private Comanda comanda; 

    // Depende de funcionario.java implementado antes 
    @ManyToOne
    @JoinColumn(name = "funcionario_id", nullable = false)
    private Funcionario funcionario;

    @Column(name = "valor_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorTotal;

    // Pega o método de pagamento
    @Column(name = "metodo_pagamento", nullable = false, length = 50)
    private String metodoPagamento; 

    @Column(name = "data_fechamento", nullable = false)
    private LocalDateTime dataFechamento = LocalDateTime.now();

    public ContasFechadas() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Comanda getComanda() { return comanda; }
    public void setComanda(Comanda comanda) { this.comanda = comanda; }
    public Funcionario getFuncionario() { return funcionario; }
    public void setFuncionario(Funcionario funcionario) { this.funcionario = funcionario; }
    public BigDecimal getValorTotal() { return valorTotal; }
    public void setValorTotal(BigDecimal valorTotal) { this.valorTotal = valorTotal; }
    public String getMetodoPagamento() { return metodoPagamento; }
    public void setMetodoPagamento(String metodoPagamento) { this.metodoPagamento = metodoPagamento; }
    public LocalDateTime getDataFechamento() { return dataFechamento; }
    public void setDataFechamento(LocalDateTime dataFechamento) { this.dataFechamento = dataFechamento; }
}