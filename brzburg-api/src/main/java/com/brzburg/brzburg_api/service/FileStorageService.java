package com.brzburg.brzburg_api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID; // Para gerar nomes de arquivos unicos

@Service
public class FileStorageService {

    //definindo o caminho da pasta pra upar as coisas no aplication.properties
    @Value("${app.upload.dir:${user.home}/brzburg-uploads}")
    private String uploadDir;

    //olha se a pasta de upload existe
    public String salvarImagem(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        //muda o nome do arquivo para um nome unico com o uuid
        String extensao = file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf("."));
        String nomeFicheiroUnico = UUID.randomUUID().toString() + extensao;

        // define o caminho completo do destino 
        Path caminhoDestino = uploadPath.resolve(nomeFicheiroUnico);

        // copia o arquivo da requisição para o caminho do destino
        Files.copy(file.getInputStream(), caminhoDestino);

        // retorna a url que vai ser salva no banco
        return "/uploads/" + nomeFicheiroUnico;
    }
}