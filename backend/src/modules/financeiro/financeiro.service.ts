import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
  // --- Fechamento de caixa formal --------------------------------------------------

/**
 * Verifica se já existe uma abertura de caixa hoje sem fechamento correspondente.
 * Retorna o movimento de abertura ou null se o caixa está fechado.
 */
async statusCaixa(): Promise<{ aberto: boolean; abertura?: MovimentoCaixa }> {
  const inicio = new Date();
  inicio.setHours(0, 0, 0, 0);

  const abertura = await this.movimentosRepo
    .createQueryBuilder('m')
    .where('m.tipo = :tipo', { tipo: 'abertura' })
    .andWhere('m.data_hora >= :inicio', { inicio: this.paraSqliteDatetime(inicio) })
    .orderBy('m.data_hora', 'DESC')
    .getOne();

  if (!abertura) return { aberto: false };

  const fechamento = await this.movimentosRepo
    .createQueryBuilder('m')
    .where('m.tipo = :tipo', { tipo: 'fechamento' })
    .andWhere('m.data_hora > :abertura', { abertura: this.paraSqliteDatetime(new Date(abertura.data_hora)) })
    .getOne();

  return { aberto: !fechamento, abertura: fechamento ? undefined : abertura };
}

async abrirCaixa(fundoCaixa: number, observacao: string | undefined, usuarioId?: number): Promise<MovimentoCaixa> {
  const { aberto } = await this.statusCaixa();
  if (aberto) throw new BadRequestException('Já existe um caixa aberto hoje.');

  const movimento = this.movimentosRepo.create({
    tipo: 'abertura',
    valor: fundoCaixa,
    descricao: observacao || `Abertura de caixa — fundo R$ ${fundoCaixa.toFixed(2)}`,
    usuario: usuarioId ? ({ id: usuarioId } as any) : null,
  });
  return this.movimentosRepo.save(movimento);
}

async fecharCaixa(observacao: string | undefined, usuarioId?: number): Promise<{
  fechamento: MovimentoCaixa;
  resumo: {
    fundo_caixa: number;
    total_vendas: number;
    total_dinheiro: number;
    total_cartao: number;
    total_pix: number;
    total_sangrias: number;
    total_suprimentos: number;
    saldo_final: number;
  };
}> {
  const { aberto, abertura } = await this.statusCaixa();
  if (!aberto || !abertura) throw new BadRequestException('Não há caixa aberto para fechar.');

  const dataAbertura = this.paraSqliteDatetime(new Date(abertura.data_hora));
  const movimentos = await this.movimentosRepo
    .createQueryBuilder('m')
    .where('m.data_hora >= :dataAbertura', { dataAbertura })
    .getMany();

  let total_vendas = 0;
  let total_dinheiro = 0;
  let total_cartao = 0;
  let total_pix = 0;
  let total_sangrias = 0;
  let total_suprimentos = 0;
  const fundo_caixa = Number(abertura.valor);

  for (const m of movimentos) {
    const valor = Number(m.valor);
    if (m.tipo === 'venda') {
      total_vendas += valor;
      if (m.forma_pagamento === 'DINHEIRO') total_dinheiro += valor;
      else if (m.forma_pagamento === 'CARTAO') total_cartao += valor;
      else if (m.forma_pagamento === 'PIX') total_pix += valor;
    } else if (m.tipo === 'sangria') {
      total_sangrias += valor;
    } else if (m.tipo === 'suprimento') {
      total_suprimentos += valor;
    }
  }

  const saldo_final = fundo_caixa + total_vendas + total_suprimentos - total_sangrias;

  const fechamento = await this.movimentosRepo.save(
    this.movimentosRepo.create({
      tipo: 'fechamento',
      valor: saldo_final,
      descricao: observacao || `Fechamento de caixa`,
      usuario: usuarioId ? ({ id: usuarioId } as any) : null,
    }),
  );

  return {
    fechamento,
    resumo: {
      fundo_caixa,
      total_vendas,
      total_dinheiro,
      total_cartao,
      total_pix,
      total_sangrias,
      total_suprimentos,
      saldo_final,
    },
  };
}
}
