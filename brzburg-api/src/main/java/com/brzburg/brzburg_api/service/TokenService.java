package com.brzburg.brzburg_api.service;

import com.brzburg.brzburg_api.model.Funcionario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
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

    // Chave secreta definida no application.properties
    @Value("${app.jwt.secret}")
    private String jwtSecret;

    // Expiração de 24 horas (em milissegundos)
    private static final long EXPIRATION_TIME = 86_400_000L;

    // Objeto SecretKey (gerado a partir da string jwtSecret)
    private SecretKey key;

    // O método @PostConstruct roda uma vez quando o serviço é criado
    @PostConstruct
    public void initKey() {
        if (jwtSecret == null || jwtSecret.length() < 32) {
            throw new IllegalStateException("A chave JWT (app.jwt.secret) deve ter pelo menos 32 caracteres para HS256."
            );
        }

        // Converte a string secreta em uma chave criptográfica segura
        this.key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    // Gera um novo token JWT para o funcionário autenticado
    public String gerarToken(Funcionario funcionario) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("nome", funcionario.getNome());
        claims.put("funcao", funcionario.getFuncao());

        return Jwts.builder()

                // Identificação do dono do token
                .setSubject(funcionario.getLogin())
                
                // Quem gerou o token            
                .setIssuer("BRZ-Burg-API")

                // Data de criação                    
                .setIssuedAt(new Date())
                
                // Expiração                      
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME)) 
                
                // Informações extras (nome, função)
                .addClaims(claims)       
                
                // Algoritmo + chave                     
                .signWith(this.key) 
                
                // Gera o token final
                .compact();                                   
    }

    // Extrai os "claims" (informações) de dentro do token JWT
    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(this.key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // olha se o token é valido e nao expirou e assinatura correta
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

    // extrai o login vugo subject do token
    public String getLoginDoToken(String token) {
        return getClaims(token).getSubject();
    }
}
