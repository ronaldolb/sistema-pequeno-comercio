import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../../modules/users/usuario.entity';
import { Produto } from '../../modules/produtos/produto.entity';
import { EstoqueMovimento } from '../../modules/estoque/estoque-movimento.entity';
import { Venda } from '../../modules/vendas/venda.entity';
import { VendaItem } from '../../modules/vendas/venda-item.entity';
import { Conta } from '../../modules/financeiro/conta.entity';
import { MovimentoCaixa } from '../../modules/financeiro/movimento-caixa.entity';

/**
 * Cria o primeiro usuário (dono) e alguns produtos de exemplo, só para o sistema não
 * começar totalmente vazio. Rode com: npm run seed
 */
async function main() {
  const dataSource = new DataSource({
    type: 'better-sqlite3',
    database: process.env.DATABASE_FILE || 'pequeno_comercio.db',
    entities: [Usuario, Produto, EstoqueMovimento, Venda, VendaItem, Conta, MovimentoCaixa],
    synchronize: true,
  });

  await dataSource.initialize();

  const usuariosRepo = dataSource.getRepository(Usuario);
  const jaExisteDono = await usuariosRepo.findOne({ where: { email: 'dono@meucomercio.com' } });

  if (!jaExisteDono) {
    const senha_hash = await bcrypt.hash('admin123', 10);
    await usuariosRepo.save(
      usuariosRepo.create({
        nome: 'Administrador',
        email: 'dono@meucomercio.com',
        senha_hash,
        papel: 'dono',
      }),
    );
    console.log('Usuário dono criado: dono@meucomercio.com / senha: admin123 (troque depois do primeiro login)');
  } else {
    console.log('Usuário dono já existia, nada foi alterado.');
  }

  const produtosRepo = dataSource.getRepository(Produto);
  const totalProdutos = await produtosRepo.count();
  if (totalProdutos === 0) {
    await produtosRepo.save([
      produtosRepo.create({
        nome: 'Produto exemplo (unidade)',
        categoria: 'Geral',
        unidade: 'un',
        preco: 9.9,
        estoque_atual: 50,
        estoque_minimo: 10,
        codigo_interno: 'EX-001',
      }),
      produtosRepo.create({
        nome: 'Produto exemplo (peso)',
        categoria: 'Geral',
        unidade: 'kg',
        preco: 24.9,
        estoque_atual: 20,
        estoque_minimo: 5,
        codigo_interno: 'EX-002',
      }),
    ]);
    console.log('Produtos de exemplo criados. Edite/apague na tela de Produtos.');
  }

  await dataSource.destroy();
}

main().catch((err) => {
  console.error('Erro ao rodar o seed:', err);
  process.exit(1);
});
