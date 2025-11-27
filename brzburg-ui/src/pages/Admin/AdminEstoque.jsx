import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import Card from '../../components/ui/Card'; 

export default function AdminEstoque() {
  const [itens, setItens] = useState([]);
  const [loadingId, setLoadingId] = useState(null); // mostra loading no item específico

  // Busca apenas os itens ativos
  const fetchItens = useCallback(async () => {
    try {
      const data = await adminService.getItensDisponibilidade();
      setItens(data);
    } catch (error) {
      console.error("Erro ao buscar estoque:", error);
    }
  }, []);

  useEffect(() => {
    fetchItens();
  }, [fetchItens]);

  // altera a disponibilidade
  const handleToggleDisponivel = async (item) => {
    setLoadingId(item.id);
    try {

      // envia o contrario do item atual 
      await adminService.setDisponibilidade(item.id, !item.disponivel);
      
      // atualiza a lista localmente
      setItens(itens.map(i => 
        i.id === item.id ? { ...i, disponivel: !i.disponivel } : i
      ));
    } catch (error) {
      console.error("Erro ao atualizar estoque.", error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Controle de Estoque</h1>
            <p className="text-sm text-gray-500">Gerencie a disponibilidade dos itens para hoje.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {itens.map((item) => (
          <Card 
            key={item.id} 
            className={`flex flex-row items-center p-4 justify-between transition-colors ${
                !item.disponivel ? 'bg-red-50 border-red-200' : ''
            }`}
          >
            <div className="flex items-center space-x-3 overflow-hidden">
                {/* miniatura */}
                <div className={`w-10 h-10 rounded-full flex-shrink-0 ${item.disponivel ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center`}>
                    <span className="text-lg">{item.disponivel ? 'disponivel' : 'indisponivel'}</span>
                </div>
                <div className="min-w-0">
                    <h3 className={`font-bold truncate ${!item.disponivel ? 'text-red-900' : 'text-gray-900'}`}>
                        {item.nome}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                        {item.disponivel ? 'Disponível' : 'Esgotado'}
                    </p>
                </div>
            </div>

            {/* switch */}
            <button
                onClick={() => handleToggleDisponivel(item)}
                disabled={loadingId === item.id}
                className={`
                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                    ${item.disponivel ? 'bg-green-500' : 'bg-gray-300'}
                `}
            >
                <span
                    aria-hidden="true"
                    className={`
                        pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                        ${item.disponivel ? 'translate-x-5' : 'translate-x-0'}
                    `}
                />
            </button>
          </Card>
        ))}
        
        {itens.length === 0 && (
           <p className="col-span-full text-center text-gray-500 py-10">Nenhum item no cardápio.</p>
        )}
      </div>
    </div>
  );
}