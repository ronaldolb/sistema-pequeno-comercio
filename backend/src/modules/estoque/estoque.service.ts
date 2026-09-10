import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstoqueMovimento } from './estoque-movimento.entity';
import { Produto } from '../produtos/produto.entity';
import { MovimentarEstoqueDto } from './dto/movimentar-estoque.dto';

@Injectable()
export class EstoqueService {
  constructor(
    @InjectRepository(EstoqueMovimento)
    private readonly movimentosRepo: Repository<EstoqueMovimento>,
    @InjectRepository(Produto)
    private readonly produtosRepo: Repository<Produto>,
  ) {}

  listarMovimentos(produtoId?: number): Promise<EstoqueMovimento[]> {
    return this.movimentosRepo.find({
      where: produtoId ? { produto: { id: produtoId } } : {},
      order: { data_hora: 'DESC' },
      take: 200,
    });
  }

  /**
   * Registra uma movimentação e ajusta o estoque_atual do produto de forma atômica.
   * Usado tanto pelas telas de Estoque quanto internamente pelo PDV ao concluir uma venda.
   */
  async movimentar(dto: MovimentarEstoqueDto, usuarioId?: number): Promise<EstoqueMovimento> {
    const produto = await this.produtosRepo.findOne({ where: { id: dto.produto_id } });
    if (!produto) throw new BadRequestException('Produto não encontrado.');

    const atual = Number(produto.estoque_atual);
    const quantidade = Number(dto.quantidade);

    let novoEstoque: number;
    if (dto.tipo === 'entrada') {
      novoEstoque = atual + quantidade;
    } else if (dto.tipo === 'saida') {
      novoEstoque = atual - quantidade;
      if (novoEstoque < 0) {
        throw new BadRequestException(
          `Estoque insuficiente para "${produto.nome}" (disponível: ${atual}).`,
        );
      }
    } else {
      // ajuste: quantidade informada passa a ser o novo valor absoluto do estoque
      novoEstoque = quantidade;
    }

    produto.estoque_atual = novoEstoque;
    await this.produtosRepo.save(produto);

    const movimento = this.movimentosRepo.create({
      produto,
      tipo: dto.tipo,
      quantidade,
      motivo: dto.motivo,
      observacao: dto.observacao,
      usuario: usuarioId ? ({ id: usuarioId } as any) : null,
    });
    return this.movimentosRepo.save(movimento);
  }
}
