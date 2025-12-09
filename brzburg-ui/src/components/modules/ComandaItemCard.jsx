import React from 'react';
import { Button } from '../ui/Button'; 
import { X, CornerDownLeft } from 'lucide-react'; 

export default function ComandaItemCard({ item, role, onActionClick }) {
  
  // Cores dos status
  let statusColor = 'text-gray-500';
  if (item.status === 'EM_PREPARO') statusColor = 'text-blue-500';
  else if (item.status === 'CONCLUIDO') statusColor = 'text-green-500';
  else if (item.status === 'CANCELADO') statusColor = 'text-red-500';
  else if (item.status === 'DEVOLVIDO') statusColor = 'text-gray-400';

  const isFinalizado = item.status === 'CONCLUIDO' || item.status === 'CANCELADO' || item.status === 'DEVOLVIDO';

  // --- CORREÇÃO CRÍTICA: ACESSAR O NOME CORRETAMENTE ---
  // O objeto 'item' que chega aqui é o 'ItemPedido'.
  // Dentro dele tem o objeto 'item' (que é o Produto do cardápio).
  // Então o nome está em: item.item.nome
  const nomeProduto = item.item ? item.item.nome : "Produto Desconhecido";

  return (
    <div className={`bg-white shadow-sm rounded-lg p-4 border border-gray-200 ${isFinalizado ? 'opacity-60' : ''}`}>
      <div className="flex justify-between items-start">
        <div>
          {/* Quantidade e Nome Corrigido */}
          <h3 className="text-base font-semibold text-gray-900">
            {item.quantidade}x {nomeProduto}
          </h3>
          
          {item.observacao && (
            <p className="text-sm text-gray-500 italic">Obs: {item.observacao}</p>
          )}
          
          <p className={`text-sm font-medium ${statusColor}`}>
            Status: {item.status}
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="flex-shrink-0">
          {role === 'cliente' && !isFinalizado && item.status === 'PENDENTE' && (
            <Button
              variant="danger"
              className="px-2 py-1 text-xs"
              onClick={() => onActionClick(item)}
              title="Cancelar Item"
            >
              <X size={16} />
            </Button>
          )}
          
          {role === 'garcom' && item.status === 'CONCLUIDO' && (
             <Button
              variant="secondary"
              className="px-2 py-1 text-xs"
              onClick={() => onActionClick(item)}
              title="Devolver Item"
            >
              <CornerDownLeft size={16} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}