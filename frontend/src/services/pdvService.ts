import { api } from './api';

export const listarProdutosPdv = async () => {
  const { data } = await api.get('/pdv/produtos');
  return data;
};

export const criarVenda = async (payload: any) => {
  const { data } = await api.post('/pdv/venda', payload);
  return data;
};

export const statusCaixaPdv = async (): Promise<{ aberto: boolean }> => {
  const { data } = await api.get('/pdv/caixa-status');
  return data;
};
