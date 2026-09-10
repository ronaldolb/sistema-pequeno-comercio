import { IsIn, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { TipoMovimentoCaixa } from '../movimento-caixa.entity';

export class CreateMovimentoCaixaDto {
  @IsIn(['abertura', 'fechamento', 'sangria', 'suprimento'])
  tipo: TipoMovimentoCaixa;

  @IsNumber()
  @IsPositive()
  valor: number;

  @IsOptional()
  @IsString()
  forma_pagamento?: string;

  @IsOptional()
  @IsString()
  descricao?: string;
}
