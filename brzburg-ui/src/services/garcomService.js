import api from './api';

const garcomService = {
  // GET /api/garcom/dashboard
  getDashboard: async () => {
    const response = await api.get('/api/garcom/dashboard');
    return response.data;
  },

  // GET /api/garcom/comanda/{mesaId}
  getComanda: async (mesaId) => {
    const response = await api.get(`/api/garcom/comanda/${mesaId}`);
    return response.data;
  },

  // POST /api/garcom/pedido/devolver
  devolverItem: async (itemPedidoId) => {
    await api.post('/api/garcom/pedido/devolver', { 
      itemPedidoId, 
      quantidadeDevolver: 1 
    });
  },
  
  // --- NOVO MÉTODO: Fechar Conta ---
  // POST /api/garcom/comanda/fechar
  fecharConta: async (mesaId, metodoPagamento) => {
    const response = await api.post('/api/garcom/comanda/fechar', {
      mesaId,
      metodoPagamento
    });
    return response.data;
  }
};

export { garcomService };