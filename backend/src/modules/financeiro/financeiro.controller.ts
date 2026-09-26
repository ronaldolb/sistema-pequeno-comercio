import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { FinanceiroService } from './financeiro.service';
import { CreateContaDto } from './dto/create-conta.dto';
import { CreateMovimentoCaixaDto } from './dto/movimento-caixa.dto';
import { TipoConta } from './conta.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('financeiro')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('dono', 'gerente')
export class FinanceiroController {
  constructor(private readonly financeiroService: FinanceiroService) {}

  @Get('contas')
  async listarContas(@Query('tipo') tipo?: TipoConta) {
    await this.financeiroService.atualizarContasAtrasadas();
    return this.financeiroService.listarContas(tipo);
  }

  @Post('contas')
  criarConta(@Body() dto: CreateContaDto) {
    return this.financeiroService.criarConta(dto);
  }

  @Patch('contas/:id/baixar')
  baixarConta(@Param('id', ParseIntPipe) id: number) {
    return this.financeiroService.baixarConta(id);
  }

  @Get('caixa/movimentos')
  listarMovimentosCaixa(@Query('inicio') inicio?: string, @Query('fim') fim?: string) {
    return this.financeiroService.listarMovimentosCaixa(inicio, fim);
  }

  @Get('caixa/resumo-hoje')
  resumoCaixaHoje() {
    return this.financeiroService.resumoCaixaHoje();
  }

  @Post('caixa/movimentos')
  registrarMovimentoCaixa(@Body() dto: CreateMovimentoCaixaDto, @Req() req: any) {
    return this.financeiroService.registrarMovimentoCaixa(dto, req.user?.id);
  }

  @Get('caixa/status')
statusCaixa() {
  return this.financeiroService.statusCaixa();
}

@Post('caixa/abrir')
abrirCaixa(@Body() body: { fundo_caixa: number; observacao?: string }, @Req() req: any) {
  return this.financeiroService.abrirCaixa(body.fundo_caixa, body.observacao, req.user?.id);
}

@Post('caixa/fechar')
fecharCaixa(@Body() body: { observacao?: string }, @Req() req: any) {
  return this.financeiroService.fecharCaixa(body.observacao, req.user?.id);
}
}
