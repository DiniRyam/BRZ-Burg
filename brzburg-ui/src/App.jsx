import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// pagina geral de acesso
import Login from './pages/Login';

// pagina de serviço do restaurante
import KdsPage from './pages/Cozinheiro/KdsPage';
import GarcomDashboard from './pages/Garcom/GarcomDashboard';

// paginas para o admin
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminMesas from './pages/Admin/AdminMesas';
import AdminFuncionarios from './pages/Admin/AdminFuncionarios';
import AdminCardapio from './pages/Admin/AdminCardapio';
// import AdminEstoque from './pages/Admin/AdminEstoque'; 

// modulos reutilizaveis para o admin ver 
import PainelKDS from './components/modules/PainelKDS';
import PainelGarcom from './components/modules/PainelGarcom';

// protecao de rota e autenticacao
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

        {/* rota do cozinheiro */}
        <Route 
          path="/cozinha" 
          element={<PrivateRoute><KdsPage /></PrivateRoute>} 
        />

        {/* rota para garcom */}
        <Route 
          path="/garcom" 
          element={<PrivateRoute><GarcomDashboard /></PrivateRoute>} 
        />
        
        {/* tela principal de admin */}
        <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
            
            {/* redireciona /admin para /admin/dashboard */}
            <Route index element={<Navigate to="dashboard" replace />} />
            
            {/* dashboard */}
            <Route path="dashboard" element={<AdminDashboard />} />

            {/* mesas */}
            <Route path="mesas" element={<AdminMesas />} />

            {/* funcionarios */}
            <Route path="funcionarios" element={<AdminFuncionarios />} />

            {/* cardapio */}
            <Route path="cardapio" element={<AdminCardapio />} />

            {/* controle de estoque */}
            {/* <Route path="estoque" element={<AdminEstoque />} /> */}

            {/* tela do kds para vizualizacao */}
            {/* Reutiliza o PainelKDS com readOnly=true */}

            <Route path="kds" element={
              <div className="h-full p-4 bg-white rounded-lg shadow overflow-hidden flex flex-col">
                <h2 className="text-xl font-bold mb-4 px-2 pt-2">Visão da Cozinha (Apenas Leitura)</h2>
                <div className="flex-1 overflow-hidden border rounded-lg">
                  <PainelKDS readOnly={true} />
                </div>
              </div>
            } />

            {/* olhar mesas do salao reutilizando o painel do garcom */}
            <Route path="salao" element={
              <div className="h-full p-4 bg-white rounded-lg shadow overflow-hidden flex flex-col">
                 <h2 className="text-xl font-bold mb-4 px-2 pt-2">Visão do Salão</h2>
                 <div className="flex-1 overflow-hidden border rounded-lg">
                    <PainelGarcom />
                 </div>
              </div>
            } />

        </Route>

        {/* rota padrao de login */}
        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;