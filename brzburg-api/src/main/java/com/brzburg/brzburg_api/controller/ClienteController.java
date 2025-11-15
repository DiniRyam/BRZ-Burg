package com.brzburg.brzburg_api.controller;

import com.brzburg.brzburg_api.model.Comanda;
import com.brzburg.brzburg_api.model.ItemPedido;
import com.brzburg.brzburg_api.service.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController

// URL base para todas as APIs de Cliente
@RequestMapping("/api/cliente") 
public class ClienteController {

    @Autowired
    private ClienteService clienteService;

    // Implementa o get /api/cliente/iniciar-sessao que busca o cardapio e a comanda ativa da mesa e o requestparam pega o id da mesa da url
    @GetMapping("/iniciar-sessao")
    public ResponseEntity<Map<String, Object>> iniciarSessao(@RequestParam Integer mesaId) {
        Map<String, Object> resposta = clienteService.iniciarSessao(mesaId);
        return ResponseEntity.ok(resposta);
    }

    // Implementa o get da api/clente/comanda que busca a comanda ativa mas com o polling de 10 segundos do front que eu n to vissando de usar websocket 
    @GetMapping("/comanda")
    public ResponseEntity<Comanda> getComandaAtiva(@RequestParam Integer mesaId) {

        // Reusa o codigo aqui mas agora é so pra buscar a comanda
        Comanda comandaAtiva = (Comanda) clienteService.iniciarSessao(mesaId).get("comanda");
        return ResponseEntity.ok(comandaAtiva);
    }

    // Implementa post /api/cliente/pedido que recebe um json para adicionar um novo item no pedido
    @PostMapping("/pedido")
    public ResponseEntity<?> fazerPedido(@RequestBody PedidoRequest pedidoRequest) {

        // Uma classe record para o json da requisisao
        try {
            Comanda comandaAtualizada = clienteService.fazerPedido(
                    pedidoRequest.mesaId,
                    pedidoRequest.itemId,
                    pedidoRequest.quantidade,
                    pedidoRequest.observacao
            );

            // Retorna a comanda atualizada igual na api
            return new ResponseEntity<>(comandaAtualizada, HttpStatus.CREATED);
        } catch (Exception e) {
            // Retorna erro 400 (bad request) se o item ou mesa não existirem
            return new ResponseEntity<>(
                Map.of("erro", "Falha ao fazer pedido", "mensagem", e.getMessage()), 
                HttpStatus.BAD_REQUEST 
            );
        }
    }

    // Implementa post /api/cliente/pedido/cancelar 
    @PostMapping("/pedido/cancelar")
    public ResponseEntity<?> cancelarPedido(@RequestBody CancelarPedidoRequest request) {
        try {
            ItemPedido itemCancelado = clienteService.cancelarPedido(request.itemPedidoId);
            return ResponseEntity.ok(itemCancelado);
        } catch (Exception e) {

            // Se a regra do service nao puder cancelar o peidod ai retorna um erro como na api
            return new ResponseEntity<>(
                Map.of("erro", "Cancelamento não permitido", "mensagem", e.getMessage()), 

                // Retorna erro 403 (Proibido)
                HttpStatus.FORBIDDEN
            );
        }
    }

    // Implementa o post /api/cliente/pedir-conta quando o cliente clicar em pedir conta que diz que os garcons foram alertados
    @PostMapping("/pedir-conta")
    public ResponseEntity<?> pedirConta(@RequestBody PedirContaRequest request) {
        try {
            clienteService.pedirConta(request.mesaId);
            return ResponseEntity.ok(Map.of("status", "Alerta enviado"));
        } catch (Exception e) {
            // Retorna erro 404 se a comanda ativa não for encontrada
            return new ResponseEntity<>(
                Map.of("erro", "Falha ao pedir conta", "mensagem", e.getMessage()), 
                HttpStatus.NOT_FOUND 
            );
        }
    }

    // Aqui essas classes pra dar aquela forca na hora de mapear o json das rewuisicoes post
    private record PedidoRequest(Integer mesaId, Integer itemId, int quantidade, String observacao) {}
    private record CancelarPedidoRequest(Integer itemPedidoId) {}
    private record PedirContaRequest(Integer mesaId) {}
}