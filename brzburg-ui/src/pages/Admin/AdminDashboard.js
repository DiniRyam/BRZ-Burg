import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import Card from '../../components/ui/Card'; 
import { DollarSign, ShoppingBag, TrendingUp, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
  const [kpis, setKpis] = useState({ receitaTotal: 0, comandasFechadas: 0, ticketMedio: 0 });
  const [topItems, setTopItems] = useState([]);
  const [vendasGarcom, setVendasGarcom] = useState([]);
  const [perdas, setPerdas] = useState({ cancelados: { total: 0, valor: 0 }, devolvidos: { total: 0, valor: 0 } });
  
  // Estado do filtro de data ('hoje', 'semana', 'mes')
  const [filtro, setFiltro] = useState('hoje');

  // Toda a lógica de busca vive DENTRO do useEffect ---
  useEffect(() => {
    
    // Definimos a função de cálculo de datas aqui dentro (ou fora se for pura)
    const getDatasFiltro = () => {
      const fim = new Date();
      const inicio = new Date();
      
      if (filtro === 'hoje') {
        inicio.setHours(0, 0, 0, 0); 
      } else if (filtro === 'semana') {
        inicio.setDate(inicio.getDate() - 7); 
      } else if (filtro === 'mes') {
        inicio.setMonth(inicio.getMonth() - 1); 
      }
      
      return { 
        inicio: inicio.toISOString().split('.')[0], 
        fim: fim.toISOString().split('.')[0] 
      };
    };

    // Definimos a função de busca aqui dentro
    const fetchData = async () => {
      try {
        const { inicio, fim } = getDatasFiltro();

        // Faz todas as requisições em paralelo
        const [dataKpis, dataTopItems, dataGarcom, dataPerdas] = await Promise.all([
          adminService.getKpis(inicio, fim),
          adminService.getTopItems(inicio, fim),
          adminService.getVendasGarcom(inicio, fim),
          adminService.getPerdas(inicio, fim)
        ]);

        setKpis(dataKpis);
        setTopItems(dataTopItems);
        setVendasGarcom(dataGarcom);
        setPerdas(dataPerdas);

      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      }
    };

    //Chamamos a função
    fetchData();

  // A única dependência real é o 'filtro'. 
  // Sempre que o filtro mudar, este efeito roda de novo.
  }, [filtro]);

  return (
    <div className="space-y-6">
      {/* Cabeçalho e Filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex space-x-2 bg-white p-1 rounded-lg border border-gray-200">
          {['hoje', 'semana', 'mes'].map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filtro === f 
                  ? 'bg-green-100 text-green-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Receita Total</p>
            <p className="text-2xl font-bold text-gray-900">
              R$ {kpis.receitaTotal?.toFixed(2).replace('.', ',') || '0,00'}
            </p>
          </div>
        </Card>

        <Card className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Pedidos Fechados</p>
            <p className="text-2xl font-bold text-gray-900">{kpis.comandasFechadas || 0}</p>
          </div>
        </Card>

        <Card className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Ticket Médio</p>
            <p className="text-2xl font-bold text-gray-900">
              R$ {kpis.ticketMedio?.toFixed(2).replace('.', ',') || '0,00'}
            </p>
          </div>
        </Card>
      </div>

      {/* Tabelas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Coluna Esquerda: Top Itens */}
        <Card title="Top 5 Itens Mais Vendidos">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left mt-2">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-2">Item</th>
                  <th className="px-4 py-2 text-right">Qtd.</th>
                </tr>
              </thead>
              <tbody>
                {topItems.map((item, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium text-gray-900">{item.nome}</td>
                    <td className="px-4 py-3 text-right">{item.vendidos}</td>
                  </tr>
                ))}
                {topItems.length === 0 && (
                  <tr><td colSpan="2" className="px-4 py-4 text-center text-gray-500">Sem dados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Coluna Direita: Perdas e Garçons */}
        <div className="space-y-6">
          {/* Alerta de Perdas */}
          <Card className="bg-red-50 border-red-100">
            <div className="flex items-start space-x-3 p-2">
              <AlertTriangle className="text-red-500 mt-1" size={20} />
              <div>
                <h3 className="font-bold text-red-900">Perdas e Cancelamentos</h3>
                <div className="mt-2 text-sm text-red-800 space-y-1">
                  <div className="flex justify-between w-64">
                    <span>Cancelados:</span>
                    <span className="font-bold">{perdas.cancelados.total} (R$ {perdas.cancelados.valor.toFixed(2)})</span>
                  </div>
                  <div className="flex justify-between w-64">
                    <span>Devolvidos:</span>
                    <span className="font-bold">{perdas.devolvidos.total} (R$ {perdas.devolvidos.valor.toFixed(2)})</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Vendas por Garçom */}
          <Card title="Desempenho da Equipe">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left mt-2">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-2">Garçom</th>
                    <th className="px-4 py-2 text-right">Vendas (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {vendasGarcom.map((venda, index) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium text-gray-900">{venda.nomeGarcom}</td>
                      <td className="px-4 py-3 text-right">R$ {venda.receitaGerada.toFixed(2)}</td>
                    </tr>
                  ))}
                  {vendasGarcom.length === 0 && (
                    <tr><td colSpan="2" className="px-4 py-4 text-center text-gray-500">Sem dados</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}