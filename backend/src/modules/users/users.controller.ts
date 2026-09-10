import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

// Gestão de usuários é restrita ao dono: quem entra/sai do sistema e com qual papel.
@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('dono')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  listar() {
    return this.usersService.listar();
  }

  @Post()
  criar(@Body() dto: CreateUsuarioDto) {
    return this.usersService.criar(dto);
  }

  @Delete(':id')
  desativar(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.desativar(id);
  }
}
