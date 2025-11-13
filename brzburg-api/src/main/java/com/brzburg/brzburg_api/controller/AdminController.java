package com.brzburg.brzburg_api.controller;

import com.brzburg.brzburg_api.model.CardapioItem;
import com.brzburg.brzburg_api.model.CardapioSecao;
import com.brzburg.brzburg_api.model.Funcionario; 
import com.brzburg.brzburg_api.model.Mesa;
import com.brzburg.brzburg_api.service.CardapioService;
import com.brzburg.brzburg_api.service.DashboardService;
import com.brzburg.brzburg_api.service.FuncionarioService; 
import com.brzburg.brzburg_api.service.MesaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

//diz pro spring que é um controller e passa o url 
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    // injeta o objeto criado em mesaservice
    @Autowired
    private MesaService mesaService;

    // injeta o objeto bean do service de funcionario
    @Autowired
    private FuncionarioService funcionarioService;

    // injeta o objeto bean de service de cardapio
    @Autowired
    private CardapioService cardapioService;

    // injeta o objeto bean de servoces do dashboard
    @Autowired
    private DashboardService dashboardService;

    // usa o crud das mesas ja criada
    @GetMapping("/mesas")
    public List<Mesa> getMesas() {
        return mesaService.getTodasAsMesas();
    }

    @PostMapping("/mesas")
    public ResponseEntity<Mesa> criarMesa(@RequestBody Mesa novaMesa) {
        Mesa mesaSalva = mesaService.criarMesa(novaMesa);
        return new ResponseEntity<>(mesaSalva, HttpStatus.CREATED); 
    }

    @DeleteMapping("/mesas/{id}")
    public ResponseEntity<?> deletarMesa(@PathVariable Integer id) {
        try {
            mesaService.deletarMesa(id);
            return ResponseEntity.noContent().build(); 
        } catch (Exception e) {
            return new ResponseEntity<>(
                Map.of("erro", "Mesa em uso", "mensagem", e.getMessage()), 
                HttpStatus.CONFLICT
            );
        }
    }

    // crud novo de funcionarios, e lista todos os funcionarios
    @GetMapping("/funcionarios")
    public List<Funcionario> getFuncionariosAtivos() {
        // usa a jasonproperty write_only no model para a senha nunca ser enviada como resposta json
        return funcionarioService.getFuncionariosAtivos();
    }

    //bosca e retorna funcionarios inativos
    @GetMapping("/funcionarios/historico")
    public List<Funcionario> getFuncionariosHistorico() {
        return funcionarioService.getFuncionariosInativos();
    }

    // recebe o json de funcionario novo e cria ele
    @PostMapping("/funcionarios")
    public ResponseEntity<Funcionario> criarFuncionario(@RequestBody Funcionario novoFuncionario) {
        Funcionario funcionarioSalvo = funcionarioService.criarFuncionario(novoFuncionario);
        return new ResponseEntity<>(funcionarioSalvo, HttpStatus.CREATED);
    }

    //atualiza funcionario que ja existe
    @PutMapping("/funcionarios/{id}")
    public ResponseEntity<?> atualizarFuncionario(@PathVariable Integer id, @RequestBody Funcionario dadosFuncionario) {
        try {
            Funcionario funcionarioAtualizado = funcionarioService.atualizarFuncionario(id, dadosFuncionario);
            return ResponseEntity.ok(funcionarioAtualizado);
        } catch (Exception e) {
            // retorna 404 se o funcionario n existir
            return new ResponseEntity<>(
                Map.of("erro", "Não encontrado", "mensagem", e.getMessage()), 
                HttpStatus.NOT_FOUND
            );
        }
    }

    // faz o soft delete
    @DeleteMapping("/funcionarios/{id}")
    public ResponseEntity<?> arquivarFuncionario(@PathVariable Integer id) {
        try {
            funcionarioService.arquivarFuncionario(id);
            return ResponseEntity.noContent().build(); 
        } catch (Exception e) {
            return new ResponseEntity<>(
                Map.of("erro", "Não encontrado", "mensagem", e.getMessage()), 
                HttpStatus.NOT_FOUND
            );
        }
    }

    // implementa aqui o POST /api/admin/cardapio/secoes para criar secoes extras
    @PostMapping("/cardapio/secoes")
    public ResponseEntity<CardapioSecao> criarSecao(@RequestBody CardapioSecao secao) {
        CardapioSecao novaSecao = cardapioService.criarSecao(secao);
        return new ResponseEntity<>(novaSecao, HttpStatus.CREATED);
    }

    //implementa aqui o get /api/admin/cardapio/secoes que lista as secoes no front 
    @GetMapping("/cardapio/secoes")
    public List<CardapioSecao> getSecoes() {
        return cardapioService.getTodasAsSecoes();
    }
    
    //usa o get /api/admin/cardapio-editor com os itens ate os arquivados para o editor de cardapio do admin
    @GetMapping("/cardapio-editor")
    public List<CardapioItem> getItensParaEditor() {
        return cardapioService.getItensParaEditor();
    }

    //aqui implementa o post /api/admin/cardapio/itens do upload multipart, que usa requestparam para aceitar o formulario multipart from data com texto e arquivo
    @PostMapping(value = "/cardapio/itens", consumes = "multipart/form-data")
    public ResponseEntity<CardapioItem> criarItem(
            @RequestParam("nome") String nome,
            @RequestParam("descricao") String descricao,
            @RequestParam("preco") BigDecimal preco,
            @RequestParam("secaoId") Integer secaoId,
            @RequestParam(value = "imagem", required = false) MultipartFile imagem) {
        
        try {
            CardapioItem novoItem = cardapioService.criarItem(nome, descricao, preco, secaoId, imagem);
            return new ResponseEntity<>(novoItem, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    //implementa o delete /api/admin/cardapio/itens/{itemId} e faz o softdelete
    @DeleteMapping("/cardapio/itens/{itemId}")
    public ResponseEntity<?> arquivarItem(@PathVariable Integer itemId) {
        try {
            cardapioService.arquivarItem(itemId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return new ResponseEntity<>(
                Map.of("erro", "Não encontrado", "mensagem", e.getMessage()), 
                HttpStatus.NOT_FOUND
            );
        }
    }

    // implementa o get /api/admin/itens-disponibilidade e busca os itens arquivados para o admin gerir o estoque
    @GetMapping("/itens-disponibilidade")
    public List<CardapioItem> getItensDisponibilidade() {
        return cardapioService.getItensDisponibilidade();
    }

    // implementa o put /api/admin/itens-disponibilidade/{itemId} que altera o switch do acabou hoje
    @PutMapping("/itens-disponibilidade/{itemId}")
    public ResponseEntity<CardapioItem> setDisponibilidade(
            @PathVariable Integer itemId, 
            @RequestBody Map<String, Boolean> disponibilidadeRequest) {
        
        try {
            boolean isDisponivel = disponibilidadeRequest.get("isDisponivel");
            CardapioItem itemAtualizado = cardapioService.setDisponibilidade(itemId, isDisponivel);
            return ResponseEntity.ok(itemAtualizado);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    // usa o metodo auxiliar para saber se uma data vem do front mas se nao vier pega o periodo todo
    private LocalDateTime getInicioPeriodo(LocalDateTime inicio) {
        return (inicio != null) ? inicio : LocalDateTime.now().minusYears(100);
    }
    private LocalDateTime getFimPeriodo(LocalDateTime fim) {
        return (fim != null) ? fim : LocalDateTime.now();
    }
    
    //implementa get /api/reports/kpis com param de data de inicio opcional e fim opcional tambem e usando o dateformiso para usar um padrao
    @GetMapping("/reports/kpis")
    public ResponseEntity<Map<String, Object>> getKpis(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {
        
        // chama o dashboasrd service criado
        Map<String, Object> kpis = dashboardService.getKpis(getInicioPeriodo(inicio), getFimPeriodo(fim));
        return ResponseEntity.ok(kpis);
    }

    // implementa o get /api/reports/perdas igual o de cima
    @GetMapping("/reports/perdas")
    public ResponseEntity<Map<String, Object>> getPerdas(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {

        Map<String, Object> perdas = dashboardService.getPerdas(getInicioPeriodo(inicio), getFimPeriodo(fim));
        return ResponseEntity.ok(perdas);
    }

    // implementa o get /api/reports/top-items igual o resto
    @GetMapping("/reports/top-items")
    public ResponseEntity<List<Map<String, Object>>> getTopItems(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {
        
        List<Map<String, Object>> items = dashboardService.getTopItems(getInicioPeriodo(inicio), getFimPeriodo(fim));
        return ResponseEntity.ok(items);
    }

    // implementa o get /api/reports/vendas-garcom
    @GetMapping("/reports/vendas-garcom")
    public ResponseEntity<List<Map<String, Object>>> getVendasGarcom(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {
        
        List<Map<String, Object>> vendas = dashboardService.getVendasGarcom(getInicioPeriodo(inicio), getFimPeriodo(fim));
        return ResponseEntity.ok(vendas);
    }

    // implementa o get /api/reeports/vendas-hora
    @GetMapping("/reports/vendas-hora")
    public ResponseEntity<Map<Integer, BigDecimal>> getVendasHora(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {
        
        Map<Integer, BigDecimal> vendas = dashboardService.getVendasHora(getInicioPeriodo(inicio), getFimPeriodo(fim));
        return ResponseEntity.ok(vendas);
    }

    //implementa o get /api/reports/vendas-pagamento
    @GetMapping("/reports/vendas-pagamento")
    public ResponseEntity<Map<String, BigDecimal>> getVendasPagamento(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {
        
        Map<String, BigDecimal> vendas = dashboardService.getVendasPagamento(getInicioPeriodo(inicio), getFimPeriodo(fim));
        return ResponseEntity.ok(vendas);
    }
}
