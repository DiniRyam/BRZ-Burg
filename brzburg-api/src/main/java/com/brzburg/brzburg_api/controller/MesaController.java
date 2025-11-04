package com.brzburg.brzburg_api.controller;

import com.brzburg.brzburg_api.model.Mesa;
import com.brzburg.brzburg_api.service.MesaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

//na pri eira dis pro spring que a classe é um controller para a api, no segundo ele define o url base
@RestController 
@RequestMapping("/api/admin/mesas")
public class MesaController {

    //o spring chama o service aqui
    @Autowired 
    private MesaService mesaService;

    //aqui implementa o get /api/admin/mesas, e retorna a lista completa das mesas em json
    @GetMapping
    public List<Mesa> getMesas() {
        return mesaService.getTodasAsMesas();
    }

    //aqui implementa o post /api/admin/mesas, o requestbody pega o json do front pro objeto mesa, e retorna 201 created
    @PostMapping
    public ResponseEntity<Mesa> criarMesa(@RequestBody Mesa novaMesa) {
        Mesa mesaSalva = mesaService.criarMesa(novaMesa);
        return new ResponseEntity<>(mesaSalva, HttpStatus.CREATED); 
    }

    //aqui é o delet /api/admin/mesas/{id} que retorna 204 no content que mostra que esta deletada, e retorna a excessao com erro 409 da regra da mesa ocupada
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletarMesa(@PathVariable Integer id) {
        try {
            mesaService.deletarMesa(id);
            return ResponseEntity.noContent().build(); 
        } catch (Exception e) {
            return new ResponseEntity<>(
                Map.of("erro", "Mesa em uso", "mensagem", e.getMessage()), 
                HttpStatus.CONFLICT
            );
        }
    }
}