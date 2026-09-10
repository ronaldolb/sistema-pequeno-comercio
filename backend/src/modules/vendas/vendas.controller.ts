import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { VendasService } from './vendas.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('vendas')
@UseGuards(JwtAuthGuard)
export class VendasController {
  constructor(private readonly vendasService: VendasService) {}

  @Get()
  listar(@Query('inicio') inicio?: string, @Query('fim') fim?: string) {
    return this.vendasService.listar(inicio, fim);
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.vendasService.buscarPorId(id);
  }
}
