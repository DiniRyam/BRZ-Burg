package com.brzburg.brzburg_api.config;

import com.brzburg.brzburg_api.repository.FuncionarioRepository;
import com.brzburg.brzburg_api.service.TokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component // Diz ao Spring para gerir este filtro como um componente
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    // O servico de leitura de tokens
    @Autowired
    private TokenService tokenService; 

    // Aqui é para buscar o utilizador vugo funcionario
    @Autowired
    private FuncionarioRepository funcionarioRepository; 

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Puxa o token do cabecalho
        String token = extrairToken(request);

        if (token != null && tokenService.isTokenValido(token)) {

            // Se o token for válido, então extrai o login
            String usuario = tokenService.getLoginDoToken(token);

            // Procura quem está logando no banco de dados do repository de funcionario
            UserDetails user = funcionarioRepository.findByUsuario(usuario).orElse(null);

            if (user != null) {

                // Se a pessoa que fizer login existir, então será autenticada e entrará no sistema
                var authentication = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        // Continua com os filtros
        filterChain.doFilter(request, response);
    }

    // Método auxiliar para extrair o token que vem no cabecalho authorization
    private String extrairToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        // Remove o bearer
        return authHeader.substring(7); 
    }
}