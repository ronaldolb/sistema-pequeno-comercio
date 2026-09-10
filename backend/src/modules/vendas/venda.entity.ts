import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Usuario } from '../users/usuario.entity';
import { VendaItem } from './venda-item.entity';

@Entity('vendas')
export class Venda {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  data_hora: Date;

  @Column()
  forma_pagamento: string;

  @Column('decimal', { precision: 10, scale: 2 })
  valor_total: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.vendas, { nullable: true, eager: true })
  usuario: Usuario | null;

  @OneToMany(() => VendaItem, (item) => item.venda, { cascade: true, eager: true })
  itens: VendaItem[];
}
