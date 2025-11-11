package com.brzburg.brzburg_api.repository;

import com.brzburg.brzburg_api.model.CardapioSecao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Representa o "Almoxarifado" para a entidade CardapioSecao (Tabela 3).
 * Estende JpaRepository para ganhar os métodos CRUD automáticos.
 */

//a interface extende o jparepository para gerar os metodos do crud automaticamente
@Repository
public interface CardapioSecaoRepository extends JpaRepository<CardapioSecao, Integer> {
    
// aqui nao precisa de nenhum metodo especial, so o findall findbyid save e delete ja da
}