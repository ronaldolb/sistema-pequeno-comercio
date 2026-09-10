import { api } from './api';

export type Usuario = {
  id: number;
  nome: string;
  email: string;
  papel: 'dono' | 'gerente' | 'caixa';
};

export async function login(email: string, senha: string): Promise<Usuario> {
  const { data } = await api.post('/auth/login', { email, senha });
  localStorage.setItem('token', data.access_token);
  localStorage.setItem('usuario', JSON.stringify(data.usuario));
  return data.usuario;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
}

export function usuarioAtual(): Usuario | null {
  const raw = localStorage.getItem('usuario');
  return raw ? JSON.parse(raw) : null;
}

export function estaAutenticado(): boolean {
  return Boolean(localStorage.getItem('token'));
}
