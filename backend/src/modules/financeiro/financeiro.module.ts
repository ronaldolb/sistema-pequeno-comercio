import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conta } from './conta.entity';
import { MovimentoCaixa } from './movimento-caixa.entity';
import { FinanceiroService } from './financeiro.service';
import { FinanceiroController } from './financeiro.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Conta, MovimentoCaixa])],
  controllers: [FinanceiroController],
  providers: [FinanceiroService],
  exports: [FinanceiroService],
})
export class FinanceiroModule {}
