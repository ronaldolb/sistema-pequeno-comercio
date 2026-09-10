import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProdutosModule } from './modules/produtos/produtos.module';
import { EstoqueModule } from './modules/estoque/estoque.module';
import { VendasModule } from './modules/vendas/vendas.module';
import { PdvModule } from './modules/pdv/pdv.module';
import { FinanceiroModule } from './modules/financeiro/financeiro.module';
import { RelatoriosModule } from './modules/relatorios/relatorios.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    UsersModule,
    AuthModule,
    ProdutosModule,
    EstoqueModule,
    VendasModule,
    PdvModule,
    FinanceiroModule,
    RelatoriosModule,
  ],
})
export class AppModule {}
