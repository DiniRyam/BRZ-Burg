package com.brzburg.brzburg_api.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore; // Importante para evitar loops
import java.util.List; // Importante

@Entity
@Table(name = "comandas")
public class Comanda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Depende da classe mesa.java e faz a chave estrangeira aqui com o manytoone e joincolumn
    @ManyToOne
    @JoinColumn(name = "mesa_id", nullable = false)
    private Mesa mesa; 

    // Status se esta ativa ou fechada
    @Column(name = "status", nullable = false, length = 50)
    private String status = "ATIVA"; 

    // Se esta nula ou se foi feita a acao de pedir conta
    @Column(name = "status_solicitacao", length = 50)
    private String statusSolicitacao; 

    @Column(name = "data_abertura", nullable = false, updatable = false)
    private LocalDateTime dataAbertura = LocalDateTime.now();

    @OneToMany(mappedBy = "comanda") 
    @JsonIgnore // impede que o JSON entre em loop infinito ao listar comandas
    private List<ItemPedido> itemPedidos;

    public Comanda() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Mesa getMesa() { return mesa; }
    public void setMesa(Mesa mesa) { this.mesa = mesa; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getStatusSolicitacao() { return statusSolicitacao; }
    public void setStatusSolicitacao(String statusSolicitacao) { this.statusSolicitacao = statusSolicitacao; }
    public LocalDateTime getDataAbertura() { return dataAbertura; }
    public void setDataAbertura(LocalDateTime dataAbertura) { this.dataAbertura = dataAbertura; }

    // Novo Getter e Setter para a lista
    public List<ItemPedido> getItemPedidos() {
        return itemPedidos;
    }

    public void setItemPedidos(List<ItemPedido> itemPedidos) {
        this.itemPedidos = itemPedidos;
    }
}