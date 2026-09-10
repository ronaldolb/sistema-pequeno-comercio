import { SetMetadata } from '@nestjs/common';
import { PapelUsuario } from '../../modules/users/usuario.entity';

export const ROLES_KEY = 'roles';

/**
 * Marca uma rota como restrita a um ou mais papéis de usuário.
 * Uso: @Roles('dono', 'gerente')
 */
export const Roles = (...roles: PapelUsuario[]) => SetMetadata(ROLES_KEY, roles);
