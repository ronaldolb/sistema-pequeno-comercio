import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { EstoqueService } from './estoque.service';
import { MovimentarEstoqueDto } from './dto/movimentar-estoque.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('estoque')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('dono', 'gerente')
export class EstoqueController {
  constructor(private readonly estoqueService: EstoqueService) {}

  @Get('movimentos')
  listarMovimentos(@Query('produto_id') produtoId?: string) {
    return this.estoqueService.listarMovimentos(produtoId ? Number(produtoId) : undefined);
  }

  @Post('movimentar')
  movimentar(@Body() dto: MovimentarEstoqueDto, @Req() req: any) {
    return this.estoqueService.movimentar(dto, req.user?.id);
  }
}
