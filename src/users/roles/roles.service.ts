import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './roles.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  // Создание роли
  async createRole(dto: CreateRoleDto): Promise<Role> {
    const roleInsertResult = await this.roleRepository.insert(dto);
    const createdRoleId: number = roleInsertResult.raw[0].id;
    return await this.roleRepository.findOneBy({ id: createdRoleId });
  }

  // Получение экземпляра роли по ее значению
  async getRoleByValue(value: string): Promise<Role> {
    let role = await this.roleRepository.findOne({ where: { value } });
    if (!role) {
      role = await this.createRole({ value, description: '' });
    }
    return role;
  }
}
