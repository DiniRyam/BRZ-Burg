package com.brzburg.brzburg_api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Pega o caminho absoluto da pasta onde o projeto está rodando
        String caminhoProjeto = System.getProperty("user.dir");
        
        // Constrói o caminho para a pasta uploads
        String caminhoUploads = "file:" + caminhoProjeto + "/uploads/";

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(caminhoUploads);
    }
}