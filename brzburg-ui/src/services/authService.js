import api from './api';

const authService = {

  // implementa POST /api/auth/login
  login: async (login, senha) => {
    try {

      // manda os dados para o backend
      const response = await api.post('/api/auth/login', { login, senha });
      
      // O back-end retorna { token: "...", usuario: { ... } }
      return response.data; 
    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    }
  },

  // Função utilitária para logout
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};

export { authService };