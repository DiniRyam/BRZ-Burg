package com.brzburg.brzburg_api.service;

import com.brzburg.brzburg_api.model.Configuracao;
import com.brzburg.brzburg_api.model.Comanda;
import com.brzburg.brzburg_api.model.ItemPedido;
import com.brzburg.brzburg_api.model.Mesa;
import com.brzburg.brzburg_api.repository.ConfiguracaoRepository;
import com.brzburg.brzburg_api.repository.ComandaRepository;
import com.brzburg.brzburg_api.repository.ItemPedidoRepository;
import com.brzburg.brzburg_api.repository.MesaRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
public class ConfiguracaoService {

    @Autowired private ConfiguracaoRepository configuracaoRepository;
    @Autowired private ItemPedidoRepository itemPedidoRepository;
    @Autowired private MesaRepository mesaRepository;
    @Autowired private ComandaRepository comandaRepository;

    // Garante que a configuração exista ao ligar o servidor
    @PostConstruct
    public void init() {
        if (configuracaoRepository.count() == 0) {
            Configuracao config = new Configuracao();
            config.setSistemaAberto(true); // Padrão inicial
            configuracaoRepository.save(config);
        }
    }

    public boolean isSistemaAberto() {
        return configuracaoRepository.findById(1).map(Configuracao::isSistemaAberto).orElse(false);
    }

    public void abrirTurno() {
        Configuracao config = configuracaoRepository.findById(1).orElse(new Configuracao());
        config.setSistemaAberto(true);
        configuracaoRepository.save(config);
    }

    @Transactional
    public void fecharTurno() {
        // Fecha o sistema
        Configuracao config = configuracaoRepository.findById(1).orElse(new Configuracao());
        config.setSistemaAberto(false);
        configuracaoRepository.save(config);

        System.out.println("--- INICIANDO FAXINA DE FECHAMENTO DE TURNO ---");

        // Cancelar todos os Itens Pendentes/Em Preparo 
        List<String> statusAtivos = Arrays.asList("PENDENTE", "EM_PREPARO");
        List<ItemPedido> itensAbertos = itemPedidoRepository.findByStatusIn(statusAtivos);
        for (ItemPedido item : itensAbertos) {
            item.setStatus("CANCELADO");
            item.setObservacao((item.getObservacao() != null ? item.getObservacao() : "") + " [Fechamento Auto]");
            itemPedidoRepository.save(item);
        }

        // Encerrar todas as Comandas Abertas (Limpa o sistema financeiro pendente)
        // Precisamos buscar todas as ativas (faremos uma busca simples e filtro no Java ou criar query no Repo)
        // Para simplificar, vamos assumir que o Repo tem findAll e filtramos:
        List<Comanda> comandas = comandaRepository.findAll();
        for (Comanda c : comandas) {
            if ("ATIVA".equals(c.getStatus())) {
                c.setStatus("FECHADA"); // Fecha sem pagamento 
                c.setStatusSolicitacao(null);
                comandaRepository.save(c);
            }
        }

        // Liberar todas as Mesas (Limpa o Painel do Garçom)
        List<Mesa> mesas = mesaRepository.findAll();
        for (Mesa m : mesas) {
            if ("OCUPADA".equals(m.getStatus())) {
                m.setStatus("LIVRE");
                mesaRepository.save(m);
            }
        }
        
        System.out.println("--- FAXINA CONCLUÍDA: Telas Limpas ---");
    }
}