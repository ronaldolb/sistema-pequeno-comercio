import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PapelUsuario } from '../../modules/users/usuario.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const papeisPermitidos = this.reflector.getAllAndOverride<PapelUsuario[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Rota sem @Roles(): qualquer usuário autenticado pode acessar.
    if (!papeisPermitidos || papeisPermitidos.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !papeisPermitidos.includes(user.papel)) {
      throw new ForbiddenException('Você não tem permissão para acessar este recurso.');
    }

    return true;
  }
}
