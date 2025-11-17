import api from './api'; // O nosso conector Axios central

/*implementa o get /api/garcom/dashboard */
const getDashboard = async () => {
  try {
    const response = await api.get('/api/garcom/dashboard');

    // retorna o json { alertas: blabla, mesas: blabla}
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar dashboard do garçom:", error);
    throw error;
  }
};

/** implementa o get /api/garcom/comanda/{mesaId} */
const getComandaDetalhada = async (mesaId) => {
  try {
    const response = await api.get(`/api/garcom/comanda/${mesaId}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar comanda da mesa ${mesaId}:`, error);
    throw error;
  }
};

// aqui depois tem que atualizar
export const garcomService = {
  getDashboard,
  getComandaDetalhada,
};