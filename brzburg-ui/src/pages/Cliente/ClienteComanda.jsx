import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HeaderBar from '../../components/ui/HeaderBar';
import ComandaView from '../../components/modules/ComandaView';
import { Button } from '../../components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { clienteService } from '../../services/clienteService'; // Import novo

export default function ClienteComanda() {
  const { mesaId } = useParams();
  const navigate = useNavigate();

  // Nome da mesa (agora dinâmico)
  const [mesaNome, setMesaNome] = useState(`Mesa ${mesaId}`);

  // Buscar nome REAL da mesa ao abrir o componente
  useEffect(() => {
    const fetchMesaInfo = async () => {
      try {
        // A mesma rota já retorna mesaNome
        const data = await clienteService.iniciarSessao(mesaId);
        if (data.mesaNome) {
          setMesaNome(data.mesaNome);
        }
      } catch (error) {
        console.error("Erro ao buscar info da mesa:", error);
      }
    };

    fetchMesaInfo();
  }, [mesaId]);

  // Botão de voltar
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
      {/* Header com mesa dinâmica */}
      <HeaderBar 
        title={`Comanda - ${mesaNome}`} 
        rightAction={BackButton} 
      />

      {/* Conteúdo principal */}
      <main className="flex-1">
        <ComandaView 
          role="cliente"
          mesaId={parseInt(mesaId)}
        />
      </main>
    </div>
  );
}
