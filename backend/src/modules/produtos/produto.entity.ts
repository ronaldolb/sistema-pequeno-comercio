import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

// Genérico o suficiente para qualquer pequeno comércio (mercearia, loja, papelaria, padaria etc.):
// produtos vendidos por unidade ('un') ou por peso/medida ('kg', 'lt', 'm').
@Entity('produtos')
export class Produto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column()
  categoria: string;

  @Column()
  unidade: string; // 'un', 'kg', 'lt', 'm' ...

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
}
