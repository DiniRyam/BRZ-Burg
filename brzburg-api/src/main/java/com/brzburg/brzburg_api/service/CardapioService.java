package com.brzburg.brzburg_api.service;

import com.brzburg.brzburg_api.model.CardapioItem;
import com.brzburg.brzburg_api.model.CardapioSecao;
import com.brzburg.brzburg_api.repository.CardapioItemRepository;
import com.brzburg.brzburg_api.repository.CardapioSecaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

@Service
public class CardapioService {

    @Autowired
    private CardapioItemRepository itemRepository;

    @Autowired
    private CardapioSecaoRepository secaoRepository;

    // injeta o serviço de upload 
    @Autowired
    private FileStorageService fileStorageService;

    // logica para crias a secao no cardapio e salvar
    public CardapioSecao criarSecao(CardapioSecao secao) {
        return secaoRepository.save(secao);
    }

    public List<CardapioSecao> getTodasAsSecoes() {
        return secaoRepository.findAll();
    }
    
    // (Lógica de atualizar/deletar seção pode ser adicionada aqui)
    
    public CardapioItem criarItem(String nome, String descricao, BigDecimal preco, Integer secaoId, MultipartFile imagem) throws Exception {
        
        // acha a secao do cardapio no banco
        CardapioSecao secao = secaoRepository.findById(secaoId)
                .orElseThrow(() -> new Exception("Seção com ID " + secaoId + " não encontrada."));

        // salva a imagem no disco usando o filestorageservice puxado com autowired
        String imagemUrl = null;
        if (imagem != null && !imagem.isEmpty()) {
            imagemUrl = fileStorageService.salvarImagem(imagem);
        }

        // cria o objeto item do cardapio com ativo e disponivel true
        CardapioItem novoItem = new CardapioItem();
        novoItem.setNome(nome);
        novoItem.setDescricao(descricao);
        novoItem.setPreco(preco);
        novoItem.setSecao(secao);
        novoItem.setImagemUrl(imagemUrl);
        novoItem.setActive(true); 
        novoItem.setDisponivel(true); 

        // salva o item no banco
        return itemRepository.save(novoItem);
    }

    /**
     * Implementa: DELETE /api/admin/cardapio/itens/{itemId} (Arquivar)
     * Aplica a regra de "Soft Delete".
     */
    //aqui implementa a regra do soft delete, e da erro se nao achar o item
    public void arquivarItem(Integer itemId) throws Exception {
        CardapioItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new Exception("Item não encontrado"));

        // Apenas inativa
        item.setActive(false); 
        itemRepository.save(item);
    }
    
    // (A lógica de PUT /api/admin/cardapio/itens/{itemId} (Atualizar) seria similar)

    // procura apenas os itens nao arquivados
    public List<CardapioItem> getItensDisponibilidade() {
        
        return itemRepository.findByIsActiveTrue();
    }

    //altera o switch com a api PUT /api/admin/itens-disponibilidade/{itemId}
    public CardapioItem setDisponibilidade(Integer itemId, boolean isDisponivel) throws Exception {
        CardapioItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new Exception("Item não encontrado"));

        item.setDisponivel(isDisponivel);
        return itemRepository.save(item);
    }

    // busca os item ate os arquivados para o admin com a api GET /api/admin/cardapio-editor
     public List<CardapioItem> getItensParaEditor() {
        return itemRepository.findAll();
     }
}