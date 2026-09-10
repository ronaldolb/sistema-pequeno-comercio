import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepo: Repository<Usuario>,
  ) {}

  async listar(): Promise<Omit<Usuario, 'senha_hash'>[]> {
    const usuarios = await this.usuariosRepo.find({ order: { nome: 'ASC' } });
    return usuarios.map(({ senha_hash, ...resto }) => resto);
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    return this.usuariosRepo.findOne({ where: { email } });
  }

  async buscarPorId(id: number): Promise<Usuario> {
    const usuario = await this.usuariosRepo.findOne({ where: { id } });
    if (!usuario) throw new NotFoundException('Usuário não encontrado.');
    return usuario;
  }

  async criar(dto: CreateUsuarioDto): Promise<Omit<Usuario, 'senha_hash'>> {
    const existente = await this.buscarPorEmail(dto.email);
    if (existente) throw new ConflictException('Já existe um usuário com este e-mail.');

    const senha_hash = await bcrypt.hash(dto.senha, 10);
    const usuario = this.usuariosRepo.create({
      nome: dto.nome,
      email: dto.email,
      senha_hash,
      papel: dto.papel,
      ativo: dto.ativo ?? true,
    });
    const salvo = await this.usuariosRepo.save(usuario);
    const { senha_hash: _omit, ...resto } = salvo;
    return resto;
  }

  async desativar(id: number): Promise<void> {
    const usuario = await this.buscarPorId(id);
    usuario.ativo = false;
    await this.usuariosRepo.save(usuario);
  }
}
