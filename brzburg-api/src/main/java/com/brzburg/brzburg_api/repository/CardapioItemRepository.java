package com.brzburg.brzburg_api.repository;

import com.brzburg.brzburg_api.model.CardapioItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // IMPORTANTE
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CardapioItemRepository extends JpaRepository<CardapioItem, Integer> {

    List<CardapioItem> findBySecaoId(Integer secaoId);

    // --- CORREÇÃO DEFINITIVA: Query manual (JPQL) ---
    // Isso ignora a confusão de nomes e busca direto no objeto.
    @Query("SELECT i FROM CardapioItem i WHERE i.isActive = true")
    List<CardapioItem> buscarTodosAtivos();

    @Query("SELECT i FROM CardapioItem i WHERE i.isActive = true AND i.isDisponivel = true")
    List<CardapioItem> buscarParaCliente();
}