import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstoqueMovimento } from './estoque-movimento.entity';
import { Produto } from '../produtos/produto.entity';
import { EstoqueService } from './estoque.service';
import { EstoqueController } from './estoque.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EstoqueMovimento, Produto])],
  controllers: [EstoqueController],
  providers: [EstoqueService],
  exports: [EstoqueService],
})
export class EstoqueModule {}
