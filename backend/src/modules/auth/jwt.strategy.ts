import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'troque-este-segredo-em-producao',
    });
  }

  // O retorno aqui vira `request.user` em todas as rotas protegidas por JwtAuthGuard.
  async validate(payload: { sub: number; email: string; papel: string }) {
    return { id: payload.sub, email: payload.email, papel: payload.papel };
  }
}
