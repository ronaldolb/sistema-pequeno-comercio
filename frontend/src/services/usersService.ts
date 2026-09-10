import { api } from './api';
import { Usuario } from './authService';

export async function listarUsuarios(): Promise<Usuario[]> {
  const { data } = await api.get('/usuarios');
  return data;
}

export async function criarUsuario(payload: {
  nome: string;
  email: string;
  senha: string;
  papel: 'dono' | 'gerente' | 'caixa';
}): Promise<Usuario> {
  const { data } = await api.post('/usuarios', payload);
  return data;
}

export async function desativarUsuario(id: number): Promise<void> {
  await api.delete(`/usuarios/${id}`);
}
