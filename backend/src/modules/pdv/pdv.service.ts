import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Produto } from '../produtos/produto.entity';
import { Venda } from '../vendas/venda.entity';
import { VendaItem } from '../vendas/venda-item.entity';
import { EstoqueService } from '../estoque/estoque.service';
import { FinanceiroService } from '../financeiro/financeiro.service';
import { CriarVendaDto } from './dto/criar-venda.dto';

@Injectable()
export class PdvService {
  constructor(
    @InjectRepository(Produto)
    private readonly produtosRepo: Repository<Produto>,
    private readonly dataSource: DataSource,
    private readonly estoqueService: EstoqueService,
    private readonly financeiroService: FinanceiroService,
  ) {}

  listarProdutosParaPdv(): Promise<Produto[]> {
    return this.produtosRepo.find({
      where: { ativo: true },
      order: { categoria: 'ASC', nome: 'ASC' },
    });
  }

  /**
   * Fecha uma venda do PDV: grava a venda + itens (em transação), depois baixa o estoque de
   * cada produto (via EstoqueService, que também grava o histórico de movimentação) e lança
   * a entrada correspondente no caixa.
   */
  async criarVenda(dto: CriarVendaDto, usuarioId?: number): Promise<Venda> {
    const venda = await this.dataSource.transaction(async (manager) => {
      const vendaRepo = manager.getRepository(Venda);
      const itemRepo = manager.getRepository(VendaItem);
      const produtoRepo = manager.getRepository(Produto);

      const novaVenda = vendaRepo.create({
        forma_pagamento: dto.forma_pagamento,
        valor_total: dto.valor_total,
        usuario: usuarioId ? ({ id: usuarioId } as any) : null,
      });
      const vendaSalva = await vendaRepo.save(novaVenda);

      for (const item of dto.itens) {
        const produto = await produtoRepo.findOne({ where: { id: item.produto_id } });
        if (!produto) continue;

        const vendaItem = itemRepo.create({
          venda: vendaSalva,
          produto,
          quantidade: item.quantidade,
          peso: item.peso,
          subtotal: item.subtotal,
        });
        await itemRepo.save(vendaItem);
      }

      return vendaSalva;
    });

    // Baixa de estoque e lançamento no caixa: rodam depois da transação da venda para que o
    // EstoqueService (fonte única de verdade para estoque_atual + histórico) fique responsável
    // por todo o cálculo, sem duplicar a lógica de decremento aqui.
    for (const item of dto.itens) {
      const quantidade = item.peso ?? item.quantidade ?? 0;
      if (quantidade > 0) {
        await this.estoqueService.movimentar(
          {
            produto_id: item.produto_id,
            tipo: 'saida',
            quantidade,
            motivo: 'venda',
            observacao: `Venda #${venda.id}`,
          },
          usuarioId,
        );
      }
    }

    await this.financeiroService.registrarVendaNoCaixa(venda, usuarioId);

    return venda;
  }
}
