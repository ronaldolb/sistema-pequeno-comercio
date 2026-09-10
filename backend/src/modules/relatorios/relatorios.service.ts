import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Venda } from '../vendas/venda.entity';
import { Produto } from '../produtos/produto.entity';
import { Conta } from '../financeiro/conta.entity';

@Injectable()
export class RelatoriosService {
  constructor(
    @InjectRepository(Venda) private readonly vendasRepo: Repository<Venda>,
    @InjectRepository(Produto) private readonly produtosRepo: Repository<Produto>,
    @InjectRepository(Conta) private readonly contasRepo: Repository<Conta>,
  ) {}

  async vendasPorPeriodo(inicio: string, fim: string) {
    const dataInicio = new Date(inicio);
    const dataFim = new Date(fim);
    dataFim.setUTCHours(23, 59, 59, 999);

    const vendas = await this.vendasRepo.find({
      where: { data_hora: Between(dataInicio, dataFim) },
    });

    const totalVendido = vendas.reduce((acc, v) => acc + Number(v.valor_total), 0);
    const porFormaPagamento: Record<string, number> = {};
    for (const v of vendas) {
      porFormaPagamento[v.forma_pagamento] = (porFormaPagamento[v.forma_pagamento] || 0) + Number(v.valor_total);
    }

    const porProduto: Record<string, { quantidade: number; total: number }> = {};
    for (const v of vendas) {
      for (const item of v.itens || []) {
        const nome = item.produto?.nome || 'Produto removido';
        if (!porProduto[nome]) porProduto[nome] = { quantidade: 0, total: 0 };
        porProduto[nome].quantidade += Number(item.quantidade ?? item.peso ?? 0);
        porProduto[nome].total += Number(item.subtotal);
      }
    }

    return {
      periodo: { inicio, fim },
      quantidade_vendas: vendas.length,
      total_vendido: totalVendido,
      por_forma_pagamento: porFormaPagamento,
      produtos_mais_vendidos: Object.entries(porProduto)
        .map(([nome, dados]) => ({ nome, ...dados }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10),
    };
  }

  async situacaoEstoque() {
    const produtos = await this.produtosRepo.find({ where: { ativo: true } });
    const baixo = produtos.filter((p) => Number(p.estoque_atual) <= Number(p.estoque_minimo));
    const valorEmEstoque = produtos.reduce((acc, p) => acc + Number(p.estoque_atual) * Number(p.preco), 0);

    return {
      total_produtos: produtos.length,
      produtos_estoque_baixo: baixo.map((p) => ({
        id: p.id,
        nome: p.nome,
        estoque_atual: p.estoque_atual,
        estoque_minimo: p.estoque_minimo,
      })),
      valor_total_em_estoque: valorEmEstoque,
    };
  }

  async situacaoFinanceira() {
    const contas = await this.contasRepo.find();
    const aPagar = contas.filter((c) => c.tipo === 'pagar' && c.status !== 'pago');
    const aReceber = contas.filter((c) => c.tipo === 'receber' && c.status !== 'pago');

    return {
      total_a_pagar: aPagar.reduce((acc, c) => acc + Number(c.valor), 0),
      total_a_receber: aReceber.reduce((acc, c) => acc + Number(c.valor), 0),
      contas_atrasadas: contas.filter((c) => c.status === 'atrasado').length,
    };
  }
}
