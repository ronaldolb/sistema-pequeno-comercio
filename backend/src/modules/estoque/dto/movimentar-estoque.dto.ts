import { IsIn, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { TipoMovimentoEstoque } from '../estoque-movimento.entity';

export class MovimentarEstoqueDto {
  @IsNumber()
  produto_id: number;

  @IsIn(['entrada', 'saida', 'ajuste'])
  tipo: TipoMovimentoEstoque;

  @IsNumber()
  @IsPositive()
  quantidade: number;

  @IsString()
  motivo: string;

  @IsOptional()
  @IsString()
  observacao?: string;
}
