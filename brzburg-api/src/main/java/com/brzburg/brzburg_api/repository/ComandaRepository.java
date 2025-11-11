package com.brzburg.brzburg_api.repository;

import com.brzburg.brzburg_api.model.Comanda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ComandaRepository extends JpaRepository<Comanda, Integer> {

    // metodo especial para o get da api /api/cliente/iniciar-sessao acha uma comanda ativa para o id de uma mesa especifica entao permite o cliente reabrir o pedido
    Optional<Comanda> findByMesaIdAndStatus(Integer mesaId, String status);
}