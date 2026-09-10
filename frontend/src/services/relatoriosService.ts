import { api } from './api';

export async function relatorioVendas(inicio: string, fim: string) {
  const { data } = await api.get('/relatorios/vendas', { params: { inicio, fim } });
  return data;
}

export async function relatorioEstoque() {
  const { data } = await api.get('/relatorios/estoque');
  return data;
}

export async function relatorioFinanceiro() {
  const { data } = await api.get('/relatorios/financeiro');
  return data;
}
