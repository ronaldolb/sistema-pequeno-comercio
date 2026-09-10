import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venda } from './venda.entity';
import { VendaItem } from './venda-item.entity';
import { VendasService } from './vendas.service';
import { VendasController } from './vendas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Venda, VendaItem])],
  controllers: [VendasController],
  providers: [VendasService],
  exports: [VendasService],
})
export class VendasModule {}
