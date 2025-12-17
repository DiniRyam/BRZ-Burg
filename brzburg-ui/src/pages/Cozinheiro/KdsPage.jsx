import React, { useState } from 'react'; 
import HeaderBar from '../../components/ui/HeaderBar'; 
import PainelKDS from '../../components/modules/PainelKDS'; 
import { useTurnoMonitor } from '../../hooks/useTurnoMonitor'; // Importe

export default function KdsPage() {
  useTurnoMonitor();
  
  // Passamos uma função para o useState. O React executa esta função 
  // APENAS na primeira renderização para definir o valor inicial.
  // Isto evita o erro de "cascading update" e é mais rápido.
  const [user] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Erro ao ler utilizador:", error);
      return null;
    }
  });

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Barra Superior */}
      <HeaderBar 
        user={user} 
        title="Kitchen Display System" 
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-hidden p-4 relative">
        {/* Renderizamos o PainelKDS.
            readOnly={false} porque o cozinheiro PODE interagir clidando e avançando os cards.
         */}
        <div className="h-full w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <PainelKDS readOnly={false} />
        </div>
      </main>
    </div>
  );
}