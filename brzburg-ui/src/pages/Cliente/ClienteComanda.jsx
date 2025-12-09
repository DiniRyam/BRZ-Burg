import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HeaderBar from '../../components/ui/HeaderBar';
import ComandaView from '../../components/modules/ComandaView'; 
import { Button } from '../../components/ui/Button'; 
import { ArrowLeft } from 'lucide-react';
import { clienteService } from '../../services/clienteService';

export default function ClienteComanda() {
  const { mesaId } = useParams();
  const navigate = useNavigate();
  
  // Inicializa com o ID, mas vai ser atualizado
  const [mesaNome, setMesaNome] = useState(`Mesa ${mesaId}`);

  useEffect(() => {
    const fetchMesaInfo = async () => {
      try {
        // A função iniciarSessao retorna { mesaNome: "Mesa 01", ... }
        const data = await clienteService.iniciarSessao(mesaId);
        if (data.mesaNome) {
          setMesaNome(data.mesaNome); // <-- CORREÇÃO AQUI
        }
      } catch (error) {
        console.error("Erro ao buscar info da mesa:", error);
      }
    };
    fetchMesaInfo();
  }, [mesaId]);

  const BackButton = (
    <Button 
      variant="secondary" 
      className="flex items-center gap-2 text-sm"
      onClick={() => navigate(`/m/${mesaId}`)}
    >
      <ArrowLeft size={18} />
      Voltar
    </Button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HeaderBar 
        title={`Comanda - ${mesaNome}`} 
        rightAction={BackButton} 
      />

      <main className="flex-1">
        <ComandaView 
            role="cliente" 
            mesaId={parseInt(mesaId)} 
        />
      </main>
    </div>
  );
}