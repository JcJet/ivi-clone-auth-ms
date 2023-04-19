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

  // Вход в систему, возвращает токен
  async login(userDto: UserDto) {
    const user = await this.validateUser(userDto);
    return this.generateToken(user);
  }

  // Регистрация нового пользователя
  async registration(userDto: UserDto): Promise<{ User: User; Token: string }> {
    const candidate = await this.usersService.getUserByEmail(userDto.email);

    if (candidate) {
      //TODO: returns internal server error in response, not good.
      throw new HttpException(
        'Пользователь с таким email уже существует',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashPassword = await bcrypt.hash(userDto.password, 5);
    const user = await this.usersService.createUser({
      ...userDto,
      password: hashPassword,
    });
    const token = await this.generateToken(user);
    return { User: user, Token: token };
  }

  // Генерация токена для авторизации
  private async generateToken(user: User): Promise<string> {
    const payload = { email: user.email, id: user.id, roles: user.roles };
    return this.jwtService.sign(payload);
  }

  private async validateUser(userDto: UserDto): Promise<User> {
    const user = await this.usersService.getUserByEmail(userDto.email);

    const passwordEquals = await bcrypt.compare(
      userDto.password,
      user.password,
    );
    if (user && passwordEquals) {
      return user;
    }
    throw new UnauthorizedException({
      message: 'Некорректный email или пароль',
    });
  }
}
