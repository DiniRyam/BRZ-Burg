package com.brzburg.brzburg_api.service;

import com.brzburg.brzburg_api.model.Funcionario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class TokenService {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    private static final long EXPIRATION_TIME = 86_400_000L; // 24h
    private SecretKey key;

    @PostConstruct
    public void initKey() {
        if (jwtSecret == null || jwtSecret.length() < 32) {
            throw new IllegalStateException("A chave JWT (app.jwt.secret) deve ter pelo menos 32 caracteres.");
        }
        this.key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String gerarToken(Funcionario funcionario) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("nome", funcionario.getNome());
        claims.put("funcao", funcionario.getFuncao());

        return Jwts.builder()
                .subject(funcionario.getLogin())
                .issuer("BRZ-Burg-API")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .claims(claims)
                .signWith(key) // jjwt 0.12.x aceita signWith(SecretKey)
                .compact();
    }

    // Versão compatível com JJWT 0.12.x
    private Claims getClaims(String token) {
        // parseSignedClaims(token) retorna um objeto que possui getPayload() -> Claims
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isTokenValido(String token) {
        try {
            getClaims(token);
            return true;
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            System.out.println("Token expirado: " + e.getMessage());
            return false;
        } catch (io.jsonwebtoken.JwtException e) {
            System.out.println("Token inválido: " + e.getMessage());
            return false;
        } catch (Exception e) {
            System.out.println("Erro ao validar token: " + e.getMessage());
            return false;
        }
    }

    public String getLoginDoToken(String token) {
        return getClaims(token).getSubject();
    }
}
