package com.brzburg.brzburg_api.service;

import com.brzburg.brzburg_api.model.*;
import com.brzburg.brzburg_api.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GarcomService {

    @Autowired
    private MesaRepository mesaRepository;

    @Autowired
    private ComandaRepository comandaRepository;

    @Autowired
    private ItemPedidoRepository itemPedidoRepository;

    @Autowired
    private ContasFechadasRepository contasFechadasRepository;

    @Autowired
    private FuncionarioRepository funcionarioRepository;

    /**
     * Implementa: GET /api/garcom/dashboard
     */
    public Map<String, Object> getDashboard() {
        // CORREÇÃO: Busca APENAS as mesas ativas (não arquivadas)
        // Antes estava mesaRepository.findAll()
        List<Mesa> mesas = mesaRepository.findByIsActiveTrue();

        // 2. Gerar Alertas (O resto do método continua igual)
        List<Map<String, String>> alertas = new ArrayList<>();

        List<Comanda> comandasPedindoConta = comandaRepository.findAll().stream()
                .filter(c -> "PEDIU_CONTA".equals(c.getStatusSolicitacao()) && "ATIVA".equals(c.getStatus()))
                .collect(Collectors.toList());

        for (Comanda c : comandasPedindoConta) {
            alertas.add(Map.of(
                "tipo", "CONTA_SOLICITADA",
                "mesaId", c.getMesa().getId().toString(),
                "mesaNome", c.getMesa().getNome(),
                "mensagem", "💰 Pediu a conta!"
            ));
        }

        List<String> statusPronto = Collections.singletonList("CONCLUIDO");
        List<ItemPedido> itensProntos = itemPedidoRepository.findByStatusIn(statusPronto);

        Set<Integer> mesasComPedidoPronto = new HashSet<>();
        for (ItemPedido item : itensProntos) {
            if ("ATIVA".equals(item.getComanda().getStatus())) {
                mesasComPedidoPronto.add(item.getComanda().getMesa().getId());
            }
        }

        for (Integer mesaId : mesasComPedidoPronto) {
            // Só gera alerta se a mesa ainda estiver ativa
            Optional<Mesa> mOpt = mesaRepository.findById(mesaId);
            if (mOpt.isPresent() && mOpt.get().isActive()) {
                Mesa m = mOpt.get();
                alertas.add(Map.of(
                    "tipo", "PEDIDO_PRONTO",
                    "mesaId", m.getId().toString(),
                    "mesaNome", m.getNome(),
                    "mensagem", "🍽️ Pedido pronto na cozinha!"
                ));
            }
        }

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("mesas", mesas);
        dashboard.put("alertas", alertas);

        return dashboard;
    }

    // ... (Mantenha os outros métodos: getComandaPorMesa, devolverItem, fecharConta iguais) ...
    public Comanda getComandaPorMesa(Integer mesaId) throws Exception {
        return comandaRepository.findByMesaIdAndStatus(mesaId, "ATIVA")
                .orElseThrow(() -> new Exception("Nenhuma comanda ativa nesta mesa."));
    }

    public ItemPedido devolverItem(Integer itemPedidoId) throws Exception {
        ItemPedido item = itemPedidoRepository.findById(itemPedidoId)
                .orElseThrow(() -> new Exception("Item não encontrado."));
        
        item.setStatus("DEVOLVIDO");
        return itemPedidoRepository.save(item);
    }

    @Transactional
    public void fecharConta(Integer mesaId, String metodoPagamento, String loginFuncionario) throws Exception {
        Comanda comanda = comandaRepository.findByMesaIdAndStatus(mesaId, "ATIVA")
                .orElseThrow(() -> new Exception("Comanda não encontrada."));

        Funcionario funcionario = funcionarioRepository.findByUsuario(loginFuncionario)
                .orElseThrow(() -> new Exception("Funcionário não encontrado."));

        // Se você mudou o Comanda.java para ter a lista, use:
        List<ItemPedido> itens = comanda.getItemPedidos();
        if (itens == null) itens = new ArrayList<>();

        BigDecimal totalCalculado = BigDecimal.ZERO;
        for (ItemPedido item : itens) {
            if (!"CANCELADO".equals(item.getStatus()) && !"DEVOLVIDO".equals(item.getStatus())) {
                BigDecimal subtotal = item.getPrecoNoMomento().multiply(new BigDecimal(item.getQuantidade()));
                totalCalculado = totalCalculado.add(subtotal);
            }
        }

        ContasFechadas conta = new ContasFechadas();
        conta.setComanda(comanda);
        conta.setFuncionario(funcionario);
        conta.setValorTotal(totalCalculado);
        conta.setMetodoPagamento(metodoPagamento);
        conta.setDataFechamento(LocalDateTime.now());
        
        contasFechadasRepository.save(conta);

        comanda.setStatus("FECHADA");
        comanda.setStatusSolicitacao(null); 
        comandaRepository.save(comanda);

        Mesa mesa = comanda.getMesa();
        mesa.setStatus("LIVRE"); 
        mesaRepository.save(mesa);
    }
}