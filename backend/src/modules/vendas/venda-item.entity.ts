import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Venda } from './venda.entity';
import { Produto } from '../produtos/produto.entity';

@Entity('venda_itens')
export class VendaItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Venda, (venda) => venda.itens)
  venda: Venda;

  @ManyToOne(() => Produto, { eager: true })
  produto: Produto;

  @Column('decimal', { precision: 10, scale: 3, nullable: true })
  quantidade: number;

  @Column('decimal', { precision: 10, scale: 3, nullable: true })
  peso: number;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal: number;
}
