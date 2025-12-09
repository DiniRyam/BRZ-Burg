package com.brzburg.brzburg_api.controller;

import com.brzburg.brzburg_api.model.Comanda;
import com.brzburg.brzburg_api.model.ItemPedido;
import com.brzburg.brzburg_api.service.GarcomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/garcom") // URL base para todas as APIs do Garçom
public class GarcomController {

    @Autowired
    private GarcomService garcomService;

    /**
     * Implementa: GET /api/garcom/dashboard
     * Polling (10s). Retorna status das mesas e alertas (Pediu Conta, Pedido Pronto).
     */
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        Map<String, Object> dashboard = garcomService.getDashboard();
        return ResponseEntity.ok(dashboard);
    }

    /**
     * Implementa: GET /api/garcom/comanda/{mesaId}
     * Busca os detalhes da comanda para o garçom ver (itens, status, total).
     */
    @GetMapping("/comanda/{mesaId}")
    public ResponseEntity<?> getComanda(@PathVariable Integer mesaId) {
        try {
            Comanda comanda = garcomService.getComandaPorMesa(mesaId);
            return ResponseEntity.ok(comanda);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    /**
     * Implementa: POST /api/garcom/pedido/devolver
     * Marca um item como DEVOLVIDO (ex: cliente desistiu ou erro).
     */
    @PostMapping("/pedido/devolver")
    public ResponseEntity<?> devolverItem(@RequestBody Map<String, Integer> request) {
        try {
            Integer itemPedidoId = request.get("itemPedidoId");
            // (Nota: quantidadeDevolver não está implementado na V1 simples, devolvemos o item inteiro)
            ItemPedido item = garcomService.devolverItem(itemPedidoId);
            return ResponseEntity.ok(item);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Falha ao devolver item", "mensagem", e.getMessage()));
        }
    }

    /**
     * Implementa: POST /api/garcom/comanda/fechar
     * Fecha a conta, registra o pagamento e libera a mesa.
     */
    @PostMapping("/comanda/fechar")
    public ResponseEntity<?> fecharConta(@RequestBody Map<String, Object> request) {
        try {
            
            // Usar String.valueOf e depois parseInt para ser seguro contra tipos (Integer, Long, String)
            Integer mesaId = Integer.parseInt(String.valueOf(request.get("mesaId")));
            String metodoPagamento = (String) request.get("metodoPagamento");

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String loginFuncionario = auth.getName();

            garcomService.fecharConta(mesaId, metodoPagamento, loginFuncionario);

            return ResponseEntity.ok(Map.of("status", "sucesso", "mensagem", "Mesa " + mesaId + " fechada."));

        } catch (Exception e) {
            // Adicionei o e.printStackTrace() para ver o erro real no terminal do Java se acontecer de novo
            e.printStackTrace(); 
            return ResponseEntity.badRequest().body(Map.of("erro", "Falha ao fechar conta", "mensagem", e.getMessage()));
        }
    }
}