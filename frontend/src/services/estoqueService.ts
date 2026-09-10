import { api } from './api';

export type MovimentoEstoque = {
  id: number;
  produto: { id: number; nome: string };
  tipo: 'entrada' | 'saida' | 'ajuste';
  quantidade: number;
  motivo: string;
  observacao?: string;
  data_hora: string;
};

export async function listarMovimentos(produtoId?: number): Promise<MovimentoEstoque[]> {
  const { data } = await api.get('/estoque/movimentos', {
    params: produtoId ? { produto_id: produtoId } : {},
  });
  return data;
}

export async function movimentarEstoque(payload: {
  produto_id: number;
  tipo: 'entrada' | 'saida' | 'ajuste';
  quantidade: number;
  motivo: string;
  observacao?: string;
}): Promise<MovimentoEstoque> {
  const { data } = await api.post('/estoque/movimentar', payload);
  return data;
}
