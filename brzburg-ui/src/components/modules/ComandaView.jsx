'use client'

import React, { useState, useEffect } from 'react';
import ComandaItemCard from './ComandaItemCard'; //
import { Button } from '../ui/Button'; //

// --- IMPORTAR SERVIÇOS REAIS ---
import { clienteService } from '../../services/clienteService';
import { garcomService } from '../../services/garcomService';

export default function ComandaView({ role, mesaId }) {
  const [comanda, setComanda] = useState(null);
  const [totalCalculado, setTotalCalculado] = useState(0);

  // Efeito para buscar dados (Polling)
  useEffect(() => {
    if (!mesaId) return;

    const fetchComanda = async () => {
      try {
        let data;
        
        if (role === 'cliente') {
          data = await clienteService.getComanda(mesaId);
        } else {
          data = await garcomService.getComanda(mesaId);
        }
        
        setComanda(data);

        if (data && data.itens) {
          const total = data.itens.reduce((acc, item) => {
            if (item.status !== 'CANCELADO' && item.status !== 'DEVOLVIDO') {
              return acc + (item.precoNoMomento * item.quantidade);
            }
            return acc;
          }, 0);
          setTotalCalculado(total);
        }

      } catch (error) {
        console.error("Erro ao buscar dados da comanda:", error);
      }
    };

    fetchComanda(); 
    
    const intervalId = setInterval(fetchComanda, 10000); 

    return () => clearInterval(intervalId);
    
  }, [mesaId, role]); 

  // Ação: Cancelar (Cliente) ou Devolver (Garçom)
  const handleItemAction = async (item) => {
    try {
      if (role === 'cliente') {
        // eslint-disable-next-line no-restricted-globals
        if (confirm("Deseja realmente cancelar este item?")) {
             await clienteService.cancelarPedido(item.id); 
             alert("Item cancelado com sucesso!");
        }
      } else if (role === 'garcom') {
        // eslint-disable-next-line no-restricted-globals
        if (confirm("Confirmar devolução do item?")) {
            await garcomService.devolverItem(item.id);
            alert("Item devolvido.");
        }
      }
    } catch (error) {
      // --- CORREÇÃO: Usamos o erro para logar no console ---
      console.error("Erro na ação do item:", error);
      alert("Erro ao processar ação. Verifique se o tempo limite expirou.");
    }
  };

  // Ação: Pedir Conta (Cliente)
  const handlePedirConta = async () => {
    try {
      await clienteService.pedirConta(mesaId);
      alert("Conta solicitada! Um garçom irá até a sua mesa.");
    } catch (error) {
      // --- CORREÇÃO: Usamos o erro para logar no console ---
      console.error("Erro ao pedir conta:", error);
      alert("Erro ao solicitar conta.");
    }
  };

  if (!comanda) {
    return <div className="p-4 text-center text-gray-500">A carregar comanda...</div>;
  }

  return (
    <div className="relative w-full h-full bg-gray-50 pb-28">
      
      {/* Lista de Itens */}
      <div className="p-4 space-y-3">
        {(!comanda.itens || comanda.itens.length === 0) ? (
           <p className="text-center text-gray-500 mt-10">A comanda está vazia.</p>
        ) : (
           comanda.itens.map((item) => (
            <ComandaItemCard 
              key={item.id} 
              item={item}
              role={role}
              onActionClick={handleItemAction}
            />
          ))
        )}
      </div>

      {/* Rodapé Fixo */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-bold text-gray-900">Total:</span>
            <span className="text-xl font-bold text-gray-900">
              R$ {totalCalculado.toFixed(2).replace('.', ',')}
            </span>
          </div>
          
          {role === 'cliente' && (
            <Button 
              variant="primary" 
              className="w-full py-3 text-lg"
              onClick={handlePedirConta}
            >
              Pedir a Conta
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}