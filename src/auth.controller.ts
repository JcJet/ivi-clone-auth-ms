import { MessagePattern, Payload } from '@nestjs/microservices';
import { Controller, Post, UseFilters } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from './users/users.service';
import { User } from './users/users.entity';
import { UserDto } from './users/dto/user.dto';
import { HttpExceptionFilter } from './http-exception.filter';
import {UpdateResult} from "typeorm";

@Controller()
@UseFilters(new HttpExceptionFilter())
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private usersService: UsersService,
  ) {}

  @MessagePattern({ cmd: 'login' })
  @Post('login')
  async login(@Payload() data: { dto: UserDto }) {
    return await this.usersService.login(data.dto);
  }

  @MessagePattern({ cmd: 'logout' })
  @Post('logout')
  async logout(@Payload() data: { refreshToken: string }) {
    return await this.usersService.logout(data.refreshToken);
  }

  @MessagePattern({ cmd: 'refresh' })
  @Post('refresh')
  async refresh(@Payload() data: { refreshToken: string }) {
    return await this.usersService.refresh(data.refreshToken);
  }

  @MessagePattern({ cmd: 'activate' })
  @Post('activate')
  async activateUser(@Payload() data: { activationLink: string }) {
    return await this.usersService.activate(data.activationLink);
  }

  @MessagePattern({ cmd: 'createUser' })
  @Post()
  async createUser(@Payload() data: { dto: UserDto }): Promise<{
    user: User;
    tokens: { accessToken: string; refreshToken: string };
  }> {
    return await this.usersService.registration(data.dto);
  }

  @MessagePattern({ cmd: 'deleteUser' })
  async deleteUse(@Payload() data: { userId: number }): Promise<User> {
    return await this.usersService.deleteUser(data.userId);
  }

  @MessagePattern({ cmd: 'updateUser' })
  async updateUser(
    @Payload() data: { id: number; dto: UserDto },
  ): Promise<UpdateResult> {
    return await this.usersService.updateUser(data.id, data.dto);
  }
  @MessagePattern({ cmd: 'getUser' })
  async getUser(
    @Payload() data: { email: string; vkId: number; userId: number },
  ) {
    return await this.usersService.getUser(data.email, data.vkId, data.userId);
  }
}
