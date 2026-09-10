import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

type Props = {
  children: React.ReactElement;
  papeisPermitidos?: Array<'dono' | 'gerente' | 'caixa'>;
};

export const PrivateRoute: React.FC<Props> = ({ children, papeisPermitidos }) => {
  const { usuario } = useAuth();

  if (!usuario) return <Navigate to="/login" replace />;

  if (papeisPermitidos && !papeisPermitidos.includes(usuario.papel)) {
    return <Navigate to="/" replace />;
  }

  return children;
};
