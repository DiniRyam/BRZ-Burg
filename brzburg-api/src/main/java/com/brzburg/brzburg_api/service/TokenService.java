package com.brzburg.brzburg_api.service;

import com.brzburg.brzburg_api.model.Funcionario;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class TokenService {

    // definindo uma chave secreta para assinar os tokens no application.properties
    @Value("${app.jwt.secret}")
    private String jwtSecret;

    // defininfo expiracao do token
    private static final long EXPIRATION_TIME = 86400000;

    //gera um token novo para um funcionario autenticado
    public String gerarToken(Funcionario funcionario) {

        //converte a chave secreta num objeto secretkey
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));

        // aqui vem as informacoes que vai no token vugo claims, sem id e cpf 
        Map<String, Object> claims = new HashMap<>();
        claims.put("nome", funcionario.getNome());
        claims.put("funcao", funcionario.getFuncao());

        return Jwts.builder()
                //o dono do token aqui
                .setSubject(funcionario.getLogin()) 

                //quem fez o token
                .setIssuer("BRZ-Burg-API")

                // a data que foi feito
                .setIssuedAt(new Date(System.currentTimeMillis()))

                // a data que se vence
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))

                // as infos vugo claims 
                .addClaims(claims)

                // assina o token com a chave super secreta massa demais
                .signWith(key, SignatureAlgorithm.HS256)

                // constroi o token
                .compact();
    }
}