import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HeaderBar from '../../components/ui/HeaderBar';
import ComandaView from '../../components/modules/ComandaView';
import { Button } from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { ArrowLeft } from 'lucide-react';
import { garcomService } from '../../services/garcomService'; 

export default function GarcomMesa() {
  const { mesaId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // estado para armazenar o nome real da mesa
  const [mesaNome, setMesaNome] = useState(`Mesa ${mesaId}`);

  const [isPagamentoOpen, setIsPagamentoOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        // busca a comanda e lê o nome da mesa
        const data = await garcomService.getComanda(mesaId);
        if (data && data.mesa) {
          setMesaNome(data.mesa.nome); // aplica o nome correto
        }
      } catch (error) {
        console.error("Erro ao buscar info da mesa", error);
      }
    };

    fetchInfo();

    // Carrega usuário 
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));

  }, [mesaId]);

  const handleFecharConta = async (metodo) => {
    if (!confirm(`Confirmar fechamento da Mesa ${mesaId} com ${metodo}?`)) return;
    
    setLoading(true);
    try {
      await garcomService.fecharConta(parseInt(mesaId), metodo);
      alert("Conta fechada com sucesso!");
      navigate('/garcom'); 
    } catch (error) {
      console.error("Erro ao fechar conta:", error);
      alert("Erro ao fechar conta.");
    } finally {
      setLoading(false);
      setIsPagamentoOpen(false);
    }
  };

  const BackButton = (
    <Button 
      variant="secondary" 
      className="flex items-center gap-2 text-sm"
      onClick={() => navigate('/garcom')}
    >
      <ArrowLeft size={18} />
      Voltar
    </Button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/*usa mesaNome no HeaderBar */}
      <HeaderBar user={user} title={mesaNome} rightAction={BackButton} />

      <div className="flex-1 relative">
        <ComandaView role="garcom" mesaId={parseInt(mesaId)} />
        
        <div className="fixed bottom-24 right-4 left-4 md:left-auto md:w-64">
          <Button 
            variant="primary" 
            className="w-full py-3 shadow-lg text-lg"
            onClick={() => setIsPagamentoOpen(true)}
          >
            Fechar Conta
          </Button>
        </div>
      </div>

      <Modal 
        isOpen={isPagamentoOpen} 
        onClose={() => setIsPagamentoOpen(false)} 
        title="Fechar Conta - Pagamento"
      >
        <p className="mb-4 text-gray-600">Selecione a forma de pagamento:</p>
        <div className="space-y-3">
          <Button 
            variant="secondary" 
            className="w-full justify-start" 
            onClick={() => handleFecharConta('PIX')}
            disabled={loading}
          >
            PIX
          </Button>
          <Button 
            variant="secondary" 
            className="w-full justify-start" 
            onClick={() => handleFecharConta('Cartão')}
            disabled={loading}
          >
            Cartão (Débito/Crédito)
          </Button>
          <Button 
            variant="secondary" 
            className="w-full justify-start" 
            onClick={() => handleFecharConta('Dinheiro')}
            disabled={loading}
          >
            Dinheiro
          </Button>
        </div>
      </Modal>
    </div>
  );
}
