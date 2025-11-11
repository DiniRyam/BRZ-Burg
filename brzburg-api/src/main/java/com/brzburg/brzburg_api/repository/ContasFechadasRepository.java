package com.brzburg.brzburg_api.repository;

import com.brzburg.brzburg_api.model.ContasFechadas;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ContasFechadasRepository extends JpaRepository<ContasFechadas, Integer> {

    // esse é o mais importante para a api que puxa todas as coisas pela data
    List<ContasFechadas> findAllByDataFechamentoBetween(LocalDateTime inicio, LocalDateTime fim);
}