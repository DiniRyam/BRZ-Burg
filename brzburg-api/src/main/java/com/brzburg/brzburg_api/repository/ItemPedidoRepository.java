package com.brzburg.brzburg_api.repository;

import com.brzburg.brzburg_api.model.ItemPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemPedidoRepository extends JpaRepository<ItemPedido, Integer> {

    // metodo especial para a api get /api/kds/dashboard que busca os itens que estao em estado de producao como os pendentes e em preparo, e o kds vai chamar esse metodo ai com a lista pendente e em preparo
    List<ItemPedido> findByStatusIn(List<String> statuses);
}