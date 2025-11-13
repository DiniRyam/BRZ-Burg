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

    //o servico de leitura de tokens
    @Autowired
    private TokenService tokenService; 

    // aqui é para buscar o utilizador vugo funcionario
    @Autowired
    private FuncionarioRepository funcionarioRepository; 

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        //puxa o token do cabecalho
        String token = extrairToken(request);

        if (token != null && tokenService.isTokenValido(token)) {

            // se o token for valido ele extrai o login
            String login = tokenService.getLoginDoToken(token);
            
            //procura quem esta logando no banco de dados la do repository de funcionario
            UserDetails user = funcionarioRepository.findByLogin(login).orElse(null);

            if (user != null) {

                // se quem esta tentenaod afzer login existir ai autentica ele e fica logado
                var authentication = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        // continua com os filtros
        filterChain.doFilter(request, response);
    }

    // um metodo auxiliar para extrair o token que vem no cabecalho authorization
    private String extrairToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        // remove o bearer
        return authHeader.substring(7); 
    }
}