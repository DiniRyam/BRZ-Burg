package com.brzburg.brzburg_api.service;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService() {
        // Define o caminho absoluto baseado na pasta onde o projeto está rodando
        // Isso resolve problemas com OneDrive, Área de Trabalho e caminhos relativos
        this.fileStorageLocation = Paths.get(System.getProperty("user.dir") + "/uploads")
                .toAbsolutePath().normalize();

        try {
            // Cria a pasta uploads se ela não existir
            Files.createDirectories(this.fileStorageLocation);
            System.out.println("--- PASTA DE UPLOAD CONFIGURADA: " + this.fileStorageLocation + " ---");
        } catch (Exception ex) {
            throw new RuntimeException("Não foi possível criar o diretório de uploads.", ex);
        }
    }

    public String salvarImagem(MultipartFile file) {
        // Normaliza o nome do arquivo
        String originalName = StringUtils.cleanPath(file.getOriginalFilename());
        
        try {
            // Verifica se o nome do arquivo contém caracteres inválidos
            if(originalName.contains("..")) {
                throw new RuntimeException("Nome de arquivo inválido: " + originalName);
            }

            // Gera um nome único para evitar sobrescrita (ex: uuid-foto.png)
            String fileName = UUID.randomUUID().toString() + "_" + originalName;

            // Define o caminho de destino
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            
            // Copia o arquivo para o destino (substituindo se existir)
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            System.out.println("Arquivo salvo com sucesso: " + targetLocation.toString());

            // Retorna o caminho relativo para salvar no banco ("/uploads/nome.png")
            return "/uploads/" + fileName;

        } catch (IOException ex) {
            throw new RuntimeException("Não foi possível armazenar o arquivo " + originalName, ex);
        }
    }
}