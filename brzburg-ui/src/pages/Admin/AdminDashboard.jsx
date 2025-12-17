import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { adminService } from '../../services/adminService';

import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Power,
  Lock,
  Unlock
} from 'lucide-react';

export default function AdminDashboard() {
  // KPIs gerais
  const [kpis, setKpis] = useState({
    receitaTotal: 0,
    comandasFechadas: 0,
    ticketMedio: 0
  });

  // Tabelas
  const [topItems, setTopItems] = useState([]);
  const [vendasGarcom, setVendasGarcom] = useState([]);
  const [perdas, setPerdas] = useState({
    cancelados: { total: 0, valor: 0 },
    devolvidos: { total: 0, valor: 0 }
  });

  // Filtro antigo (hoje, semana, mês)
  const [filtro, setFiltro] = useState('hoje');

  // STATUS DO SISTEMA (NOVO)
  const [sistemaAberto, setSistemaAberto] = useState(true);
  const [loadingTurno, setLoadingTurno] = useState(false);

  // Carrega tudo quando filtro muda
  useEffect(() => {
    fetchData();
  }, [filtro]);

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

  const fetchData = async () => {
    try {
      const { inicio, fim } = getDatasFiltro();

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

      // NOVO — buscar status do turno
      const statusData = await adminService.getStatusSistema();
      setSistemaAberto(statusData.aberto);

    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    }
  };

  // === NOVA FUNÇÃO: ABRIR / FECHAR TURNO ===
  const handleAlternarTurno = async () => {
    const acao = sistemaAberto ? "FECHAR" : "ABRIR";

    const confirmacao = window.confirm(
      sistemaAberto
        ? "ATENÇÃO: Ao fechar o turno, todos os pedidos pendentes serão cancelados. Continuar?"
        : "Deseja abrir o restaurante para novos pedidos?"
    );

    if (!confirmacao) return;

    setLoadingTurno(true);
    try {
      await adminService.alternarTurno(!sistemaAberto);
      setSistemaAberto(!sistemaAberto);
      alert(`Restaurante ${acao === "ABRIR" ? "ABERTO" : "FECHADO"} com sucesso!`);
    } catch (err) {
      console.error(err);
      alert("Erro ao alterar turno.");
    } finally {
      setLoadingTurno(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Cabeçalho + Botão de Turno */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Administrativo</h1>

        <Button
          variant={sistemaAberto ? "danger" : "success"}
          onClick={handleAlternarTurno}
          disabled={loadingTurno}
          className="flex items-center gap-2 shadow-lg"
        >
          {sistemaAberto ? <Lock size={18} /> : <Unlock size={18} />}
          {sistemaAberto ? "Fechar Turno" : "Abrir Restaurante"}
        </Button>
      </div>

      {/* Aviso se o sistema estiver fechado */}
      {!sistemaAberto && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm">
          <div className="flex items-center">
            <Power className="mr-2" />
            <p className="font-bold">O SISTEMA ESTÁ FECHADO</p>
          </div>
          <p className="text-sm">
            Funcionários não podem fazer login enquanto o sistema estiver fechado.
          </p>
        </div>
      )}

      {/* FILTROS (semana/mes/hoje — código antigo) */}
      <div className="flex space-x-2 bg-white p-1 rounded-lg border border-gray-200 w-fit">
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

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Receita Total</p>
            <p className="text-2xl font-bold text-gray-900">
              R$ {kpis.receitaTotal?.toFixed(2).replace('.', ',')}
            </p>
          </div>
        </Card>

        <Card className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Pedidos Fechados</p>
            <p className="text-2xl font-bold text-gray-900">
              {kpis.comandasFechadas || 0}
            </p>
          </div>
        </Card>

        <Card className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Ticket Médio</p>
            <p className="text-2xl font-bold text-gray-900">
              R$ {kpis.ticketMedio?.toFixed(2).replace('.', ',')}
            </p>
          </div>
        </Card>
      </div>

      {/* Tabelas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top itens */}
        <Card title="Top 5 Itens Mais Vendidos">
          <div className="overflow-x-auto">
            <table className="w-full text-sm mt-2">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-2">Item</th>
                  <th className="px-4 py-2 text-right">Qtd</th>
                </tr>
              </thead>
              <tbody>
                {topItems.length > 0 ? (
                  topItems.map((item, i) => (
                    <tr key={i} className="border-b">
                      <td className="px-4 py-3">{item.nome}</td>
                      <td className="px-4 py-3 text-right">{item.vendidos}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="px-4 py-4 text-center text-gray-500">
                      Sem dados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Perdas + Garçons */}
        <div className="space-y-6">

          {/* Card de perdas */}
          <Card className="bg-red-50 border-red-100">
            <div className="flex items-start space-x-3 p-2">
              <AlertTriangle className="text-red-500" size={20} />
              <div>
                <h3 className="font-bold text-red-900">Perdas e Cancelamentos</h3>
                <div className="mt-2 text-sm text-red-800 space-y-1">
                  <div className="flex justify-between w-64">
                    <span>Cancelados:</span>
                    <span className="font-bold">
                      {perdas.cancelados.total} (R$ {perdas.cancelados.valor.toFixed(2)})
                    </span>
                  </div>
                  <div className="flex justify-between w-64">
                    <span>Devolvidos:</span>
                    <span className="font-bold">
                      {perdas.devolvidos.total} (R$ {perdas.devolvidos.valor.toFixed(2)})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Garçons */}
          <Card title="Desempenho da Equipe">
            <div className="overflow-x-auto">
              <table className="w-full text-sm mt-2">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-2">Garçom</th>
                    <th className="px-4 py-2 text-right">Vendas (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {vendasGarcom.length > 0 ? (
                    vendasGarcom.map((v, i) => (
                      <tr key={i} className="border-b">
                        <td className="px-4 py-3">{v.nomeGarcom}</td>
                        <td className="px-4 py-3 text-right">
                          R$ {v.receitaGerada.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="px-4 py-4 text-center text-gray-500">
                        Sem dados
                      </td>
                    </tr>
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
