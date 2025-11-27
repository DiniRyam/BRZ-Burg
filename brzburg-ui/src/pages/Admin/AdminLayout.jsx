import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  SquareMenu, 
  Users, 
  MonitorPlay, 
  Eye, 
  PackageSearch,
  LogOut 
} from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Definição dos itens do menu lateral
  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/cardapio', label: 'Gerenciar Cardápio', icon: SquareMenu },
    { path: '/admin/estoque', label: 'Controle de Itens', icon: PackageSearch },
    { path: '/admin/mesas', label: 'Gerenciar Mesas', icon: UtensilsCrossed },
    { path: '/admin/funcionarios', label: 'Funcionários', icon: Users },
    // Reutilização de Telas (Links para visualização)
    { path: '/admin/salao', label: 'Checar Mesas (Salão)', icon: Eye },
    { path: '/admin/kds', label: 'Ver KDS (Cozinha)', icon: MonitorPlay },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* --- SIDEBAR (Coluna Esquerda) --- */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
        
        {/* Logo / Título */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold mr-3">
            B
          </div>
          <h1 className="text-lg font-bold text-gray-900">BRZ Admin</h1>
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center px-3 py-2.5 rounded-md text-sm font-semibold transition-colors
                  ${isActive 
                    ? 'bg-green-50 text-green-700' // Estilo Ativo
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' // Estilo Inativo
                  }
                `}
              >
                <Icon size={18} className={`mr-3 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Rodapé da Sidebar (Logout) */}
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut size={18} className="mr-3" />
            Sair
          </button>
        </div>
      </aside>

      {/* --- CONTEÚDO PRINCIPAL (Coluna Direita) --- */}
      {/* ml-64 empurra o conteúdo para a direita para não ficar debaixo da sidebar fixa */}
      <main className="flex-1 ml-64 overflow-auto p-8">
        {/* O Outlet renderiza a página filha selecionada (Dashboard, Mesas, etc.) */}
        <Outlet />
      </main>
    </div>
  );
}