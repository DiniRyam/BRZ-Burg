import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HeaderBar from '../../components/ui/HeaderBar';
import ComandaView from '../../components/modules/ComandaView'; //
import { Button } from '../../components/ui/Button'; 
import { ArrowLeft } from 'lucide-react';

export default function ClienteComanda() {
  const { mesaId } = useParams();
  const navigate = useNavigate();

  // botao para voltar pro cardapio
  const BackButton = (
    <Button 
      variant="secondary" 
      className="flex items-center gap-2 text-sm"
      onClick={() => navigate(`/m/${mesaId}`)}
    >
      <ArrowLeft size={18} />
      Voltar ao Cardápio
    </Button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* header com botao de voltar e sem user pois é cliente */}
      <HeaderBar 
        title={`Comanda - Mesa ${mesaId}`} 
        rightAction={BackButton} 
      />

      {/* conteudo principal com comanda viewer */}
      <main className="flex-1">
        <ComandaView 
            role="cliente" 
            mesaId={parseInt(mesaId)} 
        />
      </main>
    </div>
  );
}