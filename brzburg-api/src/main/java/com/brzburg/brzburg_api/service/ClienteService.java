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

    // implementa o get da /api/cliente/iniciar-sessao que busca no cardapio os itens ativos e disponiveis e uma comanda ativa se tiver uma
    public Map<String, Object> iniciarSessao(Integer mesaId) {

        // buaca o cardapio usando o metodo especial do cardapioitemrepository
        List<CardapioItem> cardapio = itemRepository.findByIsActiveTrueAndIsDisponivelTrue();

        //procura uma comanda ativa com o metodo especial do comandarepository
        Optional<Comanda> comandaAtiva = comandaRepository.findByMesaIdAndStatus(mesaId, "ATIVA");

        // monta um objeto para dar a resposta igual fala na api
        Map<String, Object> resposta = new HashMap<>();
        resposta.put("nomeRestaurante", "BRZ Burg");
        resposta.put("cardapio", cardapio);

        // retorna a comanda ou null
        resposta.put("comanda", comandaAtiva.orElse(null)); 

        return resposta;
    }

    // implementa o post /api/cliente/pedido que cria um novo item de pddido e associa a uma comanda, o transacional garante que se der erra nenhuma alteracoa é salva, sem pedido se n tiver mesa
    @Transactional
    public Comanda fazerPedido(Integer mesaId, Integer itemId, int quantidade, String observacao) throws Exception {

        // valida item do cardapio
        CardapioItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new Exception("Item de cardápio não encontrado."));
        
        // valida mesa
        Mesa mesa = mesaRepository.findById(mesaId)
                .orElseThrow(() -> new Exception("Mesa não encontrada."));

        // ve se tem comanda ativa e se nao tiver cria uma
        Comanda comanda = comandaRepository.findByMesaIdAndStatus(mesaId, "ATIVA")
                .orElseGet(() -> {
                    Comanda novaComanda = new Comanda();
                    novaComanda.setMesa(mesa);
                    novaComanda.setStatus("ATIVA");
                    return comandaRepository.save(novaComanda);
                });

        // muda o status da mesa se estiver ocupada
        if ("LIVRE".equals(mesa.getStatus())) {
            mesa.setStatus("OCUPADA");
            mesaRepository.save(mesa);
        }

        // cria um item de pedido novo
        ItemPedido novoItemPedido = new ItemPedido();
        novoItemPedido.setComanda(comanda);
        novoItemPedido.setItem(item);
        novoItemPedido.setQuantidade(quantidade);
        novoItemPedido.setObservacao(observacao);

        //status que o itempedido chega para o kds
        novoItemPedido.setStatus("PENDENTE"); 

        // aplica a regra dos 60 segundos para cancelar o pedido
        novoItemPedido.setTimestampPedido(LocalDateTime.now()); 
        
        // trava o preco
        novoItemPedido.setPrecoNoMomento(item.getPreco()); 
        itemPedidoRepository.save(novoItemPedido);

        // retorna a comanda atualizada, tenho que ver se precisa atualizar para ver se adicionou
        return comanda;
    }

    /**
     * Implementa: POST /api/cliente/pedido/cancelar
     * Aplica a Regra Híbrida de Cancelamento.
     */

    //implementa o post /api/pedido/cancelar e aplica a regra hibrida de cancelamento os 60 segundos mas 5 do polling e se esta pendente
    public ItemPedido cancelarPedido(Integer itemPedidoId) throws Exception {
        ItemPedido item = itemPedidoRepository.findById(itemPedidoId)
                .orElseThrow(() -> new Exception("Item do pedido não encontrado."));

        // calcula o tempo do pedido
        LocalDateTime agora = LocalDateTime.now();
        long segundosDesdePedido = ChronoUnit.SECONDS.between(item.getTimestampPedido(), agora);

        // ve se faz menos de 60 segundos e se estiver na coluna pendente
        if (segundosDesdePedido <= 60 || "PENDENTE".equals(item.getStatus())) {
            item.setStatus("CANCELADO");
            return itemPedidoRepository.save(item);
        } else {
            
            // se fizer mais de 60 segundos exibe essa mensagem massa de erro
            throw new Exception("Não é possível cancelar. O seu pedido já está a ser preparado.");
        }
    }

    // implementa aqui o post /api/cliente/pedir-conta que marca a comanda na tela do garcom pra ele ver 
    public void pedirConta(Integer mesaId) throws Exception {
        Comanda comanda = comandaRepository.findByMesaIdAndStatus(mesaId, "ATIVA")
                .orElseThrow(() -> new Exception("Nenhuma comanda ativa encontrada para esta mesa."));

        // define o status para pediconta salva e notifica
        comanda.setStatusSolicitacao("PEDIU_CONTA"); 
        comandaRepository.save(comanda);
    }
}