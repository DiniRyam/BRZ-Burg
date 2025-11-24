import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importar páginas
import Login from './pages/Login';
// import AdminDashboard from './pages/Admin/AdminDashboard';
// import KdsPage from './pages/Cozinheiro/KdsPage';
// import GarcomDashboard from './pages/Garcom/GarcomDashboard';
// import ClienteCardapio from './pages/Cliente/ClienteCardapio';

// Rota protegida: só acessa se tiver token no localStorage
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* Rota Pública: Login */}
        <Route path="/login" element={<Login />} />
        
        {/* Rota Pública: Cliente via QRCode */}
        {/* <Route path="/m/:mesaId" element={<ClienteCardapio />} /> */}
        
        {/* Rotas Protegidas */}
        {/* 
        <Route 
          path="/admin/*" 
          element={<PrivateRoute><AdminDashboard /></PrivateRoute>} 
        />

        <Route 
          path="/cozinha" 
          element={<PrivateRoute><KdsPage /></PrivateRoute>} 
        />

        <Route 
          path="/garcom" 
          element={<PrivateRoute><GarcomDashboard /></PrivateRoute>} 
        />
        */}

        {/* Rota padrão → manda pro login */}
        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
