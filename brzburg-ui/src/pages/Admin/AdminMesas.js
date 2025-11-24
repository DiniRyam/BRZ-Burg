import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import Card from '../../components/ui/Card'; 
import Modal from '../../components/ui/Modal'; 
import { Button } from '../../components/ui/Button'; 
import { Plus, Trash2 } from 'lucide-react';

export default function AdminMesas() {
  const [mesas, setMesas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novaMesaNome, setNovaMesaNome] = useState('');
  const [loading, setLoading] = useState(false);

  // Função para buscar mesas
  const fetchMesas = useCallback(async () => {
    try {
      const data = await adminService.getMesas();
      setMesas(data);
    } catch (error) {
      console.error("Erro ao buscar mesas:", error);
    }
  }, []);

  useEffect(() => {
    fetchMesas();
  }, [fetchMesas]);

  // Função para criar mesa
  const handleCriarMesa = async (e) => {
    e.preventDefault();
    if (!novaMesaNome.trim()) return;

    setLoading(true);
    try {
      await adminService.criarMesa(novaMesaNome);
      setNovaMesaNome('');
      setIsModalOpen(false);
      await fetchMesas(); // Atualiza a lista
    } catch (error) {
      console.error("Erro ao criar mesa. Tente novamente.", error);
    } finally {
      setLoading(false);
    }
  };

  // Função para deletar mesa
  const handleDeletarMesa = async (id, nome, status) => {
    // Regra de segurança do front-end (além da do back-end)
    if (status === 'OCUPADA') {
      alert(`A ${nome} está OCUPADA e não pode ser excluída.`);
      return;
    }

    if (confirm(`Tem certeza que deseja excluir a ${nome}?`)) {
      try {
        await adminService.deletarMesa(id);
        await fetchMesas();
      } catch (error) {
        // O backend retorna 409 se estiver ocupada, capturamos aqui
        if (error.response && error.response.status === 409) {
            alert("Erro: A mesa está ocupada e não pode ser excluída.");
        } else {
            alert("Erro ao excluir mesa.");
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Mesas</h1>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} className="mr-2" />
          Nova Mesa
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {mesas.map((mesa) => (
          <Card 
            key={mesa.id} 
            className="relative group"
          >
            <div className="p-4 text-center">
              <h3 className="text-lg font-bold text-gray-900">{mesa.nome}</h3>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                mesa.status === 'LIVRE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {mesa.status}
              </span>
              
              {/* Botão de Excluir que so aparece no hover ou se estiver livre */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // evita espaamr cliques sem querer 
                  handleDeletarMesa(mesa.id, mesa.nome, mesa.status);
                }}
                className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Excluir Mesa"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </Card>
        ))}
        
        {mesas.length === 0 && (
           <p className="col-span-full text-center text-gray-500 py-10">Nenhuma mesa cadastrada.</p>
        )}
      </div>

      {/* modal para criação */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Cadastrar Nova Mesa"
      >
        <form onSubmit={handleCriarMesa} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Mesa</label>
            <input
              type="text"
              value={novaMesaNome}
              onChange={(e) => setNovaMesaNome(e.target.value)}
              placeholder="Ex: Mesa 10"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              autoFocus
              required
            />
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}