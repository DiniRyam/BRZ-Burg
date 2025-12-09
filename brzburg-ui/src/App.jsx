import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// --- PÁGINAS DE ACESSO GERAL ---
import Login from './pages/Login';

// --- PÁGINAS DO CLIENTE (QR Code) ---
import ClienteCardapio from './pages/Cliente/ClienteCardapio';
import ClienteComanda from './pages/Cliente/ClienteComanda';

// --- PÁGINAS OPERACIONAIS ---
import KdsPage from './pages/Cozinheiro/KdsPage';
import GarcomDashboard from './pages/Garcom/GarcomDashboard';
import GarcomMesa from './pages/Garcom/GarcomMesa'; // <--- ESTA É A LINHA QUE FALTAVA!

// --- PÁGINAS DO ADMIN ---
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminMesas from './pages/Admin/AdminMesas';
import AdminFuncionarios from './pages/Admin/AdminFuncionarios';
import AdminCardapio from './pages/Admin/AdminCardapio';
import AdminEstoque from './pages/Admin/AdminEstoque';

// --- MÓDULOS REUTILIZÁVEIS (Para visualização do Admin) ---
import PainelKDS from './components/modules/PainelKDS';
import PainelGarcom from './components/modules/PainelGarcom';

// Componente de Proteção de Rota
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* --- Rota Pública: Login --- */}
        <Route path="/login" element={<Login />} />

        {/* --- Rotas Públicas: Cliente (QR Code) --- */}
        <Route path="/m/:mesaId" element={<ClienteCardapio />} />
        <Route path="/cliente/mesa/:mesaId/comanda" element={<ClienteComanda />} />


        {/* --- ÁREA DO COZINHEIRO --- */}
        <Route 
          path="/cozinha" 
          element={<PrivateRoute><KdsPage /></PrivateRoute>} 
        />

        {/* --- ÁREA DO GARÇOM --- */}
        <Route 
          path="/garcom" 
          element={<PrivateRoute><GarcomDashboard /></PrivateRoute>} 
        />
        {/* Rota de Detalhes da Mesa (Garçom) */}
        <Route 
          path="/garcom/mesa/:mesaId" 
          element={<PrivateRoute><GarcomMesa /></PrivateRoute>} 
        />
        
        {/* --- ÁREA DO ADMIN (Layout com Sidebar) --- */}
        <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
            
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="mesas" element={<AdminMesas />} />
            <Route path="funcionarios" element={<AdminFuncionarios />} />
            <Route path="cardapio" element={<AdminCardapio />} />
            <Route path="estoque" element={<AdminEstoque />} />

            {/* Visualização Operacional */}
            <Route path="kds" element={
              <div className="h-full p-4 bg-white rounded-lg shadow overflow-hidden flex flex-col">
                <h2 className="text-xl font-bold mb-4 px-2 pt-2">Visão da Cozinha (Apenas Leitura)</h2>
                <div className="flex-1 overflow-hidden border rounded-lg">
                  <PainelKDS readOnly={true} />
                </div>
              </div>
            } />

            <Route path="salao" element={
              <div className="h-full p-4 bg-white rounded-lg shadow overflow-hidden flex flex-col">
                 <h2 className="text-xl font-bold mb-4 px-2 pt-2">Visão do Salão</h2>
                 <div className="flex-1 overflow-hidden border rounded-lg">
                    <PainelGarcom />
                 </div>
              </div>
            } />

        </Route>

        {/* Rota Padrão (404) -> Login */}
        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;