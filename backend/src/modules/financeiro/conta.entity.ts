import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export type TipoConta = 'pagar' | 'receber';
export type StatusConta = 'pendente' | 'pago' | 'atrasado';

// Uma única tabela para contas a pagar e a receber (diferenciadas pelo campo `tipo`) —
// suficiente para o volume de um pequeno comércio e mais simples de manter.
@Entity('financeiro_contas')
export class Conta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  tipo: TipoConta;

  @Column()
  descricao: string;

  @Column()
  categoria: string; // ex.: 'fornecedor', 'aluguel', 'energia', 'cliente', 'outros'

  @Column('decimal', { precision: 10, scale: 2 })
  valor: number;

  @Column({ type: 'date' })
  vencimento: string;

  @Column({ type: 'date', nullable: true })
  pago_em: string | null;

  @Column({ type: 'varchar', default: 'pendente' })
  status: StatusConta;

  @Column({ type: 'text', nullable: true })
  observacao: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  criado_em: Date;
}
