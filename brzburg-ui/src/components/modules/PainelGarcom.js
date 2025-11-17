'use client'

import React, { useState, useEffect } from 'react';
import { garcomService } from '../../services/garcomService'; 
import Card from '../ui/Card'; 
import { Utensils, BellRing } from 'lucide-react'; 

export default function PainelGarcom({ onMesaClick }) {
  const [alertas, setAlertas] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [abaAtual, setAbaAtual] = useState('ALERTAS'); 
  

  // efeito para o polling
  useEffect(() => {
    
    // aqui define o fetchdashboasrd dentro do useeffect
    const fetchDashboard = async () => {
      try {
        const data = await garcomService.getDashboard(); 
        setAlertas(data.alertas);
        setMesas(data.mesas);
      } catch (error) {
        console.error("Erro ao buscar dados do Garçom:", error);
      }
    };

    fetchDashboard(); 
    
    // configuracao do polling de 10 segundos 
    const intervalId = setInterval(fetchDashboard, 10000); 

    // limpa o intervalo quando o componente for desmontado
    return () => clearInterval(intervalId);
  }, []); 

  const renderIconeAlerta = (tipo) => {
    if (tipo === 'PEDIDO_PRONTO') {
      return <Utensils className="h-5 w-5 text-blue-500 mr-3" />;
    }
    if (tipo === 'CONTA_SOLICITADA') {
      return <BellRing className="h-5 w-5 text-yellow-600 mr-3" />;
    }
    return null;
  };

  const getEstiloMesa = (status) => {
    if (status === 'LIVRE') {
      return 'bg-green-100 border-green-500';
    }
    if (status === 'OCUPADA') {
      return 'bg-yellow-100 border-yellow-500';
    }
    return 'bg-white border-gray-200';
  };

  return (
    <div className="w-full h-full p-4 bg-gray-50">
      
      {/* abas de navegacao*/}
      <div className="mb-4 border-b border-gray-200">
        <nav className="flex space-x-4">
          <button
            className={`py-2 px-4 font-semibold ${abaAtual === 'ALERTAS' ? 'border-b-2 border-blue-500 text-gray-900' : 'text-gray-500'}`}
            onClick={() => setAbaAtual('ALERTAS')}
          >
            Alertas ({alertas.length})
          </button>
          <button
            className={`py-2 px-4 font-semibold ${abaAtual === 'MESAS' ? 'border-b-2 border-blue-500 text-gray-900' : 'text-gray-500'}`}
            onClick={() => setAbaAtual('MESAS')}
          >
            Todas as Mesas ({mesas.length})
          </button>
        </nav>
      </div>

      {/* abas de alerta */}
      {abaAtual === 'ALERTAS' && (
        <div className="space-y-3">
          {alertas.length === 0 ? (
            <p className="text-gray-500">Nenhum alerta no momento.</p>
          ) : (
            alertas.map((alerta) => (
              <Card
                key={`${alerta.tipo}-${alerta.mesaId}`}
                onClick={() => onMesaClick && onMesaClick(alerta.mesaId)}
                className="flex items-center"
              >
                <div className="flex items-center">
                  {renderIconeAlerta(alerta.tipo)}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Mesa {alerta.mesaNome}</h3>
                    <p className="text-sm text-gray-500">{alerta.mensagem}</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* conteudo das abas */}
      {abaAtual === 'MESAS' && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {mesas.map((mesa) => (
            <Card
              key={mesa.mesaId}
              title={mesa.nome}
              description={mesa.status}
              onClick={() => onMesaClick && onMesaClick(mesa.mesaId)}
              className={`text-center ${getEstiloMesa(mesa.status)}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}