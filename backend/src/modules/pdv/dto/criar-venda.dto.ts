import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsIn, IsNumber, IsOptional, IsPositive, ValidateNested } from 'class-validator';

export class ItemVendaDto {
  @IsNumber()
  produto_id: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  quantidade?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  peso?: number;

  @IsNumber()
  @IsPositive()
  subtotal: number;
}

export class CriarVendaDto {
  @IsIn(['DINHEIRO', 'CARTAO', 'PIX'])
  forma_pagamento: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'A venda precisa ter ao menos um item.' })
  @ValidateNested({ each: true })
  @Type(() => ItemVendaDto)
  itens: ItemVendaDto[];

  @IsNumber()
  @IsPositive()
  valor_total: number;
}
