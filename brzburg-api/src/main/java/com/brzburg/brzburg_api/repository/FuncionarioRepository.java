package com.brzburg.brzburg_api.repository;

import com.brzburg.brzburg_api.model.Funcionario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional; // <--- Importante para o findBy funcionar

@Repository
public interface FuncionarioRepository extends JpaRepository<Funcionario, Integer> {
    
    // Busca para o Login e para evitar duplicidade de usuário
    Optional<Funcionario> findByUsuario(String usuario);

    // --- O ERRO ESTAVA AQUI: Faltava este método ---
    // Busca para evitar duplicidade de CPF
    Optional<Funcionario> findByCpf(String cpf);
    // ----------------------------------------------

    // Busca para listar ativos/inativos
    List<Funcionario> findByIsActive(boolean isActive);
}