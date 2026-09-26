import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { PdvService } from './pdv.service';
import { CriarVendaDto } from './dto/criar-venda.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('pdv')
@UseGuards(JwtAuthGuard)
export class PdvController {
  constructor(private readonly pdvService: PdvService) {}

  @Get('produtos')
  listarProdutos() {
    return this.pdvService.listarProdutosParaPdv();
  }

  @Get('caixa-status')
  statusCaixa() {
    return this.pdvService.statusCaixa();
  }

  @Post('venda')
  criarVenda(@Body() dto: CriarVendaDto, @Req() req: any) {
    return this.pdvService.criarVenda(dto, req.user?.id);
  }
}
