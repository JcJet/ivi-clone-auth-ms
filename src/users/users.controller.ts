import {Controller, Delete, Post, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { Payload } from '@nestjs/microservices';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  //TODO: these ivi-clone-endpoints-ms are probably won't be needed - remove controller
  @Post()
  async create(@Payload() data: any) {
    return this.usersService.createUser(data);
  }

  @Post()
  async get_by_email(@Payload() data: any) {
    return this.usersService.getUserByEmail(data);
  }

  @Delete()
  async delete(@Payload() data: any) {
    return this.usersService.deleteUser(data.userId);
  }

  @Put()
  async update(@Payload() data: any) {
    return this.usersService.updateUser(data.userId, data.dto);
  }
}
