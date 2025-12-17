import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Importe sua instância do Axios

export const useTurnoMonitor = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Verifica quem está logado
        const storedUser = localStorage.getItem('user');
        if (!storedUser) return;
        
        const user = JSON.parse(storedUser);
        
        // Se for ADMIN, não precisa verificar (ele nunca é expulso)
        if (user.funcao === 'ADMIN') return;

        // Consulta o status público
        // Nota: Endpoint criado no AuthController do Backend
        const response = await api.get('/api/auth/status-publico');
        const { aberto } = response.data;

        // Se estiver FECHADO, expulsa o funcionário
        if (!aberto) {
          alert("O turno foi encerrado pelo gerente. O sistema será desconectado.");
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          navigate('/login');
        }
      } catch (error) {
        // Se der erro de rede, ignoramos silenciosamente para não atrapalhar
        console.error("Erro ao verificar turno:", error);
      }
    };

    // Verifica a cada 10 segundos
    const interval = setInterval(checkStatus, 10000);
    
    // Verifica imediatamente ao montar
    checkStatus();

    return () => clearInterval(interval);
  }, [navigate]);
};