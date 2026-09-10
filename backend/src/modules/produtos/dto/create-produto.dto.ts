import { IsBoolean, IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProdutoDto {
  @IsString()
  nome: string;

  @IsString()
  categoria: string;

  @IsIn(['un', 'kg', 'lt', 'm'])
  unidade: string;

  @IsNumber()
  @Min(0)
  preco: number;

  @IsOptional()
  @IsString()
  foto?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  estoque_atual?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  estoque_minimo?: number;

  @IsOptional()
  @IsString()
  codigo_interno?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
