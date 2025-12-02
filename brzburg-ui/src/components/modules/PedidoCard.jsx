'use client'

import React from 'react';
import Card from '../ui/Card'; 

export default function PedidoCard({ item, onClick, readOnly }) {

  let borderColor = 'border-gray-200'; 
  if (item.status === 'CONCLUIDO') borderColor = 'border-green-500'; 
  else if (item.status === 'CANCELADO') borderColor = 'border-red-500'; 
  else if (item.status === 'DEVOLVIDO') borderColor = 'border-gray-400'; 

  // --- CORREÇÃO: Agora lemos direto, pois o KdsService.java já preparou tudo ---
  const nomeMesa = item.mesaNome || "Mesa ?";
  const nomeItem = item.itemNome || "Item ?";

  const title = (
    <span>
      <span className="font-bold text-gray-900">{nomeMesa.toUpperCase()}</span>
      <span className="font-semibold text-gray-900"> - </span>
      <span className="font-semibold text-gray-900">
        {item.quantidade}x {nomeItem}
      </span>
    </span>
  );

  const description = item.observacao ? `Obs: ${item.observacao}` : null;

  return (
    <div className="mb-4">
      <Card
        title={title}
        description={description}
        onClick={!readOnly ? () => onClick(item) : null}
        className={`border-l-4 ${borderColor}`} 
      >
        {item.status !== 'PENDENTE' && item.status !== 'EM_PREPARO' && (
          <p className="mt-2 text-sm font-bold text-gray-700">
            Status: {item.status}
          </p>
        )}
      </Card>
    </div>
  );
}