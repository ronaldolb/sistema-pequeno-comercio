import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venda } from '../vendas/venda.entity';
import { Produto } from '../produtos/produto.entity';
import { Conta } from '../financeiro/conta.entity';
import { RelatoriosService } from './relatorios.service';
import { RelatoriosController } from './relatorios.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Venda, Produto, Conta])],
  controllers: [RelatoriosController],
  providers: [RelatoriosService],
})
export class RelatoriosModule {}
