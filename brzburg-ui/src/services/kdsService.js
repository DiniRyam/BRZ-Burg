import api from './api'; // o conector do axios

// implementa o get /api/kds/dashboard
const getDashboard = async () => {
  try {
    const response = await api.get('/api/kds/dashboard');

    // o .data é o json que vem de resposta do back, tipo { pendentes: e por ai vai}
    return response.data; 
  } catch (error) {
    console.error("Erro ao buscar dashboard do KDS:", error);
    throw error;
  }
};

// implementa o post /api/kds/pedido/atualizar-status
const atualizarStatus = async (itemPedidoId) => {
  try {

    // manda o json { "itemPedidoId": ... }
    const response = await api.post('/api/kds/pedido/atualizar-status', { itemPedidoId });
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar status do item ${itemPedidoId}:`, error);
    throw error;
  }
};

// manda os funcoes para o PainelKds usar
export const kdsService = {
  getDashboard,
  atualizarStatus,
};