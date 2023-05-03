import { MessagePattern, Payload } from '@nestjs/microservices';
import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from './users/users.service';
import { User } from './users/users.entity';
import { UserDto } from './users/dto/user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private usersService: UsersService,
  ) {}

  @MessagePattern('login')
  @Post('login')
  async login(@Payload() data: { dto: UserDto }) {
    return await this.usersService.login(data.dto);
  }

  @MessagePattern('logout')
  @Post('logout')
  async logout(@Payload() data: { refreshToken: string }) {
    return await this.usersService.logout(data.refreshToken);
  }

  @MessagePattern('refresh')
  @Post('refresh')
  async refresh(@Payload() data: { refreshToken: string }) {
    return await this.usersService.refresh(data.refreshToken);
  }
  @MessagePattern('activate')
  @Post('activate')
  async activate(@Payload() data: { activationLink: string }) {
    return await this.usersService.activate(data.activationLink);
  }
  @MessagePattern('create_user')
  @Post()
  async create(@Payload() data: { dto: UserDto }): Promise<{
    user: User;
    tokens: { accessToken: string; refreshToken: string };
  }> {
    return await this.usersService.registration(data.dto);
  }

  @MessagePattern('delete_user')
  async delete(@Payload() data: { userId: number }): Promise<User> {
    return await this.usersService.deleteUser(data.userId);
  }
}
