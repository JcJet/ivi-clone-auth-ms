import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserDto } from './users/dto/user.dto';
import { User } from './users/users.entity';
import { UsersService } from './users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}


/*  // Генерация токена для авторизации
  private async generateToken(user: User): Promise<string> {
    const payload = { email: user.email, id: user.id, roles: user.roles };
    return this.jwtService.sign(payload);
  }*/


}
