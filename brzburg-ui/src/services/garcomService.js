import api from './api';

const getDashboard = async () => {
  try {
    const response = await api.get('/api/garcom/dashboard');
    return response.data; // { alertas: ..., mesas: ... }
  } catch (error) {
    console.error("Erro ao buscar dashboard do garçom:", error);
    throw error;
  }
};

/**
 * Busca a comanda detalhada de uma mesa
 * GET /api/garcom/comanda/{mesaId}
 */
const getComanda = async (mesaId) => {
  try {
    const response = await api.get(`/api/garcom/comanda/${mesaId}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar comanda da mesa ${mesaId}:`, error);
    throw error;
  }
};

/**
 * Devolve 1 unidade de um item de pedido
 * POST /api/garcom/pedido/devolver
 */
const devolverItem = async (itemPedidoId) => {
  try {
    await api.post('/api/garcom/pedido/devolver', {
      itemPedidoId,
      quantidadeDevolver: 1,
    });
  } catch (error) {
    console.error(`Erro ao devolver item ${itemPedidoId}:`, error);
    throw error;
  }
};

// 🔥 Arquivo final exportado
export const garcomService = {
  getDashboard,
  getComanda,
  devolverItem,
  // fecharConta será implementado depois
};