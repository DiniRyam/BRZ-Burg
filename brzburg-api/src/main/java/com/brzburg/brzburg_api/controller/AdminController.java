package com.brzburg.brzburg_api.controller;

import com.brzburg.brzburg_api.model.Funcionario; 
import com.brzburg.brzburg_api.model.Mesa;
import com.brzburg.brzburg_api.service.FuncionarioService; 
import com.brzburg.brzburg_api.service.MesaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    // crud novo de funcionarios, e lista os funcionarios
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
}