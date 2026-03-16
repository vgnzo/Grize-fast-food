import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from './pages/Home.tsx';
import Login from './pages/Login.tsx';
import Cadastro from "./pages/Cadastro.tsx";
import PainelRestaurante from './pages/PainelRestaurante.tsx';
import RestaurantePage from './pages/RestaurantePage.tsx';
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { jwtDecode } from "jwt-decode";
import PerfilPage from './pages/PerfilPage';
import MeusPedidosPage from './pages/MeusPedidosPage';

function RotaProtegida({ children, roleNecessario }: { children: React.ReactNode, roleNecessario: string }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;

  let roles: string[] = [];
  try {
    const decoded = jwtDecode<{ roles: string[] }>(token);
    roles = decoded.roles ?? [];
  } catch {
    return <Navigate to="/login" />;
  }

  if (!roles.includes(roleNecessario)) return <Navigate to="/home" />;
  return <>{children}</>;
}

function RotaPublica({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decoded = jwtDecode<{ roles: string[] }>(token);
      const role = decoded.roles?.[0];
      if (role === 'ROLE_RESTAURANTE') return <Navigate to="/painel" />;
      return <Navigate to="/home" />;
    } catch {
      localStorage.removeItem('token');
    }
  }
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<RotaPublica><Login /></RotaPublica>} />
          <Route path="/cadastro" element={<RotaPublica><Cadastro /></RotaPublica>} />
          <Route path="/home" element={<Home />} />
          <Route path="/painel" element={
            <RotaProtegida roleNecessario="ROLE_RESTAURANTE">
              <PainelRestaurante />
            </RotaProtegida>
          } />
          <Route path="/restaurante/:id" element={<RestaurantePage />} />
          <Route path="/perfil" element={
            <RotaProtegida roleNecessario="ROLE_CLIENTE">
              <PerfilPage />
            </RotaProtegida>
          } />
          <Route path="/meus-pedidos" element={
            <RotaProtegida roleNecessario="ROLE_CLIENTE">
              <MeusPedidosPage />
            </RotaProtegida>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;