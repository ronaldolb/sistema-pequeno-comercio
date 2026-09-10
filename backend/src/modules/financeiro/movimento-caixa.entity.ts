import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Usuario } from '../users/usuario.entity';
import { Venda } from '../vendas/venda.entity';

export type TipoMovimentoCaixa = 'abertura' | 'fechamento' | 'sangria' | 'suprimento' | 'venda';

@Entity('financeiro_movimentos_caixa')
export class MovimentoCaixa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  tipo: TipoMovimentoCaixa;

  @Column('decimal', { precision: 10, scale: 2 })
  valor: number;

  @Column({ nullable: true })
  forma_pagamento: string;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @ManyToOne(() => Usuario, { nullable: true, eager: true })
  usuario: Usuario | null;

  @ManyToOne(() => Venda, { nullable: true })
  venda: Venda | null;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  data_hora: Date;
}
