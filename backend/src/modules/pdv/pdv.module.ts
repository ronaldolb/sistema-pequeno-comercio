import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Produto } from '../produtos/produto.entity';
import { Venda } from '../vendas/venda.entity';
import { VendaItem } from '../vendas/venda-item.entity';
import { PdvService } from './pdv.service';
import { PdvController } from './pdv.controller';
import { EstoqueModule } from '../estoque/estoque.module';
import { FinanceiroModule } from '../financeiro/financeiro.module';

@Module({
  imports: [TypeOrmModule.forFeature([Produto, Venda, VendaItem]), EstoqueModule, FinanceiroModule],
  controllers: [PdvController],
  providers: [PdvService],
})
export class PdvModule {}
