package com.brzburg.brzburg_api.service;

import com.brzburg.brzburg_api.model.ContasFechadas;
import com.brzburg.brzburg_api.model.ItemPedido;
import com.brzburg.brzburg_api.repository.ContasFechadasRepository;
import com.brzburg.brzburg_api.repository.ItemPedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private ContasFechadasRepository contasFechadasRepository; //injeta o bean de contas fechadas 

    @Autowired
    private ItemPedidoRepository itemPedidoRepository; // inejta o bean de item pedido repository

    // um metodo pra puxar as contas no intervalo de data e o uso do metodo criado la em contasfechadas
    private List<ContasFechadas> getContasNoPeriodo(LocalDateTime inicio, LocalDateTime fim) {
        return contasFechadasRepository.findAllByDataFechamentoBetween(inicio, fim);
    }
    
    //um metodo auxiliar novo para puxar os itens de pedido no intervalo de tempo, provavelmente vou criar um metodo no repository se eu lembrar igual o de contas fechadas 
    private List<ItemPedido> getItensNoPeriodo(LocalDateTime inicio, LocalDateTime fim) {
        return itemPedidoRepository.findAll().stream()
                .filter(item -> item.getTimestampPedido().isAfter(inicio) && item.getTimestampPedido().isBefore(fim))
                .collect(Collectors.toList());
    }

    // implementa o get /api/reports/kpis
    public Map<String, Object> getKpis(LocalDateTime inicio, LocalDateTime fim) {
        List<ContasFechadas> contas = getContasNoPeriodo(inicio, fim);

        int comandasFechadas = contas.size();
        BigDecimal receitaTotal = contas.stream()
                .map(ContasFechadas::getValorTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal ticketMedio = BigDecimal.ZERO;
        if (comandasFechadas > 0) {
            ticketMedio = receitaTotal.divide(new BigDecimal(comandasFechadas), 2, RoundingMode.HALF_UP);
        }

        Map<String, Object> kpis = new HashMap<>();
        kpis.put("receitaTotal", receitaTotal);
        kpis.put("comandasFechadas", comandasFechadas);
        kpis.put("ticketMedio", ticketMedio);
        
        return kpis;
    }

    // implementa o get /api/reports/perdas
    public Map<String, Object> getPerdas(LocalDateTime inicio, LocalDateTime fim) {
        List<ItemPedido> itens = getItensNoPeriodo(inicio, fim);

        long totalCancelados = itens.stream().filter(item -> "CANCELADO".equals(item.getStatus())).count();
        long totalDevolvidos = itens.stream().filter(item -> "DEVOLVIDO".equals(item.getStatus())).count();

        // calcula o valor perdido com os cancelamenbtos e devolucoes sem usando o bigdecimal para operacoes financeiras 
        BigDecimal valorCancelado = itens.stream()
                .filter(item -> "CANCELADO".equals(item.getStatus()))
                .map(item -> item.getPrecoNoMomento().multiply(new BigDecimal(item.getQuantidade())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal valorDevolvido = itens.stream()
                .filter(item -> "DEVOLVIDO".equals(item.getStatus()))
                .map(item -> item.getPrecoNoMomento().multiply(new BigDecimal(item.getQuantidade())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> perdas = new HashMap<>();
        perdas.put("cancelados", Map.of("total", totalCancelados, "valor", valorCancelado));
        perdas.put("devolvidos", Map.of("total", totalDevolvidos, "valor", valorDevolvido));
        
        return perdas;
    }

    // implementa get /api/reports/top-items
    public List<Map<String, Object>> getTopItems(LocalDateTime inicio, LocalDateTime fim) {
        List<ItemPedido> itens = getItensNoPeriodo(inicio, fim);
        
        // aqui aplica um filtro apenas para itens registrados com status de concluido
        return itens.stream()
                .filter(item -> "CONCLUIDO".equals(item.getStatus()))
                .collect(Collectors.groupingBy(item -> item.getItem().getNome(), // aqui junta por nome dos items 
                         Collectors.summingInt(ItemPedido::getQuantidade))) // aqui soma as quantidaddes 
                .entrySet().stream() // transforma em stream com  nome e quantidade
                .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue())) // compara e ordena do maior para o menor
                .limit(5) // filtra os 5 primeiros 
                .map(entry -> Map.of("nome", (Object)entry.getKey(), "vendidos", (Object)entry.getValue())) // formata a saida para mandar pro front
                .collect(Collectors.toList());
    }

    // implementa o get /api/reports/vendas-garcom denovo com os metodos de filtrar por data
    public List<Map<String, Object>> getVendasGarcom(LocalDateTime inicio, LocalDateTime fim) {
        List<ContasFechadas> contas = getContasNoPeriodo(inicio, fim);

        return contas.stream()
                .collect(Collectors.groupingBy(conta -> conta.getFuncionario().getNome(), // agrupa por nome do funcionário
                         Collectors.mapping(ContasFechadas::getValorTotal, // pega o valor total de cada conta
                         Collectors.reducing(BigDecimal.ZERO, BigDecimal::add)))) // soma os valores
                .entrySet().stream()
                .map(entry -> Map.of("nomeGarcom", (Object)entry.getKey(),"receitaGerada", (Object)entry.getValue()
                    // cpnta a receita gerada e o nome do garcom para mandar pro front
                ))
                .collect(Collectors.toList());
    }

    //implementa get /api/reports/vendas-hora
    public Map<Integer, BigDecimal> getVendasHora(LocalDateTime inicio, LocalDateTime fim) {
        List<ContasFechadas> contas = getContasNoPeriodo(inicio, fim);

        return contas.stream()
                .collect(Collectors.groupingBy(conta -> conta.getDataFechamento().getHour(), //agrupa pela hora o a 23
                         Collectors.mapping(ContasFechadas::getValorTotal,
                         Collectors.reducing(BigDecimal.ZERO, BigDecimal::add)))); //oma os valores
    }

    //implementa o get /api/reports/vendas-pagamento
    public Map<String, BigDecimal> getVendasPagamento(LocalDateTime inicio, LocalDateTime fim) {
        List<ContasFechadas> contas = getContasNoPeriodo(inicio, fim);

        return contas.stream()
                .collect(Collectors.groupingBy(ContasFechadas::getMetodoPagamento, // junta pix cartao e dinheiro
                         Collectors.mapping(ContasFechadas::getValorTotal,
                         Collectors.reducing(BigDecimal.ZERO, BigDecimal::add)))); // soma os valores
    }
}