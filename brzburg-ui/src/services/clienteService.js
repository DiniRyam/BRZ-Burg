import api from './api';

const clienteService = {

  // Inicia a sessão do cliente
  iniciarSessao: async (mesaId) => {
    try {
      
      // GET /api/cliente/iniciar-sessao?mesaId=...
      const response = await api.get(`/api/cliente/iniciar-sessao?mesaId=${mesaId}`);
      return response.data; // { nomeRestaurante, cardapio, comanda }
    } catch (error) {
      console.error("Erro ao iniciar sessão do cliente:", error);
      throw error;
    }
  },

  // envia um novo pedido
  fazerPedido: async (pedido) => {
    try {

      // pedido = { mesaId, itemId, quantidade, observacao }
      const response = await api.post('/api/cliente/pedido', pedido);
      return response.data;
    } catch (error) {
      console.error("Erro ao fazer pedido:", error);
      throw error;
    }
  },

  // Busca a comanda ativa (Polling)
  getComanda: async (mesaId) => {
    try {
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
      await api.post('/api/cliente/pedir-conta', { mesaId });
    } catch (error) {
      console.error("Erro ao pedir conta:", error);
      throw error;
    }
  }
};

export { clienteService };
