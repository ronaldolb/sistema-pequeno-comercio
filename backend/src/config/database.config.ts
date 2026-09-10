import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Usuario } from '../modules/users/usuario.entity';
import { Produto } from '../modules/produtos/produto.entity';
import { EstoqueMovimento } from '../modules/estoque/estoque-movimento.entity';
import { Venda } from '../modules/vendas/venda.entity';
import { VendaItem } from '../modules/vendas/venda-item.entity';
import { Conta } from '../modules/financeiro/conta.entity';
import { MovimentoCaixa } from '../modules/financeiro/movimento-caixa.entity';

// SQLite: banco em um único arquivo, sem precisar instalar/configurar um servidor de banco de
// dados separado. Ideal para o cenário de pequeno comércio (um único PDV/estabelecimento).
export const databaseConfig: TypeOrmModuleOptions = {
  type: 'better-sqlite3',
  database: process.env.DATABASE_FILE || 'pequeno_comercio.db',
  entities: [Usuario, Produto, EstoqueMovimento, Venda, VendaItem, Conta, MovimentoCaixa],
  synchronize: true, // ok para um projeto pequeno / começo de desenvolvimento; trocar por migrations antes de produção com dados críticos
};
