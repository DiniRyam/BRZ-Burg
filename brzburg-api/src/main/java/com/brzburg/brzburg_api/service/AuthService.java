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

    // Injete o ConfiguracaoService
    @Autowired
    private ConfiguracaoService configuracaoService;

    // aqui ele olha as credenciais, e se for valido retorna um token
    public String login(String login, String senha) throws Exception {

        // encontra um funcionario pelo login com o metodo la do funcionariorepository
        Funcionario funcionario = funcionarioRepository.findByUsuario(login)
                .orElseThrow(() -> new Exception("Login ou senha inválidos."));

        // olha se ele esta ativo
        if (!funcionario.isActive()) {
            throw new Exception("Esta conta de funcionário está inativa.");
        }

        // --- NOVA LÓGICA DE BLOQUEIO ---
        // Se o sistema estiver FECHADO e o usuário NÃO for ADMIN...
        if (!configuracaoService.isSistemaAberto() && !"ADMIN".equals(funcionario.getFuncao())) {
            throw new Exception("O restaurante está FECHADO. Apenas o Gerente pode entrar.");
        }
        // -------------------------------

        // 2. Verifica senha
        if (!passwordEncoder.matches(senha, funcionario.getSenhaHash())) {
            throw new Exception("Senha incorreta");
        }

        // 3. Gera token
        return tokenService.gerarToken(funcionario);
    }
}
