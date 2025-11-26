import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// pagina de acesso geral
import Login from './pages/Login';

// paginas do cliente com qrcode
import ClienteCardapio from './pages/Cliente/ClienteCardapio';
import ClienteComanda from './pages/Cliente/ClienteComanda';

// paginas de garcom e cozinha
import KdsPage from './pages/Cozinheiro/KdsPage';
import GarcomDashboard from './pages/Garcom/GarcomDashboard';

// paginas que compoe o admin
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminMesas from './pages/Admin/AdminMesas';
import AdminFuncionarios from './pages/Admin/AdminFuncionarios';
import AdminCardapio from './pages/Admin/AdminCardapio';
import AdminEstoque from './pages/Admin/AdminEstoque';

// paginas reutilizadas para o admin 
import PainelKDS from './components/modules/PainelKDS';
import PainelGarcom from './components/modules/PainelGarcom';

// componente de proteção de rota com token
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* rota publica de login */}
        <Route path="/login" element={<Login />} />

        {/* rota publica via qrcode */}
        {/* Ex: http://localhost:3000/m/9  */}
        <Route path="/m/:mesaId" element={<ClienteCardapio />} />
        <Route path="/cliente/mesa/:mesaId/comanda" element={<ClienteComanda />} />


        {/* rota privada para o cozinheiro */}
        <Route 
          path="/cozinha" 
          element={<PrivateRoute><KdsPage /></PrivateRoute>} 
        />

        {/* rota privada para garcom */}
        <Route 
          path="/garcom" 
          element={<PrivateRoute><GarcomDashboard /></PrivateRoute>} 
        />
        
        {/* rota para a area principal do admin com a sidebar */}
        <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
            
            {/* dashboard */}
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />

            {/* gesta de mesas, funcionarios, cardapio e estoque */}
            <Route path="mesas" element={<AdminMesas />} />
            <Route path="funcionarios" element={<AdminFuncionarios />} />
            <Route path="cardapio" element={<AdminCardapio />} />
            <Route path="estoque" element={<AdminEstoque />} />

            {/* visao das telas da cozinha e garcom */}
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

        {/* rota 404 login */}
        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;