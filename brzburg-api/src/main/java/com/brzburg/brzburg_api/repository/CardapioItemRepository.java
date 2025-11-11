package com.brzburg.brzburg_api.repository;

import com.brzburg.brzburg_api.model.CardapioItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

 // estende jparepository para pegar os metodos (JpaRepository<TipoDoModelo, TipoDaChavePrimaria>)
@Repository
public interface CardapioItemRepository extends JpaRepository<CardapioItem, Integer> {

    //aqui tem que ter uns metodos especiais pensando no dashboard
    // metodo para a api GET /api/admin/cardapio-editor filtrar por secao
    List<CardapioItem> findBySecaoId(Integer secaoId);

    //aqui para buscar os itens fora do soft dele vugo arquivados com a api GET /api/admin/itens-disponibilidade
    List<CardapioItem> findByIsActiveTrue();

    // aqui busca os itens ativos e disponiveis para a api do cliente GET /api/cliente/iniciar-sessao
    List<CardapioItem> findByIsActiveTrueAndIsDisponivelTrue();
}