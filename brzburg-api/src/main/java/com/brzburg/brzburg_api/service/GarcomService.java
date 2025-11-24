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
     * Retorna o status de todas as mesas e gera alertas de "Pedido Pronto" ou "Pediu Conta".
     */
    public Map<String, Object> getDashboard() {
        // 1. Buscar todas as mesas para o mapa do salão
        List<Mesa> mesas = mesaRepository.findAll();

        // 2. Gerar Alertas
        List<Map<String, String>> alertas = new ArrayList<>();

        // 2a. Alerta: Clientes que pediram a conta
        // (Busca comandas onde status_solicitacao = 'PEDIU_CONTA')
        List<Comanda> comandasPedindoConta = comandaRepository.findAll().stream()
                .filter(c -> "PEDIU_CONTA".equals(c.getStatusSolicitacao()) && "ATIVA".equals(c.getStatus()))
                .collect(Collectors.toList());

        for (Comanda c : comandasPedindoConta) {
            alertas.add(Map.of(
                "tipo", "CONTA_SOLICITADA",
                "mesaId", c.getMesa().getId().toString(),
                "mesaNome", c.getMesa().getNome(),
                "mensagem", "Pediu a conta!"
            ));
        }

        // 2b. Alerta: Pedidos prontos na cozinha (Status = 'CONCLUIDO')
        // (Busca itens concluídos de comandas ativas que ainda não foram entregues/fechados)
        // Nota: Na V1, assumimos que se está "CONCLUIDO" e a comanda é "ATIVA", o garçom deve levar.
        List<String> statusPronto = Collections.singletonList("CONCLUIDO");
        List<ItemPedido> itensProntos = itemPedidoRepository.findByStatusIn(statusPronto);

        // Agrupar itens prontos por mesa para não spammar alertas
        Set<Integer> mesasComPedidoPronto = new HashSet<>();
        for (ItemPedido item : itensProntos) {
            if ("ATIVA".equals(item.getComanda().getStatus())) {
                mesasComPedidoPronto.add(item.getComanda().getMesa().getId());
            }
        }

        for (Integer mesaId : mesasComPedidoPronto) {
            // (Otimização: Poderíamos buscar o nome da mesa sem ir ao banco de novo se usássemos um Map)
            Mesa m = mesaRepository.findById(mesaId).orElse(new Mesa()); 
            alertas.add(Map.of(
                "tipo", "PEDIDO_PRONTO",
                "mesaId", m.getId().toString(),
                "mesaNome", m.getNome(),
                "mensagem", "Pedido pronto na cozinha!"
            ));
        }

        // 3. Montar resposta
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("mesas", mesas);
        dashboard.put("alertas", alertas);

        return dashboard;
    }

    /**
     * Implementa: GET /api/garcom/comanda/{mesaId}
     * Busca a comanda ativa da mesa.
     */
    public Comanda getComandaPorMesa(Integer mesaId) throws Exception {
        return comandaRepository.findByMesaIdAndStatus(mesaId, "ATIVA")
                .orElseThrow(() -> new Exception("Nenhuma comanda ativa nesta mesa."));
    }

    /**
     * Implementa: POST /api/garcom/pedido/devolver
     * Marca um item como devolvido (ex: cliente não gostou).
     */
    public ItemPedido devolverItem(Integer itemPedidoId) throws Exception {
        ItemPedido item = itemPedidoRepository.findById(itemPedidoId)
                .orElseThrow(() -> new Exception("Item não encontrado."));
        
        item.setStatus("DEVOLVIDO");
        return itemPedidoRepository.save(item);
    }

    /**
     * Implementa: POST /api/garcom/comanda/fechar
     * Fecha a conta, calcula o total, salva no histórico financeiro e libera a mesa.
     */
    @Transactional
    public void fecharConta(Integer mesaId, String metodoPagamento, String loginFuncionario) throws Exception {
        // 1. Busca a comanda ativa
        Comanda comanda = comandaRepository.findByMesaIdAndStatus(mesaId, "ATIVA")
                .orElseThrow(() -> new Exception("Comanda não encontrada."));

        // 2. Busca o funcionário
        Funcionario funcionario = funcionarioRepository.findByUsuario(loginFuncionario)
                .orElseThrow(() -> new Exception("Funcionário não encontrado."));

        // 3. Calcula o Total
        // AGORA ISTO FUNCIONA DIRETAMENTE:
        List<ItemPedido> itens = comanda.getItemPedidos(); // O Hibernate busca a lista sozinho
        
        if (itens == null) itens = new ArrayList<>(); // Proteção contra null

        BigDecimal totalCalculado = BigDecimal.ZERO;
        for (ItemPedido item : itens) {
            if (!"CANCELADO".equals(item.getStatus()) && !"DEVOLVIDO".equals(item.getStatus())) {
                BigDecimal subtotal = item.getPrecoNoMomento().multiply(new BigDecimal(item.getQuantidade()));
                totalCalculado = totalCalculado.add(subtotal);
            }
        }

        // 4. Criar o registro financeiro (ContasFechadas)
        ContasFechadas conta = new ContasFechadas();
        conta.setComanda(comanda);
        conta.setFuncionario(funcionario);
        conta.setValorTotal(totalCalculado);
        conta.setMetodoPagamento(metodoPagamento);
        conta.setDataFechamento(LocalDateTime.now());
        
        contasFechadasRepository.save(conta);

        // 5. Atualizar status da Comanda e da Mesa
        comanda.setStatus("FECHADA");
        comanda.setStatusSolicitacao(null); // Limpa o alerta
        comandaRepository.save(comanda);

        Mesa mesa = comanda.getMesa();
        mesa.setStatus("LIVRE"); // Libera a mesa para novos clientes
        mesaRepository.save(mesa);
    }
}