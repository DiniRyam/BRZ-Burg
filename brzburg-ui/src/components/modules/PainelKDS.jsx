'use client'

import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import PedidoCard from './PedidoCard'; 
import { kdsService } from '../../services/kdsService';

export default function PainelKDS({ readOnly = false }) {
  const [pendentes, setPendentes] = useState([]);
  const [emPreparo, setEmPreparo] = useState([]);
  const [finalizados, setFinalizados] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // --- MUDANÇA 1: Estado de Gatilho (Trigger) ---
  // Usamos isto para forçar a atualização quando clicamos no botão.
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // --- MUDANÇA 2: A lógica de busca vive DENTRO do useEffect ---
  useEffect(() => {
    let isMounted = true; // Previne erros se o componente desmontar durante o fetch

    const fetchPedidos = async () => {
      try {
        const data = await kdsService.getDashboard();
        if (isMounted) {
          setPendentes(data.pendentes);
          setEmPreparo(data.emPreparo);
          setFinalizados(data.finalizados);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do KDS:", error);
      }
    };

    fetchPedidos(); // Busca imediata
    
    const intervalId = setInterval(fetchPedidos, 5000); 

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
    
  // O efeito roda quando monta E quando o 'refreshTrigger' muda
  }, [refreshTrigger]); 

  const handleCardClick = (item) => {
    if (readOnly) return; 

    if (item.status === 'PENDENTE' || item.status === 'EM_PREPARO') {
      setSelectedItem(item);
      setIsModalOpen(true);
    }
  };

  const handleConfirmUpdate = async () => {
    if (!selectedItem) return;

    try {
      await kdsService.atualizarStatus(selectedItem.id); 
      setIsModalOpen(false);
      setSelectedItem(null);
      
      // --- MUDANÇA 3: Dispara o gatilho para atualizar a lista ---
      setRefreshTrigger(prev => prev + 1);
      
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const modalTitle = useMemo(() => {
    if (!selectedItem) return "";
    return selectedItem.status === 'PENDENTE' 
      ? "Mover para 'Em Preparo'?"
      : "Mover para 'Concluído'?";
  }, [selectedItem]); 

  return (
    <div className="flex h-full w-full bg-gray-50 p-4 space-x-4 overflow-x-auto">
      
      {/* Coluna Pendentes */}
      <div className="flex-1 min-w-[300px]">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          PENDENTES ({pendentes.length})
        </h2>
        <div className="p-2 bg-gray-200 rounded-lg h-full overflow-y-auto">
          {pendentes.map((item) => (
            <PedidoCard 
              key={item.id} 
              item={item} 
              onClick={handleCardClick} 
              readOnly={readOnly}
            />
          ))}
        </div>
      </div>

      {/* Coluna Preparo */}
      <div className="flex-1 min-w-[300px]">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          EM PREPARO ({emPreparo.length})
        </h2>
        <div className="p-2 bg-gray-200 rounded-lg h-full overflow-y-auto">
          {emPreparo.map((item) => (
            <PedidoCard 
              key={item.id} 
              item={item} 
              onClick={handleCardClick} 
              readOnly={readOnly}
            />
          ))}
        </div>
      </div>

      {/* Coluna Finalizados */}
      <div className="flex-1 min-w-[300px]">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          FINALIZADOS ({finalizados.length})
        </h2>
        <div className="p-2 bg-gray-200 rounded-lg h-full overflow-y-auto">
          {finalizados.map((item) => (
            <PedidoCard 
              key={item.id} 
              item={item} 
              onClick={handleCardClick} 
              readOnly={true} 
            />
          ))}
        </div>
      </div>

      {/* Modal de Confirmação */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={modalTitle} 
      >
        <p>
          Avançar o pedido de <span className="font-semibold">{selectedItem?.item?.nome}</span> da <span className="font-semibold">{selectedItem?.comanda?.mesa?.nome}</span>?
        </p>
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button 
            variant="secondary" 
            onClick={() => setIsModalOpen(false)}
          >
            Não
          </Button>
          <Button 
            variant="primary" 
            onClick={handleConfirmUpdate}
          >
            Sim, avançar
          </Button>
        </div>
      </Modal>
    </div>
  );
}