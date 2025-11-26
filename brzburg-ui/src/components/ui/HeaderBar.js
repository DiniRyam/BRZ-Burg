import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button'; 
import { LogOut } from 'lucide-react';

/**
 * @param {object}; //user com dados do funcionatio e tipo
 * @param {string} //title da pagina
 * @param {React.ReactNode} //conteudo personalizado para a direita 
 */
export default function HeaderBar({ user, title, rightAction }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 shadow-sm sticky top-0 z-10">
      
      {/* logo e titulo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold">
          B
        </div>

        <div>
          <h1 className="text-lg font-bold text-gray-900 leading-tight">BRZ Burg</h1>
          {title && (
            <p className="text-xs text-gray-500 font-medium">
              {title}
            </p>
          )}
        </div>
      </div>

      {/* direita flexivel */}
      <div className="flex items-center gap-4">

        {/* acao personalizada na direita */}
        {rightAction && <div>{rightAction}</div>}

        {/* Informações do usuário e Logout */}
        {user && (
          <>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">{user.nome}</p>
              <p className="text-xs text-gray-500 font-medium">{user.funcao}</p>
            </div>

            <Button
              variant="secondary"
              onClick={handleLogout}
              className="p-2 h-9 w-9 rounded-full flex items-center justify-center"
              title="Sair"
            >
              <LogOut size={18} />
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
