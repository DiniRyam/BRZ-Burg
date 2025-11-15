package com.brzburg.brzburg_api.controller;

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

    // Usa o objeto vulgo bean da lógica de login
    @Autowired
    private AuthService authService;

    /* Recebe o login e senha e tenta autenticar o usuario aqui usando um map para
    receber o json igual ta na api */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {

        try {
            String login = loginRequest.get("login");
            String senha = loginRequest.get("senha");

            // Chama o authservice que usa o passwoerdencoder e o tokenservice
            String token = authService.login(login, senha);

            // Se der bom retorna o token e o spring converte para um json
            return ResponseEntity.ok(Map.of("token", token));

        } catch (Exception e) {

            // Se der ruim então retorna o erro 401 e já era, porta na cara
            return new ResponseEntity<>(
                    Map.of("erro", "Não autorizado", "mensagem", e.getMessage()),
                    HttpStatus.UNAUTHORIZED);
        }
    }
}