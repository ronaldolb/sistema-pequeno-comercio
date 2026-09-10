import { IsIn, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { TipoConta } from '../conta.entity';

export class CreateContaDto {
  @IsIn(['pagar', 'receber'])
  tipo: TipoConta;

  @IsString()
  descricao: string;

  @IsString()
  categoria: string;

  @IsNumber()
  @IsPositive()
  valor: number;

  @IsString()
  vencimento: string; // 'YYYY-MM-DD'

  @IsOptional()
  @IsString()
  observacao?: string;
}
