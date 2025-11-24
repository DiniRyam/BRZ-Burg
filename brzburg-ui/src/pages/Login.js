import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { authService } from '../services/authService'; 
import Card from '../components/ui/Card'; 
import { Button } from '../components/ui/Button'; 

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ login: '', senha: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Chama a API de login
      const data = await authService.login(formData.login, formData.senha);
      
      // Salva o token
      localStorage.setItem('authToken', data.token);
      
      // Salva os dados do utilizador
      localStorage.setItem('user', JSON.stringify(data.usuario));

      // Redireciona com base na função (Role)
      const role = data.usuario.funcao;
      if (role === 'ADMIN') navigate('/admin/dashboard');
      else if (role === 'COZINHEIRO') navigate('/cozinha');
      else if (role === 'GARCOM') navigate('/garcom');

    } catch (err) {
      // --- CORREÇÃO: Usar o erro para logar no console ---
      console.error("Erro ao fazer login:", err);
      setError('Login falhou. Verifique as suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">
                
            </div>
            <h1 className="text-2xl font-bold text-gray-900">BRZ Burg Login</h1>
            <p className="text-gray-500">Entre para aceder ao sistema</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Login</label>
              <input
                type="text"
                name="login"
                value={formData.login}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <Button 
              type="submit" 
              variant="primary" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'A entrar...' : 'Entrar'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}