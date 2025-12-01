package com.brzburg.brzburg_api.service;

import com.brzburg.brzburg_api.model.CardapioItem;
import com.brzburg.brzburg_api.model.Comanda;
import com.brzburg.brzburg_api.model.ItemPedido;
import com.brzburg.brzburg_api.model.Mesa;
import com.brzburg.brzburg_api.repository.CardapioItemRepository;
import com.brzburg.brzburg_api.repository.ComandaRepository;
import com.brzburg.brzburg_api.repository.ItemPedidoRepository;
import com.brzburg.brzburg_api.repository.MesaRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ClienteService {

    @Autowired
    private CardapioItemRepository itemRepository;

    @Autowired
    private ComandaRepository comandaRepository;

    @Autowired
    private ItemPedidoRepository itemPedidoRepository;

    @Autowired
    private MesaRepository mesaRepository;

    //   INICIAR SESSÃO DO CLIENTE
    public Map<String, Object> iniciarSessao(Integer mesaId) {

        // NOVO MÉTODO: buscar cardápio usando a query manual
        List<CardapioItem> cardapio = itemRepository.buscarParaCliente();

        // Busca comanda ativa
        Optional<Comanda> comandaAtiva = comandaRepository.findByMesaIdAndStatus(mesaId, "ATIVA");

        // Busca nome real da mesa
        String nomeMesa = mesaRepository.findById(mesaId)
                .map(Mesa::getNome)
                .orElse("Mesa Desconhecida");

        Map<String, Object> resposta = new HashMap<>();
        resposta.put("nomeRestaurante", "BRZ Burg");
        resposta.put("mesaNome", nomeMesa);
        resposta.put("cardapio", cardapio);
        resposta.put("comanda", comandaAtiva.orElse(null));

        return resposta;
    }

    //   FAZER PEDIDO
    @Transactional
    public Comanda fazerPedido(Integer mesaId, Integer itemId, int quantidade, String observacao) throws Exception {

        CardapioItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new Exception("Item de cardápio não encontrado."));

        Mesa mesa = mesaRepository.findById(mesaId)
                .orElseThrow(() -> new Exception("Mesa não encontrada."));

        // Busca ou cria comanda ativa
        Comanda comanda = comandaRepository.findByMesaIdAndStatus(mesaId, "ATIVA")
                .orElseGet(() -> {
                    Comanda novaComanda = new Comanda();
                    novaComanda.setMesa(mesa);
                    novaComanda.setStatus("ATIVA");
                    return comandaRepository.save(novaComanda);
                });

        // Se a mesa estiver livre, muda para ocupada
        if ("LIVRE".equals(mesa.getStatus())) {
            mesa.setStatus("OCUPADA");
            mesaRepository.save(mesa);
        }

        // Criar item do pedido
        ItemPedido novoItemPedido = new ItemPedido();
        novoItemPedido.setComanda(comanda);
        novoItemPedido.setItem(item);
        novoItemPedido.setQuantidade(quantidade);
        novoItemPedido.setObservacao(observacao);
        novoItemPedido.setStatus("PENDENTE");
        novoItemPedido.setTimestampPedido(LocalDateTime.now());
        novoItemPedido.setPrecoNoMomento(item.getPreco());

        itemPedidoRepository.save(novoItemPedido);

        return comanda;
    }

    //   CANCELAR PEDIDO
    public ItemPedido cancelarPedido(Integer itemPedidoId) throws Exception {
        ItemPedido item = itemPedidoRepository.findById(itemPedidoId)
                .orElseThrow(() -> new Exception("Item do pedido não encontrado."));

        long segundosDesdePedido = ChronoUnit.SECONDS.between(
                item.getTimestampPedido(), LocalDateTime.now()
        );

        if (segundosDesdePedido <= 60 || "PENDENTE".equals(item.getStatus())) {
            item.setStatus("CANCELADO");
            return itemPedidoRepository.save(item);
        } else {
            throw new Exception("Não é possível cancelar. O seu pedido já está sendo preparado.");
        }
    }

    //   PEDIR CONTA
    public void pedirConta(Integer mesaId) throws Exception {
        Comanda comanda = comandaRepository.findByMesaIdAndStatus(mesaId, "ATIVA")
                .orElseThrow(() -> new Exception("Nenhuma comanda ativa encontrada para esta mesa."));

        comanda.setStatusSolicitacao("PEDIU_CONTA");
        comandaRepository.save(comanda);
    }
}
