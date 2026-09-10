import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RelatoriosService } from './relatorios.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('relatorios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('dono', 'gerente')
export class RelatoriosController {
  constructor(private readonly relatoriosService: RelatoriosService) {}

  @Get('vendas')
  vendasPorPeriodo(@Query('inicio') inicio: string, @Query('fim') fim: string) {
    return this.relatoriosService.vendasPorPeriodo(inicio, fim);
  }

  @Get('estoque')
  situacaoEstoque() {
    return this.relatoriosService.situacaoEstoque();
  }

  @Get('financeiro')
  situacaoFinanceira() {
    return this.relatoriosService.situacaoFinanceira();
  }
}
