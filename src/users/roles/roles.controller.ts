import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { Role } from './roles.entity';

@Controller('roles')
export class RolesController {
  constructor(private roleService: RolesService) {}

  // Эндпоинт для добавления новой роли
  @Post()
  create(@Body() roleDto: CreateRoleDto): Promise<Role> {
    return this.roleService.createRole(roleDto);
  }

  // Эндпоинт для получения роли по значению
  @Get('/:value')
  getByValue(@Param('value') value: string): Promise<Role> {
    return this.roleService.getRoleByValue(value);
  }
}
