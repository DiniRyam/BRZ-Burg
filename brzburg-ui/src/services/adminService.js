import api from './api';

const adminService = {
  // --- DASHBOARD (Relatórios) ---

  // GET /api/admin/reports/kpis?inicio=...&fim=...
  getKpis: async (inicio, fim) => {
    const params = {};
    if (inicio) params.inicio = inicio;
    if (fim) params.fim = fim;
    
    const response = await api.get('/api/admin/reports/kpis', { params });
    return response.data; // { receitaTotal, comandasFechadas, ticketMedio }
  },

  // GET /api/admin/reports/top-items
  getTopItems: async (inicio, fim) => {
    const params = {};
    if (inicio) params.inicio = inicio;
    if (fim) params.fim = fim;

    const response = await api.get('/api/admin/reports/top-items', { params });
    return response.data; // [ { nome, vendidos }, ... ]
  },

  // GET /api/admin/reports/vendas-garcom
  getVendasGarcom: async (inicio, fim) => {
    const params = {};
    if (inicio) params.inicio = inicio;
    if (fim) params.fim = fim;

    const response = await api.get('/api/admin/reports/vendas-garcom', { params });
    return response.data; // [ { nomeGarcom, receitaGerada }, ... ]
  },

   // GET /api/admin/reports/perdas
   getPerdas: async (inicio, fim) => {
    const params = {};
    if (inicio) params.inicio = inicio;
    if (fim) params.fim = fim;

    const response = await api.get('/api/admin/reports/perdas', { params });
    return response.data; // { cancelados: {...}, devolvidos: {...} }
  },

  // (Aqui adicionaremos as funções de CRUD de Mesas, Cardápio, etc. depois)
};

export { adminService };