package com.brzburg.brzburg_api.controller;

import com.brzburg.brzburg_api.model.ItemPedido;
import com.brzburg.brzburg_api.service.KdsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController

// URL base para todas as APIs da Cozinha
@RequestMapping("/api/kds") 
public class KdsController {

    // Inejat o objeto do kdsservice que ficou armazenado pelo springboot
    @Autowired
    private KdsService kdsService;

    // Implementa o get /api/kds/dashboasrd é o que a cada 5 segundos do polling atualiza as telas do kds e do admin
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, List<ItemPedido>>> getDashboard() {
        Map<String, List<ItemPedido>> dashboard = kdsService.getDashboard();
        return ResponseEntity.ok(dashboard);
    }

    // Implementa o post /pedido/atualizar-status que age quando o cozinheiro move o item para a proxima coluna da sequencia de preparo
    @PostMapping("/pedido/atualizar-status")
    public ResponseEntity<?> atualizarStatusPedido(@RequestBody Map<String, Integer> request) {

        // Recebe um json simples com o id do pedido tipo itemPedidoId: 01
        try {
            Integer itemPedidoId = request.get("itemPedidoId");
            ItemPedido itemAtualizado = kdsService.atualizarStatusPedido(itemPedidoId);
            return ResponseEntity.ok(itemAtualizado);

        } catch (Exception e) {

            // Retorna um erro se o admin que é read-only na tela do kds tentar usar o mátodo para atualizar o status de um pedido ou se o item nao for encontrado da um bad request
            return new ResponseEntity<>(
                Map.of("erro", "Falha ao atualizar status", "mensagem", e.getMessage()), 
                HttpStatus.BAD_REQUEST
            );
        }
    }
}