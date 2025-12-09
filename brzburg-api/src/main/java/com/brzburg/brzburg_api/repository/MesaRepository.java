package com.brzburg.brzburg_api.repository;

import com.brzburg.brzburg_api.model.Mesa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

// Isso diz ao spring que isso é um componente para acessar os dados JpaRepository<TipoDoModelo, TipoDaChavePrimaria>
@Repository
public interface MesaRepository extends JpaRepository<Mesa, Integer> {
    // O spring cria sozinho os metodos que a API vai usar, o findAll que é o get, o save que é o post, o deleteBy Id que é o delete, e o findById para o service

    List<Mesa> findByIsActiveTrue();
}
