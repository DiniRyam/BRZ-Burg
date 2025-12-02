package com.brzburg.brzburg_api.service;

import com.brzburg.brzburg_api.model.ItemPedido;
import com.brzburg.brzburg_api.repository.ItemPedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class KdsService {

    @Autowired
    private ItemPedidoRepository itemPedidoRepository;

    /**
     * Método auxiliar que converte o Objeto do Banco para um JSON Customizado.
     * Aqui nós extraímos manualmente o nome da mesa para garantir que ele vai.
     */
    private Map<String, Object> converterParaDTO(ItemPedido item) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", item.getId());
        dto.put("quantidade", item.getQuantidade());
        dto.put("status", item.getStatus());
        dto.put("observacao", item.getObservacao());
        // Pega o nome do item
        dto.put("itemNome", item.getItem().getNome());
        // PEGA O NOME DA MESA EXPLÍCITO
        dto.put("mesaNome", item.getComanda().getMesa().getNome());
        
        return dto;
    }

    public Map<String, List<Map<String, Object>>> getDashboard() {
        
        List<String> statusProducao = Arrays.asList("PENDENTE", "EM_PREPARO");
        List<ItemPedido> producao = itemPedidoRepository.findByStatusIn(statusProducao);

        List<String> statusFinalizado = Arrays.asList("CONCLUIDO", "CANCELADO", "DEVOLVIDO");
        List<ItemPedido> finalizados = itemPedidoRepository.findByStatusIn(statusFinalizado);

        // Converte e Filtra
        List<Map<String, Object>> pendentes = producao.stream()
                .filter(p -> "PENDENTE".equals(p.getStatus()))
                .map(this::converterParaDTO) // Converte para o nosso formato seguro
                .collect(Collectors.toList());

        List<Map<String, Object>> emPreparo = producao.stream()
                .filter(p -> "EM_PREPARO".equals(p.getStatus()))
                .map(this::converterParaDTO)
                .collect(Collectors.toList());

        List<Map<String, Object>> listaFinalizados = finalizados.stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());

        return Map.of(
            "pendentes", pendentes,
            "emPreparo", emPreparo,
            "finalizados", listaFinalizados
        );
    }

    public ItemPedido atualizarStatusPedido(Integer itemPedidoId) throws Exception {
        ItemPedido item = itemPedidoRepository.findById(itemPedidoId)
                .orElseThrow(() -> new Exception("Item do pedido não encontrado."));

        switch (item.getStatus()) {
            case "PENDENTE": item.setStatus("EM_PREPARO"); break;
            case "EM_PREPARO": item.setStatus("CONCLUIDO"); break;
            case "CONCLUIDO": throw new Exception("Item já finalizado.");
        }

        return itemPedidoRepository.save(item);
    }
}