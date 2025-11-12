package com.brzburg.brzburg_api.service;

import com.brzburg.brzburg_api.model.ItemPedido;
import com.brzburg.brzburg_api.repository.ItemPedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class KdsService {

    @Autowired
    private ItemPedidoRepository itemPedidoRepository;

    //implementa o get /api/kds/dashboard que busca todos os itens nas colunas pendentes e em preparo e tambem os finalizados
    public Map<String, List<ItemPedido>> getDashboard() {
        
        // busca os itens em producao com o metodo especial de itemrepository
        List<String> statusProducao = Arrays.asList("PENDENTE", "EM_PREPARO");
        List<ItemPedido> producao = itemPedidoRepository.findByStatusIn(statusProducao);

        // busca tambem os finalizados com o memso metodo especial
        List<String> statusFinalizado = Arrays.asList("CONCLUIDO", "CANCELADO", "DEVOLVIDO");
        List<ItemPedido> finalizados = itemPedidoRepository.findByStatusIn(statusFinalizado);

        // separa os itens em pendete e empreparo
        List<ItemPedido> pendentes = producao.stream()
                .filter(p -> "PENDENTE".equals(p.getStatus()))
                .collect(Collectors.toList());

        List<ItemPedido> emPreparo = producao.stream()
                .filter(p -> "EM_PREPARO".equals(p.getStatus()))
                .collect(Collectors.toList());

        //retorna o map do kds para a api
        return Map.of(
            "pendentes", pendentes,
            "emPreparo", emPreparo,
            "finalizados", finalizados
        );
    }

    // implementa o post /api/kds/pedido/atualizar-status
    public ItemPedido atualizarStatusPedido(Integer itemPedidoId) throws Exception {
        
        ItemPedido item = itemPedidoRepository.findById(itemPedidoId)
                .orElseThrow(() -> new Exception("Item do pedido não encontrado."));

        // muda o status para passar para a proxima linha do quadro de produçao
        switch (item.getStatus()) {
            case "PENDENTE":
                item.setStatus("EM_PREPARO");
                break;
            case "EM_PREPARO":
                item.setStatus("CONCLUIDO");

                // quando atualizado e depois do polling o garcom recebe a notificacao que o pedido esta pronto finalmente
                break;
            case "CONCLUIDO":
            case "CANCELADO":
            case "DEVOLVIDO":
            
                // Se o item já está finalizado so exibe a mensagem e nao atualiza mais status
                throw new Exception("Este item já foi finalizado ou cancelado.");
        }

        return itemPedidoRepository.save(item);
    }
}