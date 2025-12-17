package com.brzburg.brzburg_api.controller;

import com.brzburg.brzburg_api.model.Funcionario;
import com.brzburg.brzburg_api.repository.FuncionarioRepository;
import com.brzburg.brzburg_api.service.AuthService;
import com.brzburg.brzburg_api.service.ConfiguracaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private ConfiguracaoService configService;

    @Autowired
    private FuncionarioRepository funcionarioRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {

        try {
            String login = loginRequest.get("login");
            String senha = loginRequest.get("senha");

            // Autentica e gera token
            String token = authService.login(login, senha);

            // Busca dados do funcionário autenticado
            Funcionario funcionario = funcionarioRepository.findByUsuario(login)
                    .orElseThrow(() -> new Exception("Funcionário não encontrado."));

            // Retorna token + dados do usuário
            return ResponseEntity.ok(
                    Map.of(
                            "token", token,
                            "usuario", funcionario
                    )
            );

        } catch (Exception e) {
            return new ResponseEntity<>(
                    Map.of(
                            "erro", "Não autorizado",
                            "mensagem", e.getMessage()
                    ),
                    HttpStatus.UNAUTHORIZED
            );
        }
    }

    @GetMapping("/status-publico")
    public ResponseEntity<?> getStatusPublico() {
        return ResponseEntity.ok(Map.of("aberto", configService.isSistemaAberto()));
    }
}
