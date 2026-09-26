import { api } from './api';

export type Produto = {
  id: number;
  nome: string;
  categoria: string;
  unidade: string;
  preco: number;
  estoque_atual: number;
  estoque_minimo: number;
  codigo_interno?: string;
  ativo: boolean;
  observacoes?: string;
  data_validade?: string | null;
  dias_alerta_vencimento?: number;
};

export async function listarProdutos(): Promise<Produto[]> {
  const { data } = await api.get('/produtos');
  return data;
}

export async function criarProduto(produto: Partial<Produto>): Promise<Produto> {
  const { data } = await api.post('/produtos', produto);
  return data;
}

export async function atualizarProduto(id: number, produto: Partial<Produto>): Promise<Produto> {
  const { data } = await api.patch(`/produtos/${id}`, produto);
  return data;
}

export async function removerProduto(id: number): Promise<void> {
  await api.delete(`/produtos/${id}`);
}

export async function listarEstoqueBaixo(): Promise<Produto[]> {
  const { data } = await api.get('/produtos/estoque-baixo');
  return data;
}

export async function listarVencendo(dias = 30): Promise<Produto[]> {
  const { data } = await api.get(`/produtos/vencendo?dias=${dias}`);
  return data;
}