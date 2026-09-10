import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ProdutosService } from './produtos.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('produtos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  @Get()
  listar() {
    return this.produtosService.listar();
  }

  @Get('estoque-baixo')
  listarEstoqueBaixo() {
    return this.produtosService.listarEstoqueBaixo();
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.produtosService.buscarPorId(id);
  }

  @Post()
  @Roles('dono', 'gerente')
  criar(@Body() dto: CreateProdutoDto) {
    return this.produtosService.criar(dto);
  }

  @Patch(':id')
  @Roles('dono', 'gerente')
  atualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProdutoDto) {
    return this.produtosService.atualizar(id, dto);
  }

  @Delete(':id')
  @Roles('dono', 'gerente')
  remover(@Param('id', ParseIntPipe) id: number) {
    return this.produtosService.remover(id);
  }
}
