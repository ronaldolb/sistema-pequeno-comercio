import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
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
    // Serve o frontend já "buildado" (frontend/dist) direto pelo backend, pra rodar só um
    // processo em produção em vez de precisar de Nest + Vite abertos ao mesmo tempo.
    // Rotas /api/* continuam indo pros controllers normalmente (ficam de fora daqui).
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'frontend', 'dist'),
      exclude: ['/api/(.*)'],
    }),
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
