package com.brzburg.brzburg_api.controller;

import com.brzburg.brzburg_api.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

// aqui pega a url para autenticacao
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    // usa o objeto vulgo bean da logica de login
    @Autowired
    private AuthService authService;

    // recebe o login e senha e tenta autenticar o usuario aqui usando um map para
    // receber o json igual ta na api
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {

        try {
            String login = loginRequest.get("login");
            String senha = loginRequest.get("senha");

            // chama o authservice que usa o passwoerdencoder e o tokenservice
            String token = authService.login(login, senha);

            // se der bom retorna o token e o spring converte para um json
            return ResponseEntity.ok(Map.of("token", token));

        } catch (Exception e) {

            // se der ruim entao tem o erro 401 e ja era, porta na cara
            return new ResponseEntity<>(
                    Map.of("erro", "Não autorizado", "mensagem", e.getMessage()),
                    HttpStatus.UNAUTHORIZED);
        }
    }
}