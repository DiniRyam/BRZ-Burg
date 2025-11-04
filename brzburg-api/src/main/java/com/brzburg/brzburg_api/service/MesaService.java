package com.brzburg.brzburg_api.service;

import com.brzburg.brzburg_api.model.Mesa;
import com.brzburg.brzburg_api.repository.MesaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

//mostra para o spring que isso é logica do negocio
@Service 
public class MesaService {

    //o spring pega o repositorio com isso
    @Autowired
    private MesaRepository mesaRepository;

    //logica para usar a api e buscar todas as mesas, o get /api/admin/mesas
    public List<Mesa> getTodasAsMesas() {
        return mesaRepository.findAll();
    }

    //logica para a mesa ser criada com o status livre e ter ele retornado, o post /api/admin/mesas
    public Mesa criarMesa(Mesa mesa) {
        mesa.setStatus("LIVRE"); 
        return mesaRepository.save(mesa);
    }

    //logica para procurar a mesa no banco e deletar a mesa com a delete, o delete, /api/admin/mesas
    public void deletarMesa(Integer id) throws Exception {
        Optional<Mesa> mesaOptional = mesaRepository.findById(id);
        
        if (mesaOptional.isEmpty()) {
            throw new Exception("Mesa com ID " + id + " não encontrada.");
        }

        Mesa mesa = mesaOptional.get();

        //parte para nao excluir a mesa se ela estiver ocupada, vai passar a excessao para o controler como erro, e se tiver livre apaga a mesa
        if ("OCUPADA".equals(mesa.getStatus())) {
            throw new Exception("A 'Mesa " + mesa.getNome() + "' está em uso e não pode ser excluída.");
        }

        mesaRepository.delete(mesa);
    }
}
