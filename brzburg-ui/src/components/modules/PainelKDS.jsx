'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

  const fetchPedidos = useCallback(async () => {
    try {
      const data = await kdsService.getDashboard(); 
      setPendentes(data.pendentes);
      setEmPreparo(data.emPreparo);
      setFinalizados(data.finalizados);
    } catch (error) {
      console.error("Erro ao buscar dados do KDS:", error);
    }
    // adicao das dependencias 
  }, [setPendentes, setEmPreparo, setFinalizados]); 

  // efeito para usar o polling
  useEffect(() => {
    fetchPedidos(); 
    
    // sta o timer para 5 segundos
    const intervalId = setInterval(fetchPedidos, 5000); 

    // limpa o intervalo quando desmanchar o componente
    return () => clearInterval(intervalId);
    
    //juro daqui pra deus que n sei por que dava erro aqui e no fetchPedidos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchPedidos]);

  // usando o userCallback
  const handleCardClick = useCallback((item) => {
    if (readOnly) return; 

    if (item.status === 'PENDENTE' || item.status === 'EM_PREPARO') {
      setSelectedItem(item);
      setIsModalOpen(true);
    }
  }, [readOnly, setSelectedItem, setIsModalOpen]); 

  // denovo
  const handleConfirmUpdate = useCallback(async () => {
    if (!selectedItem) return;

    try {
      await kdsService.atualizarStatus(selectedItem.id); 
      setIsModalOpen(false);
      setSelectedItem(null);

      //faz uma atualização forcada
      await fetchPedidos(); 
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  }, [selectedItem, fetchPedidos, setIsModalOpen, setSelectedItem]); 

  // usando o usememo
  const modalTitle = useMemo(() => {
    if (!selectedItem) return "";
    return selectedItem.status === 'PENDENTE' 
      ? "Mover para 'Em Preparo'?"
      : "Mover para 'Concluído'?";
  }, [selectedItem]); 

  return (
    // O fundo off-white 
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

      {/* Coluna Finalizados / Outros */}
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

      {/* modal pra confirmar */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={modalTitle} 
      >
        <p>Avançar o pedido de <span className="font-semibold">{selectedItem?.itemNome}</span> da <span className="font-semibold">{selectedItem?.mesaNome}</span>?</p>
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