package com.brzburg.brzburg_api.service;

import com.brzburg.brzburg_api.model.Funcionario;
import com.brzburg.brzburg_api.repository.FuncionarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

//aqui fala que tem uma parte de logica de negocios pro springboot
@Service 
public class FuncionarioService {

    // o autowired injeta o objeto do repositorio que o spring cria e guarda 
    @Autowired 
    private FuncionarioRepository funcionarioRepository;

     //aqui cria a logica para o post da api para poder criar um funcionario novo, e o active true diz que o funcionario esta ativo
    public Funcionario criarFuncionario(Funcionario funcionario) {
        funcionario.setActive(true);
        return funcionarioRepository.save(funcionario);
    }

    // aqui é para a api com pedido de atualizacao de funcionario, fazendo a busca no banco, e mensagem se o id nao existir
    public Funcionario atualizarFuncionario(Integer id, Funcionario dadosFuncionario) throws Exception {
        Funcionario funcionario = funcionarioRepository.findById(id)
                .orElseThrow(() -> new Exception("Funcionário não encontrado com id: " + id));

        // joga todos os dados novos com os metodos get e set
        funcionario.setNome(dadosFuncionario.getNome());
        funcionario.setCpf(dadosFuncionario.getCpf());
        funcionario.setLogin(dadosFuncionario.getLogin());
        funcionario.setFuncao(dadosFuncionario.getFuncao());
        
        // aqui olha se uma senha nova foi mandada
        if (dadosFuncionario.getSenhaHash() != null && !dadosFuncionario.getSenhaHash().isEmpty()) {
            funcionario.setSenhaHash(dadosFuncionario.getSenhaHash()); 
        }

        // aqui salva o funcionario no banco
        return funcionarioRepository.save(funcionario);
    }

    // aqui é um get pa admin, faz a busca por funcionarios ativos
    public List<Funcionario> getFuncionariosAtivos() {
        return funcionarioRepository.findByIsActive(true);
    }

    //aqui so os inativos
    public List<Funcionario> getFuncionariosInativos() {
        return funcionarioRepository.findByIsActive(false);
    }

    // aqui é pro pedido delete da api do admin, e usa o soft delete para nao apagar dados do banco diretamente
    public void arquivarFuncionario(Integer id) throws Exception {
        Funcionario funcionario = funcionarioRepository.findById(id)
                .orElseThrow(() -> new Exception("Funcionário não encontrado com id: " + id));

        // ele nao deleta deleta, so deixa inativo
        funcionario.setActive(false);
        funcionarioRepository.save(funcionario);
    }
}