import React, { useState } from 'react';
import HeaderBar from '../../components/ui/HeaderBar'; 
import PainelGarcom from '../../components/modules/PainelGarcom'; 
// import { useNavigate } from 'react-router-dom'; 

export default function GarcomDashboard() {

  // const navigate = useNavigate();
  
  // Inicialização "Lazy" do utilizador
  const [user] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Erro ao ler dados do utilizador:", error);
      return null;
    }
  });

  // O que acontece quando o garçom clica num card de mesa ou alerta
  const handleMesaClick = (mesaId) => {
    // Futuramente, aqui iremos navegar para a tela de detalhes
    // navigate(`/garcom/mesa/${mesaId}`);
    console.log(`Navegar para mesa ${mesaId}`);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <HeaderBar 
        user={user} 
        title="Painel do Garçom" 
      />

      <main className="flex-1 overflow-hidden p-4 relative">
        <div className="h-full w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Passamos a função de clique para o módulo */}
            <PainelGarcom onMesaClick={handleMesaClick} />
        </div>
      </main>
    </div>
  );
}