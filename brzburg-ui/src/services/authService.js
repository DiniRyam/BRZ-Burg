import api from './api';

const authService = {

  // implementa POST /api/auth/login
  login: async (login, senha) => {
    try {

      // CORREÇÃO AQUI:
      // O Back-end (AuthController) espera receber a chave 'login', não 'usuario'.
      // Mesmo que no banco seja 'usuario', na API (o carteiro) o nome do campo é 'login'.
      const response = await api.post('/api/auth/login', { login: login, senha: senha });
      
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