import { MessagePattern, Payload } from '@nestjs/microservices';
import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from './users/users.service';
import { User } from './users/users.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private usersService: UsersService,
  ) {}

  @MessagePattern('profile_login')
  @Post('login')
  async login(@Payload() data: any) {
    return await this.authService.login(data.dto);
  }

  @MessagePattern('create_user')
  @Post()
  async create(@Payload() data: any): Promise<{ User: User; Token: string }> {
    return await this.authService.registration(data.dto);
  }

  @MessagePattern('delete_user')
  async delete(@Payload() data: { userId: number }): Promise<User> {
    return await this.usersService.deleteUser(data.userId);
  }
}
