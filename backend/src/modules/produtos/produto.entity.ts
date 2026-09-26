import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('produtos')
export class Produto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column()
  categoria: string;

  @Column()
  unidade: string;

  @Column('decimal', { precision: 10, scale: 2 })
  preco: number;

  @Column({ nullable: true })
  foto: string;

  @Column('decimal', { precision: 10, scale: 3, default: 0 })
  estoque_atual: number;

  @Column('decimal', { precision: 10, scale: 3, default: 0 })
  estoque_minimo: number;

  @Column({ nullable: true })
  codigo_interno: string;

  @Column({ default: true })
  ativo: boolean;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @Column({ type: 'date', nullable: true })
  data_validade: string | null;

  @Column({ type: 'int', default: 30 })
  dias_alerta_vencimento: number;
}