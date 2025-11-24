import api from './api';

const clienteService = {
  // Busca a comanda ativa (Polling)
  getComanda: async (mesaId) => {
    try {
      // GET /api/cliente/comanda?mesaId=9
      const response = await api.get(`/api/cliente/comanda?mesaId=${mesaId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar comanda do cliente:", error);
      throw error;
    }
  },

  // Cancela um pedido
  cancelarPedido: async (itemPedidoId) => {
    try {
      // POST /api/cliente/pedido/cancelar
      // Enviamos quantidadeCancelar: 1 (por simplicidade, ou poderíamos pedir ao user)
      await api.post('/api/cliente/pedido/cancelar', { 
        itemPedidoId, 
        quantidadeCancelar: 1 
      });
    } catch (error) {
      console.error("Erro ao cancelar pedido:", error);
      throw error;
    }
  },

  // Pede a conta
  pedirConta: async (mesaId) => {
    try {
      // POST /api/cliente/pedir-conta
      await api.post('/api/cliente/pedir-conta', { mesaId });
    } catch (error) {
      console.error("Erro ao pedir conta:", error);
      throw error;
    }
  }
};

export { clienteService };