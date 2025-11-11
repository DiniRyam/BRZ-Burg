package com.brzburg.brzburg_api.service;

import com.brzburg.brzburg_api.model.Funcionario;
import com.brzburg.brzburg_api.repository.FuncionarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private FuncionarioRepository funcionarioRepository;

    // aqui a ferramenta pra criptografia
    @Autowired
    private PasswordEncoder passwordEncoder;

    // e aqui o serviço de token
    @Autowired
    private TokenService tokenService;

    // aqui ele olha as credenciais, e se for valido retorna um token
    public String login(String login, String senha) throws Exception {

        // encontra um funcionario pelo login com o metodo la do funcionariorepository
        Funcionario funcionario = funcionarioRepository.findByLogin(login)
                .orElseThrow(() -> new Exception("Login ou senha inválidos."));

        // olha se ele esta ativo
        if (!funcionario.isActive()) {
            throw new Exception("Esta conta de funcionário está inativa.");
        }

        // ve se a senha em texto e igual a criptografada usando o passwordencoder do securityconfig
        if (passwordEncoder.matches(senha, funcionario.getSenhaHash())) {
            
            // se for igual gera e retorna um token novo
            return tokenService.gerarToken(funcionario);
        } else {

            // se nao ele da só o erro padrao ai na maior
            throw new Exception("Login ou senha inválidos.");
        }
    }
}