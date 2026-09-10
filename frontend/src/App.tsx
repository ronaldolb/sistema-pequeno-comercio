import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { PrivateRoute } from './components/common/PrivateRoute';
import { Layout } from './components/common/Layout';
import { Login } from './pages/Login/Login';
import { Home } from './pages/Home/Home';
import { PDV } from './pages/PDV';
import { Produtos } from './pages/Produtos/Produtos';
import { Estoque } from './pages/Estoque/Estoque';
import { Financeiro } from './pages/Financeiro/Financeiro';
import { Relatorios } from './pages/Relatorios/Relatorios';
import { Config } from './pages/Config/Config';

export const App: React.FC = () => {
  return (
    <ToastProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/pdv" element={<PDV />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route
              path="/estoque"
              element={
                <PrivateRoute papeisPermitidos={['dono', 'gerente']}>
                  <Estoque />
                </PrivateRoute>
              }
            />
            <Route
              path="/financeiro"
              element={
                <PrivateRoute papeisPermitidos={['dono', 'gerente']}>
                  <Financeiro />
                </PrivateRoute>
              }
            />
            <Route
              path="/relatorios"
              element={
                <PrivateRoute papeisPermitidos={['dono', 'gerente']}>
                  <Relatorios />
                </PrivateRoute>
              }
            />
            <Route
              path="/config"
              element={
                <PrivateRoute papeisPermitidos={['dono']}>
                  <Config />
                </PrivateRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ToastProvider>
  );
};
