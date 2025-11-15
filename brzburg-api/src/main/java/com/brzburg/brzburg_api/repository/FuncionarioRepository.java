package com.brzburg.brzburg_api.repository;

import com.brzburg.brzburg_api.model.Funcionario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

// A tag do repository pro jpa, que é uma interface e vira um objeto guardado no spring, extendendo o jparepository ele cria os metodos automatico, funcionario pro modelo da tabela e o integer o tipo do dado da chave primaria
@Repository
public interface FuncionarioRepository extends JpaRepository<Funcionario, Integer> {

    // Método criado pra a api do admin pro dashboard, e pra achar os funcionarios
    List<Funcionario> findByIsActive(boolean isActive);

    // Aqui é pra a api de autenticacao, do login usado
    Optional<Funcionario> findByUsuario(String login);
}