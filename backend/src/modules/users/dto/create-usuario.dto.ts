import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { PapelUsuario } from '../usuario.entity';

export class CreateUsuarioDto {
  @IsString()
  nome: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: 'A senha precisa ter no mínimo 6 caracteres.' })
  senha: string;

  @IsIn(['dono', 'gerente', 'caixa'])
  papel: PapelUsuario;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
