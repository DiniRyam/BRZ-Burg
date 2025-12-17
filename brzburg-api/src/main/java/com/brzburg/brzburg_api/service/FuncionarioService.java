package com.brzburg.brzburg_api.service;

import com.brzburg.brzburg_api.model.Funcionario;
import com.brzburg.brzburg_api.repository.FuncionarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional; // <--- PRECISARÁ DISSO DESCOMENTADO

@Service 
public class FuncionarioService {

    @Autowired 
    private FuncionarioRepository funcionarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // --- AQUI ESTÁ A MUDANÇA PRINCIPAL ---
    public Funcionario criarFuncionario(Funcionario funcionario) {

        // 1. Verifica se o login (usuario) já existe no banco
        if (funcionarioRepository.findByUsuario(funcionario.getUsuario()).isPresent()) {
            throw new RuntimeException("O login '" + funcionario.getUsuario() + "' já está em uso.");
        }

        // 2. Verifica se o CPF já existe
        if (funcionarioRepository.findByCpf(funcionario.getCpf()).isPresent()) {
            throw new RuntimeException("O CPF '" + funcionario.getCpf() + "' já está cadastrado.");
        }

        // 3. Criptografa a senha
        String senhaCriptografada = passwordEncoder.encode(funcionario.getSenhaHash());
        funcionario.setSenhaHash(senhaCriptografada);

        // 4. Ativa o funcionário
        funcionario.setActive(true);
        
        return funcionarioRepository.save(funcionario);
    }
    // -------------------------------------

    public Funcionario atualizarFuncionario(Integer id, Funcionario dadosFuncionario) throws Exception {
        Funcionario funcionario = funcionarioRepository.findById(id)
                .orElseThrow(() -> new Exception("Funcionário não encontrado com id: " + id));

        funcionario.setNome(dadosFuncionario.getNome());
        funcionario.setCpf(dadosFuncionario.getCpf());
        funcionario.setUsuario(dadosFuncionario.getUsuario());
        funcionario.setFuncao(dadosFuncionario.getFuncao());
        
        if (dadosFuncionario.getSenhaHash() != null && !dadosFuncionario.getSenhaHash().isEmpty()) {
            String novaSenhaCriptografada = passwordEncoder.encode(dadosFuncionario.getSenhaHash());
            funcionario.setSenhaHash(novaSenhaCriptografada); 
        }

        return funcionarioRepository.save(funcionario);
    }

    public List<Funcionario> getFuncionariosAtivos() {
        return funcionarioRepository.findByIsActive(true);
    }

    public List<Funcionario> getFuncionariosInativos() {
        return funcionarioRepository.findByIsActive(false);
    }

    public void arquivarFuncionario(Integer id) throws Exception {
        Funcionario funcionario = funcionarioRepository.findById(id)
                .orElseThrow(() -> new Exception("Funcionário não encontrado com id: " + id));

        funcionario.setActive(false);
        funcionarioRepository.save(funcionario);
    }
}