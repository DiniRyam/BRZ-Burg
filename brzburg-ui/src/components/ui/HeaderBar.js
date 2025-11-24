import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button'; 
import { LogOut } from 'lucide-react';

export default function HeaderBar({ user, title }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Limpa os dados do utilizador
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    // Redireciona para o login
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm sticky top-0 z-10">
      {/* Lado Esquerdo: Logo e Título/Nome do Restaurante */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm">
          
        </div>
        <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">BRZ Burg</h1>
            {title && <p className="text-xs text-gray-500 font-medium">{title}</p>}
        </div>
      </div>

      {/* Lado Direito: Informações do Funcionário e Logout */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-900">{user.nome}</p>
            <p className="text-xs text-gray-500 font-medium">{user.funcao}</p>
          </div>
        )}
        
        <Button 
          variant="secondary" 
          onClick={handleLogout}
          className="p-2 h-9 w-9 rounded-full flex items-center justify-center"
          title="Sair"
        >
          <LogOut size={18} />
        </Button>
      </div>
    </header>
  );
}