package com.brzburg.brzburg_api.model;

import jakarta.persistence.*;
import java.math.BigDecimal; // Importante para dinheiro por que usa decimal e nao binario, e usa metodos para calcular

// Mapeia para o nome da tabela do nosso banco
@Entity
@Table(name = "cardapio_itens") 
public class CardapioItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // aqui mostra o relacionamento de que muitos itens pertencem a uma secao, e joincolumn define a coluna que faz a chave estrangeira com a tabela cardapiosecoes
    @ManyToOne 
    @JoinColumn(name = "secao_id", nullable = false)
    private CardapioSecao secao;

    @Column(name = "nome", nullable = false, length = 150)
    private String nome;

    @Column(name = "descricao", columnDefinition = "TEXT")
    private String descricao;

    // usa o bigdecimal por que é mais preciso que float e double pra mexer com dinheiro com segurança
    @Column(name = "preco", nullable = false, precision = 10, scale = 2)
    private BigDecimal preco;
    
    // a api de upload vai preencher este espaço com as imagens 
    @Column(name = "imagem_url")
    private String imagemUrl; 

    //usa o isactive para nao excluir diretamente do banco, o softdelete
    @Column(name = "is_active", nullable = false)
    private boolean isActive = true; 

    // para o controle de itens do dia sem precisar excluir do cardapio
    @Column(name = "is_disponivel", nullable = false)
    private boolean isDisponivel = true; 

    // construtor vazio
    public CardapioItem() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public CardapioSecao getSecao() {
        return secao;
    }

    public void setSecao(CardapioSecao secao) {
        this.secao = secao;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public BigDecimal getPreco() {
        return preco;
    }

    public void setPreco(BigDecimal preco) {
        this.preco = preco;
    }

    public String getImagemUrl() {
        return imagemUrl;
    }

    public void setImagemUrl(String imagemUrl) {
        this.imagemUrl = imagemUrl;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public boolean isDisponivel() {
        return isDisponivel;
    }

    public void setDisponivel(boolean disponivel) {
        isDisponivel = disponivel;
    }
}