import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produto } from './produto.entity';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';

@Injectable()
export class ProdutosService {
  constructor(
    @InjectRepository(Produto)
    private readonly produtosRepo: Repository<Produto>,
  ) {}

  listar(): Promise<Produto[]> {
    return this.produtosRepo.find({ order: { categoria: 'ASC', nome: 'ASC' } });
  }

  listarAtivos(): Promise<Produto[]> {
    return this.produtosRepo.find({ where: { ativo: true }, order: { categoria: 'ASC', nome: 'ASC' } });
  }

  listarEstoqueBaixo(): Promise<Produto[]> {
    // SQLite não tem comparação direta entre duas colunas via find(); usa query builder.
    return this.produtosRepo
      .createQueryBuilder('produto')
      .where('produto.estoque_atual <= produto.estoque_minimo')
      .andWhere('produto.ativo = :ativo', { ativo: true })
      .orderBy('produto.estoque_atual', 'ASC')
      .getMany();
  }

  async buscarPorId(id: number): Promise<Produto> {
    const produto = await this.produtosRepo.findOne({ where: { id } });
    if (!produto) throw new NotFoundException('Produto não encontrado.');
    return produto;
  }

  criar(dto: CreateProdutoDto): Promise<Produto> {
    const produto = this.produtosRepo.create(dto);
    return this.produtosRepo.save(produto);
  }

  async atualizar(id: number, dto: UpdateProdutoDto): Promise<Produto> {
    const produto = await this.buscarPorId(id);
    Object.assign(produto, dto);
    return this.produtosRepo.save(produto);
  }

  async remover(id: number): Promise<void> {
    const produto = await this.buscarPorId(id);
    // Não removemos fisicamente: preserva histórico de vendas/estoque que referenciam o produto.
    produto.ativo = false;
    await this.produtosRepo.save(produto);
  }
}
