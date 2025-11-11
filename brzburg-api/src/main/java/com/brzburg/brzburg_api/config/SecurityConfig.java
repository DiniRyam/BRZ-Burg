
package com.brzburg.brzburg_api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

// o configuration diz pro spring que aqui é uma classe de configuração, e ativa o segurança web do spring
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // aqui é o bean que vai servir pra criptografar as senhas e vai ser injetado no funcionarioservice com o autowired
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // aqui e definido as regras de acesso 
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            //desativa a proteção csrf do spring por que a api é restful stateless
            .csrf(csrf -> csrf.disable())
            
            // a secao é stateless por que usara tokens para autenticacao
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // define as regras de autorização pra dizer quem acessa o que
            .authorizeHttpRequests(authorize -> authorize
                
                //da acesso publico para essas rotas
                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                // todas as apis de clientes que nao precisam de login 
                .requestMatchers("/api/cliente/**").permitAll()

                // e exige autenticacao em todas as outras rotas
                .anyRequest().authenticated()
            );

        return http.build();
    }
}