import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Venda } from './venda.entity';

@Injectable()
export class VendasService {
  constructor(
    @InjectRepository(Venda)
    private readonly vendasRepo: Repository<Venda>,
  ) {}

  listar(inicio?: string, fim?: string): Promise<Venda[]> {
    if (inicio && fim) {
      return this.vendasRepo.find({
        where: { data_hora: Between(new Date(inicio), new Date(fim)) },
        order: { data_hora: 'DESC' },
      });
    }
    return this.vendasRepo.find({ order: { data_hora: 'DESC' }, take: 100 });
  }

  async buscarPorId(id: number): Promise<Venda> {
    const venda = await this.vendasRepo.findOne({ where: { id } });
    if (!venda) throw new NotFoundException('Venda não encontrada.');
    return venda;
  }
}
