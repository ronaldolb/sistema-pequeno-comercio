import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Venda } from '../vendas/venda.entity';

export type PapelUsuario = 'dono' | 'gerente' | 'caixa';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column({ unique: true })
  email: string;

  @Column()
  senha_hash: string;

  @Column({ type: 'varchar', default: 'caixa' })
  papel: PapelUsuario;

  @Column({ default: true })
  ativo: boolean;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  criado_em: Date;

  @OneToMany(() => Venda, (venda) => venda.usuario)
  vendas: Venda[];
}
