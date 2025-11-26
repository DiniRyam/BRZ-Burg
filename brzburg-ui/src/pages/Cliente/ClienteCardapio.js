import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clienteService } from '../../services/clienteService';
import HeaderBar from '../../components/ui/HeaderBar';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { ShoppingCart, Plus, Minus } from 'lucide-react';

export default function ClienteCardapio() {
  const { mesaId } = useParams(); // pega o ID da URL /m/:mesaId
  const navigate = useNavigate();

  const [cardapio, setCardapio] = useState([]);
  const [comandaAtiva, setComandaAtiva] = useState(null);
  const [loading, setLoading] = useState(true);

  // estado do modal do pedido
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [observacao, setObservacao] = useState('');
  const [adding, setAdding] = useState(false);

  // começa com uma busca de dados
  const initSession = useCallback(async () => {
    try {
      const data = await clienteService.iniciarSessao(mesaId);
      setCardapio(data.cardapio || []);
      setComandaAtiva(data.comanda);
    } catch (error) {
      console.error("Erro ao carregar cardápio:", error);
      alert("Erro ao acessar mesa. Verifique o QR Code.");
    } finally {
      setLoading(false);
    }
  }, [mesaId]);

  useEffect(() => {
    initSession();
  }, [initSession]);

  // abre o modal de adição
  const handleOpenAdd = (item) => {
    setSelectedItem(item);
    setQuantidade(1);
    setObservacao('');
    setIsModalOpen(true);
  };

  // confirma o pedido
  const handleConfirmPedido = async () => {
    if (!selectedItem) return;
    setAdding(true);
    try {
      const pedido = {
        mesaId: parseInt(mesaId),
        itemId: selectedItem.id,
        quantidade: quantidade,
        observacao: observacao
      };
      
      // envia para a api
      const comandaAtualizada = await clienteService.fazerPedido(pedido);
      
      // atualiza o estado local
      setComandaAtiva(comandaAtualizada);
      setIsModalOpen(false);
      alert(`${quantidade}x ${selectedItem.nome} adicionado!`);
      
    } catch (error) {
      console.error("Erro ao fazer pedido:", error);
      alert("Erro ao adicionar item. Tente novamente.");
    } finally {
      setAdding(false);
    }
  };

  // botao de carrinho que muda de cor
  const CartButton = (
    <Button 
      variant={comandaAtiva ? "primary" : "secondary"} // verde ativo e cinza inativo
      className="flex items-center gap-2 relative"
      onClick={() => navigate(`/cliente/mesa/${mesaId}/comanda`)}
    >
      <ShoppingCart size={20} />
      <span className="hidden sm:inline">Minha Comanda</span>

      {/* badge de status */}
      {comandaAtiva && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
      )}
    </Button>
  );

  // agrupa os itens do cardapio por secao
  const itensPorSecao = cardapio.reduce((acc, item) => {
    const secaoNome = item.secao?.nomeSecao || 'Outros';
    if (!acc[secaoNome]) acc[secaoNome] = [];
    acc[secaoNome].push(item);
    return acc;
  }, {});

  if (loading) return <div className="p-8 text-center">Carregando cardápio...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* header com o botao da comanda */}
      <HeaderBar title={`Mesa ${mesaId}`} rightAction={CartButton} />

      <main className="p-4 max-w-3xl mx-auto space-y-8">
        
        {/* cria a lista de secoes */}
        {Object.entries(itensPorSecao).map(([secaoNome, itens]) => (
          <div key={secaoNome}>
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-green-500 pl-3">
              {secaoNome}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {itens.map((item) => (
                <Card 
                  key={item.id}
                  imageUrl={item.imagemUrl ? `http://localhost:8080${item.imagemUrl}` : null}
                  title={item.nome}
                  description={
                    <div className="flex flex-col h-full justify-between">
                      <span className="text-sm text-gray-500 line-clamp-2 mb-2">{item.descricao}</span>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-lg font-bold text-green-600">
                          R$ {item.preco.toFixed(2).replace('.', ',')}
                        </span>
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          onClick={(e) => {
                             e.stopPropagation();
                             handleOpenAdd(item);
                          }}
                          className="h-8 w-8 p-0 rounded-full flex items-center justify-center bg-green-50 text-green-600 hover:bg-green-100"
                        >
                          <Plus size={18} />
                        </Button>
                      </div>
                    </div>
                  }

                  //clicar no card tambem abre o modal
                  onClick={() => handleOpenAdd(item)} 
                />
              ))}
            </div>
          </div>
        ))}
        
        {cardapio.length === 0 && (
          <p className="text-center text-gray-500 mt-10">Cardápio indisponível no momento.</p>
        )}
      </main>

      {/* modal de adicionar item */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedItem?.nome}
      >
        <div className="space-y-6">

          {/* descricao e preco */}
          <div className="bg-gray-50 p-3 rounded-md">
             <p className="text-sm text-gray-600">{selectedItem?.descricao}</p>
             <p className="text-lg font-bold text-green-600 mt-1">
                R$ {selectedItem?.preco.toFixed(2).replace('.', ',')}
             </p>
          </div>

          {/* seletor de quantidade */}
          <div className="flex items-center justify-between">
             <span className="font-medium text-gray-700">Quantidade</span>
             <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setQuantidade(q => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                >
                  <Minus size={16} />
                </button>
                <span className="text-xl font-bold w-6 text-center">{quantidade}</span>
                <button 
                  onClick={() => setQuantidade(q => q + 1)}
                  className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center hover:bg-green-200"
                >
                  <Plus size={16} />
                </button>
             </div>
          </div>

          {/* observação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Ex: Sem cebola, ponto da carne..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
              rows="2"
            />
            {quantidade > 1 && (
               <p className="text-xs text-amber-600 mt-1">
                 Para observações diferentes, adicione os itens separadamente.
               </p>
            )}
          </div>

          {/* botao de confirmar com calculo de valor */}
          <Button 
            variant="primary" 
            className="w-full py-3 text-lg"
            onClick={handleConfirmPedido}
            disabled={adding}
          >
            {adding ? 'Adicionando...' : `Adicionar • R$ ${(selectedItem?.preco * quantidade).toFixed(2).replace('.', ',')}`}
          </Button>
        </div>
      </Modal>
    </div>
  );
}