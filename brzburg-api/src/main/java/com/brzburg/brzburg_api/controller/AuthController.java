package com.brzburg.brzburg_api.controller;

import com.brzburg.brzburg_api.model.Funcionario;
import com.brzburg.brzburg_api.repository.FuncionarioRepository;
import com.brzburg.brzburg_api.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

// Aqui pega a url para autenticacao
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    // Usa o objeto da lógica de login
    @Autowired
    private AuthService authService;

    // Precisamos buscar o funcionário para devolver ao front
    @Autowired
    private FuncionarioRepository funcionarioRepository;

    /* Recebe o login e senha e tenta autenticar o usuario */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {

        try {
            String login = loginRequest.get("login");
            String senha = loginRequest.get("senha");

            // Chama o auth service que usa o password encoder e o token service
            String token = authService.login(login, senha);

            // Buscar o funcionário para retornar ao front-end
            Funcionario funcionario = funcionarioRepository.findByUsuario(login)
                    .orElseThrow(() -> new Exception("Funcionário não encontrado."));

            // Retornar token + dados do usuário igual o front precisa
            return ResponseEntity.ok(
                    Map.of(
                            "token", token,
                            "usuario", funcionario
                    )
            );

        } catch (Exception e) {

            // Se der ruim retorna 401
            return new ResponseEntity<>(
                    Map.of(
                            "erro", "Não autorizado",
                            "mensagem", e.getMessage()
                    ),
                    HttpStatus.UNAUTHORIZED
            );
        }
    }
}
