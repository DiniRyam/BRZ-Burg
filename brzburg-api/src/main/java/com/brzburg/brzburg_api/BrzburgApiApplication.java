package com.brzburg.brzburg_api;

import com.brzburg.brzburg_api.model.Funcionario;
import com.brzburg.brzburg_api.repository.FuncionarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class BrzburgApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(BrzburgApiApplication.class, args);
	}

    // Este método roda sempre que o servidor inicia
    @Bean
    public CommandLineRunner initAdmin(FuncionarioRepository repository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Verifica se o admin já existe
            if (repository.findByUsuario("admin").isEmpty()) {
                System.out.println("Criando usuário ADMIN padrão...");
                Funcionario admin = new Funcionario();
                admin.setNome("Admin Principal");
                admin.setCpf("00000000000");
                admin.setUsuario("admin");
                admin.setFuncao("ADMIN");
                admin.setActive(true);
                
                // O Java gera o hash correto aqui
                admin.setSenhaHash(passwordEncoder.encode("123456"));
                
                repository.save(admin);
                System.out.println("Usuário ADMIN criado com sucesso! (Senha: 123456)");
            }
        };
    }
}