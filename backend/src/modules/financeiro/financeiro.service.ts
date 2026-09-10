import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conta, TipoConta } from './conta.entity';
import { MovimentoCaixa } from './movimento-caixa.entity';
import { Venda } from '../vendas/venda.entity';
import { CreateContaDto } from './dto/create-conta.dto';
import { CreateMovimentoCaixaDto } from './dto/movimento-caixa.dto';

@Injectable()
export class FinanceiroService {
  constructor(
    @InjectRepository(Conta)
    private readonly contasRepo: Repository<Conta>,
    @InjectRepository(MovimentoCaixa)
    private readonly movimentosRepo: Repository<MovimentoCaixa>,
  ) {}

  /**
   * O SQLite guarda colunas `datetime` como texto no formato 'YYYY-MM-DD HH:MM:SS' (com espaço,
   * sem 'T'/'Z' — é assim que o CURRENT_TIMESTAMP do próprio SQLite grava). Comparar direto com
   * `date.toISOString()` (que tem 'T' e 'Z') compara as duas como texto e dá resultado errado,
   * porque ' ' (espaço) vem antes de 'T' na tabela ASCII — a comparação falha silenciosamente.
   * Esta função formata a data no mesmo padrão gravado, para a comparação funcionar de verdade.
   */
  private paraSqliteDatetime(data: Date): string {
    return data.toISOString().slice(0, 19).replace('T', ' ');
  }

  // --- Contas a pagar / receber -------------------------------------------------

  listarContas(tipo?: TipoConta): Promise<Conta[]> {
    return this.contasRepo.find({
      where: tipo ? { tipo } : {},
      order: { vencimento: 'ASC' },
    });
  }

  criarConta(dto: CreateContaDto): Promise<Conta> {
    const conta = this.contasRepo.create({ ...dto, status: 'pendente' });
    return this.contasRepo.save(conta);
  }

  async baixarConta(id: number): Promise<Conta> {
    const conta = await this.contasRepo.findOne({ where: { id } });
    if (!conta) throw new NotFoundException('Conta não encontrada.');
    conta.status = 'pago';
    conta.pago_em = new Date().toISOString().slice(0, 10);
    return this.contasRepo.save(conta);
  }

  /** Marca como atrasadas as contas pendentes cujo vencimento já passou. Chamado a cada listagem. */
  async atualizarContasAtrasadas(): Promise<void> {
    const hoje = new Date().toISOString().slice(0, 10);
    await this.contasRepo
      .createQueryBuilder()
      .update(Conta)
      .set({ status: 'atrasado' })
      .where('status = :pendente', { pendente: 'pendente' })
      .andWhere('vencimento < :hoje', { hoje })
      .execute();
  }

  // --- Caixa ----------------------------------------------------------------------

  listarMovimentosCaixa(inicio?: string, fim?: string): Promise<MovimentoCaixa[]> {
    const qb = this.movimentosRepo.createQueryBuilder('m').orderBy('m.data_hora', 'DESC');
    if (inicio && fim) {
      qb.where('m.data_hora BETWEEN :inicio AND :fim', {
        inicio: this.paraSqliteDatetime(new Date(inicio)),
        fim: this.paraSqliteDatetime(new Date(fim)),
      });
    } else {
      qb.take(200);
    }
    return qb.getMany();
  }

  registrarMovimentoCaixa(dto: CreateMovimentoCaixaDto, usuarioId?: number): Promise<MovimentoCaixa> {
    const movimento = this.movimentosRepo.create({
      ...dto,
      usuario: usuarioId ? ({ id: usuarioId } as any) : null,
    });
    return this.movimentosRepo.save(movimento);
  }

  /** Usado pelo PDV: registra a entrada de caixa referente a uma venda concluída. */
  registrarVendaNoCaixa(venda: Venda, usuarioId?: number): Promise<MovimentoCaixa> {
    const movimento = this.movimentosRepo.create({
      tipo: 'venda',
      valor: venda.valor_total,
      forma_pagamento: venda.forma_pagamento,
      descricao: `Venda #${venda.id}`,
      venda,
      usuario: usuarioId ? ({ id: usuarioId } as any) : null,
    });
    return this.movimentosRepo.save(movimento);
  }

  async resumoCaixaHoje(): Promise<{ entradas: number; saidas: number; saldo: number }> {
    const inicio = new Date();
    inicio.setHours(0, 0, 0, 0);
    const movimentos = await this.movimentosRepo
      .createQueryBuilder('m')
      .where('m.data_hora >= :inicio', { inicio: this.paraSqliteDatetime(inicio) })
      .getMany();

    let entradas = 0;
    let saidas = 0;
    for (const m of movimentos) {
      const valor = Number(m.valor);
      if (m.tipo === 'venda' || m.tipo === 'abertura' || m.tipo === 'suprimento') entradas += valor;
      else saidas += valor;
    }
    return { entradas, saidas, saldo: entradas - saidas };
  }
}
