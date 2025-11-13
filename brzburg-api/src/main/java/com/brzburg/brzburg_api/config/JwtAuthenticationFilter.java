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

    @Autowired
    private TokenService tokenService; // O nosso serviço que sabe ler tokens

    @Autowired
    private FuncionarioRepository funcionarioRepository; // Para buscar o utilizador

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Extrair o token do cabeçalho
        String token = extrairToken(request);

        if (token != null && tokenService.isTokenValido(token)) {
            // 2. Se o token for válido, extrair o login
            String login = tokenService.getLoginDoToken(token);
            
            // 3. Buscar o utilizador no banco de dados
            // (O FuncionarioRepository já implementa UserDetails implicitamente se Funcionario implementar UserDetails)
            // Vamos assumir que o Funcionario implementa UserDetails (precisamos de o adicionar)
            UserDetails user = funcionarioRepository.findByLogin(login).orElse(null);

            if (user != null) {
                // 4. Se o utilizador existir, autenticá-lo para esta requisição
                // (Isto "diz" ao Spring Security que o utilizador está logado)
                var authentication = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        // 5. Continua a cadeia de filtros (permite que o pedido prossiga)
        filterChain.doFilter(request, response);
    }

    /**
     * Método auxiliar para extrair o token do cabeçalho "Authorization".
     * Ex: "Bearer eyJhbGciOiJIUzI1Ni..."
     */
    private String extrairToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        return authHeader.substring(7); // Remove o "Bearer "
    }
}