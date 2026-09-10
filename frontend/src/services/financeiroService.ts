import { api } from './api';

export type Conta = {
  id: number;
  tipo: 'pagar' | 'receber';
  descricao: string;
  categoria: string;
  valor: number;
  vencimento: string;
  pago_em?: string | null;
  status: 'pendente' | 'pago' | 'atrasado';
  observacao?: string;
};

export type MovimentoCaixa = {
  id: number;
  tipo: 'abertura' | 'fechamento' | 'sangria' | 'suprimento' | 'venda';
  valor: number;
  forma_pagamento?: string;
  descricao?: string;
  data_hora: string;
};

export async function listarContas(tipo?: 'pagar' | 'receber'): Promise<Conta[]> {
  const { data } = await api.get('/financeiro/contas', { params: tipo ? { tipo } : {} });
  return data;
}

export async function criarConta(conta: Partial<Conta>): Promise<Conta> {
  const { data } = await api.post('/financeiro/contas', conta);
  return data;
}

export async function baixarConta(id: number): Promise<Conta> {
  const { data } = await api.patch(`/financeiro/contas/${id}/baixar`);
  return data;
}

export async function resumoCaixaHoje(): Promise<{ entradas: number; saidas: number; saldo: number }> {
  const { data } = await api.get('/financeiro/caixa/resumo-hoje');
  return data;
}

export async function listarMovimentosCaixa(): Promise<MovimentoCaixa[]> {
  const { data } = await api.get('/financeiro/caixa/movimentos');
  return data;
}

export async function registrarMovimentoCaixa(payload: {
  tipo: 'abertura' | 'fechamento' | 'sangria' | 'suprimento';
  valor: number;
  forma_pagamento?: string;
  descricao?: string;
}): Promise<MovimentoCaixa> {
  const { data } = await api.post('/financeiro/caixa/movimentos', payload);
  return data;
}
