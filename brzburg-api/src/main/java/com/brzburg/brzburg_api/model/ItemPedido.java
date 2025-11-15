package com.brzburg.brzburg_api.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "item_pedido")
public class ItemPedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Depende da classe comanda.java por isso o manytoone e joincolumn
    @ManyToOne
    @JoinColumn(name = "comanda_id", nullable = false)
    private Comanda comanda; 

    // Depende da classe cardapioitem.java usa joincolumn
    @ManyToOne
    @JoinColumn(name = "item_id", nullable = false)
    private CardapioItem item; 

    @Column(name = "quantidade", nullable = false)
    private Integer quantidade;

    @Column(name = "observacao", columnDefinition = "TEXT")
    private String observacao;

    // Trava de segurança e usa o bigdecimal para os valores
    @Column(name = "preco_no_momento", nullable = false, precision = 10, scale = 2)
    private BigDecimal precoNoMomento; 

    // Status do pedido pendente em preparo cancelado e devolvido
    @Column(name = "status", nullable = false, length = 50)
    private String status = "PENDENTE"; 

    // Regra dos 60 segundos para cancelar um pedido
    @Column(name = "timestamp_pedido", nullable = false, updatable = false)
    private LocalDateTime timestampPedido = LocalDateTime.now();

    public ItemPedido() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Comanda getComanda() { return comanda; }
    public void setComanda(Comanda comanda) { this.comanda = comanda; }
    public CardapioItem getItem() { return item; }
    public void setItem(CardapioItem item) { this.item = item; }
    public Integer getQuantidade() { return quantidade; }
    public void setQuantidade(Integer quantidade) { this.quantidade = quantidade; }
    public String getObservacao() { return observacao; }
    public void setObservacao(String observacao) { this.observacao = observacao; }
    public BigDecimal getPrecoNoMomento() { return precoNoMomento; }
    public void setPrecoNoMomento(BigDecimal precoNoMomento) { this.precoNoMomento = precoNoMomento; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getTimestampPedido() { return timestampPedido; }
    public void setTimestampPedido(LocalDateTime timestampPedido) { this.timestampPedido = timestampPedido; }
}