package com.brzburg.brzburg_api.config;

import com.brzburg.brzburg_api.model.Funcionario;
import com.brzburg.brzburg_api.repository.FuncionarioRepository;
import com.brzburg.brzburg_api.service.TokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final TokenService tokenService;
    private final FuncionarioRepository funcionarioRepository;

    // Construtor manual necessário para o SecurityConfig
    public JwtAuthenticationFilter(TokenService tokenService, FuncionarioRepository funcionarioRepository) {
        this.tokenService = tokenService;
        this.funcionarioRepository = funcionarioRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String token = recuperarToken(request);
        
        // CORREÇÃO: Usamos os métodos exatos do seu TokenService atual
        if (token != null && tokenService.isTokenValido(token)) {
            
            String login = tokenService.getLoginDoToken(token);
            
            if (login != null) {
                // Busca o funcionário pelo usuário (login)
                Optional<Funcionario> usuario = funcionarioRepository.findByUsuario(login);
                
                if (usuario.isPresent()) {
                    Funcionario user = usuario.get();
                    UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                    
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        }
        
        filterChain.doFilter(request, response);
    }

    private String recuperarToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        return authHeader.replace("Bearer ", "");
    }
}