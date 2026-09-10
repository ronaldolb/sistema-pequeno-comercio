import React, { createContext, useContext, useState } from 'react';
import * as authService from '../services/authService';
import { Usuario } from '../services/authService';

type AuthContextType = {
  usuario: Usuario | null;
  entrar: (email: string, senha: string) => Promise<void>;
  sair: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(authService.usuarioAtual());

  const entrar = async (email: string, senha: string) => {
    const usuarioLogado = await authService.login(email, senha);
    setUsuario(usuarioLogado);
  };

  const sair = () => {
    authService.logout();
    setUsuario(null);
  };

  return <AuthContext.Provider value={{ usuario, entrar, sair }}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth precisa ser usado dentro de <AuthProvider>');
  return context;
}
