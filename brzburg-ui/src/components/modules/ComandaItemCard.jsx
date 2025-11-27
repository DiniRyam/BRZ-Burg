import React from 'react';
import { Button } from '../ui/Button'; // O nosso Bloco de Lego
import { X, CornerDownLeft } from 'lucide-react'; // Ícones

/**
 * Este é o Card individual para cada item dentro da ComandaView.
 * @param {object} item - O objeto do item (ex: { nome: 'Hambúrguer', ... })
 * @param {string} role - "cliente" ou "garcom"
 * @param {function} onActionClick - Função chamada ao clicar em Cancelar ou Devolver
 */
export default function ComandaItemCard({ item, role, onActionClick }) {
  
  // Define a cor e o texto do status
  let statusColor = 'text-gray-500'; // Padrão
  if (item.status === 'EM_PREPARO') {
    statusColor = 'text-blue-500';
  } else if (item.status === 'CONCLUIDO') {
    statusColor = 'text-green-500'; //
  } else if (item.status === 'CANCELADO') {
    statusColor = 'text-red-500'; //
  } else if (item.status === 'DEVOLVIDO') {
    statusColor = 'text-gray-400'; //
  }

  const isFinalizado = item.status === 'CONCLUIDO' || item.status === 'CANCELADO' || item.status === 'DEVOLVIDO';

  return (
    <div className={`bg-white shadow-sm rounded-lg p-4 border border-gray-200 ${isFinalizado ? 'opacity-60' : ''}`}>
      <div className="flex justify-between items-start">
        {/* Informações do Item */}
        <div>
          {/* Título (Inter Semi-Bold 600) */}
          <h3 className="text-base font-semibold text-gray-900">
            {item.quantidade}x {item.nome}
          </h3>
          
          {/* Observação (Inter Regular 400) */}
          {item.observacao && (
            <p className="text-sm text-gray-500 italic">Obs: {item.observacao}</p>
          )}
          
          {/* Status (Inter Regular 400) */}
          <p className={`text-sm font-medium ${statusColor}`}>
            Status: {item.status}
          </p>
        </div>

        {/* Botão de Ação (varia com a role) */}
        <div className="flex-shrink-0">
          {role === 'cliente' && !isFinalizado && item.status === 'PENDENTE' && (
            <Button
              variant="danger" // Botão Vermelho
              className="px-2 py-1 text-xs" // Pequeno
              onClick={() => onActionClick(item)}
              aria-label="Cancelar item"
            >
              <X size={16} />
            </Button>
          )}
          
          {role === 'garcom' && item.status === 'CONCLUIDO' && (
             <Button
              variant="secondary" // Botão Cinza
              className="px-2 py-1 text-xs" // Pequeno
              onClick={() => onActionClick(item)}
              aria-label="Devolver item"
            >
              <CornerDownLeft size={16} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}