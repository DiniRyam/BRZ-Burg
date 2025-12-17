import api from './api';

const adminService = {

  // relatorios
  getKpis: async (inicio, fim) => {
    const params = {};
    if (inicio) params.inicio = inicio;
    if (fim) params.fim = fim;
    
    const response = await api.get('/api/admin/reports/kpis', { params });
    return response.data; 
  },

  getTopItems: async (inicio, fim) => {
    const params = {};
    if (inicio) params.inicio = inicio;
    if (fim) params.fim = fim;

    const response = await api.get('/api/admin/reports/top-items', { params });
    return response.data; 
  },

  getVendasGarcom: async (inicio, fim) => {
    const params = {};
    if (inicio) params.inicio = inicio;
    if (fim) params.fim = fim;

    const response = await api.get('/api/admin/reports/vendas-garcom', { params });
    return response.data; 
  },

   getPerdas: async (inicio, fim) => {
    const params = {};
    if (inicio) params.inicio = inicio;
    if (fim) params.fim = fim;

    const response = await api.get('/api/admin/reports/perdas', { params });
    return response.data; 
  },
  
  getVendasHora: async (inicio, fim) => {
    const params = {};
    if (inicio) params.inicio = inicio;
    if (fim) params.fim = fim;

    const response = await api.get('/api/admin/reports/vendas-hora', { params });
    return response.data; 
  },

  getVendasPagamento: async (inicio, fim) => {
    const params = {};
    if (inicio) params.inicio = inicio;
    if (fim) params.fim = fim;

    const response = await api.get('/api/admin/reports/vendas-pagamento', { params });
    return response.data; 
  },

  // mesas 
  getMesas: async () => {
    const response = await api.get('/api/admin/mesas');
    return response.data;
  },

  criarMesa: async (nome) => {
    const response = await api.post('/api/admin/mesas', { nome });
    return response.data;
  },

  deletarMesa: async (id) => {
    await api.delete(`/api/admin/mesas/${id}`);
  },

  // funcionarios
  getFuncionarios: async () => {
    const response = await api.get('/api/admin/funcionarios');
    return response.data;
  },

  getHistoricoFuncionarios: async () => {
    const response = await api.get('/api/admin/funcionarios/historico');
    return response.data;
  },

  criarFuncionario: async (funcionario) => {
    const response = await api.post('/api/admin/funcionarios', funcionario);
    return response.data;
  },

  atualizarFuncionario: async (id, funcionario) => {
    const response = await api.put(`/api/admin/funcionarios/${id}`, funcionario);
    return response.data;
  },

  arquivarFuncionario: async (id) => {
    await api.delete(`/api/admin/funcionarios/${id}`);
  },

  // cardapio
  getSecoes: async () => {
    const response = await api.get('/api/admin/cardapio/secoes');
    return response.data;
  },

  criarSecao: async (nomeSecao) => {
    const response = await api.post('/api/admin/cardapio/secoes', { nomeSecao });
    return response.data;
  },

  // Busca todos os itens ativos e inativos para edição
  getItensEditor: async () => {
    const response = await api.get('/api/admin/cardapio-editor');
    return response.data;
  },

  // Cria item com upload de imagem
  criarItem: async (formData) => {
    // nao definimos 'Content-Type' manualmente aqui, o axios/browser faz isso
    // automaticamente quando vê que é um objeto FormData
    const response = await api.post('/api/admin/cardapio/itens', formData);
    return response.data;
  },

  arquivarItem: async (itemId) => {
    await api.delete(`/api/admin/cardapio/itens/${itemId}`);
  },

  // estoque para controle de itens que acabaram em servico
  getItensDisponibilidade: async () => {
    const response = await api.get('/api/admin/itens-disponibilidade');
    return response.data;
  },

  setDisponibilidade: async (itemId, isDisponivel) => {
    const response = await api.put(`/api/admin/itens-disponibilidade/${itemId}`, { isDisponivel });
    return response.data;
  },

  // GET /api/admin/status-sistema
  getStatusSistema: async () => {
    const response = await api.get('/api/admin/status-sistema');
    return response.data; // Retorna { aberto: true/false }
  },

  // POST /api/admin/turno
  alternarTurno: async (abrir) => {
    // Envia { abrir: true } ou { abrir: false }
    const response = await api.post('/api/admin/turno', { abrir });
    return response.data;
  },

  // Novo método público para verificação constante (sem precisar de estar logado)
  getStatusPublico: async () => {
    // Nota: Criámos este endpoint no AuthController como público
    const response = await api.get('/api/auth/status-publico'); 
    return response.data;
  }
};


export { adminService };