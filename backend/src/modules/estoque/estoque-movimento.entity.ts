import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Produto } from '../produtos/produto.entity';
import { Usuario } from '../users/usuario.entity';

export type TipoMovimentoEstoque = 'entrada' | 'saida' | 'ajuste';

@Entity('estoque_movimentos')
export class EstoqueMovimento {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Produto, { eager: true })
  produto: Produto;

  @Column({ type: 'varchar' })
  tipo: TipoMovimentoEstoque;

  @Column('decimal', { precision: 10, scale: 3 })
  quantidade: number;

  // ex.: 'compra', 'venda', 'perda', 'ajuste_inventario', 'devolucao'
  @Column()
  motivo: string;

  @ManyToOne(() => Usuario, { nullable: true, eager: true })
  usuario: Usuario | null;

  @Column({ type: 'text', nullable: true })
  observacao: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  data_hora: Date;
}
