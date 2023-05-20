import {
  HttpException,
  HttpStatus, Inject,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { UserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { TokenService } from '../token/token.service';
import * as uuid from 'uuid';
import { MailService } from '../mail/mail.service';
import { lastValueFrom } from "rxjs";
import { ClientProxy } from "@nestjs/microservices";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private tokenService: TokenService,
    private mailService: MailService,
    @Inject('TO_ROLES_MS') private toRolesProxy: ClientProxy,
  ) {}
  async getUserRoles(userId) {
    return await lastValueFrom(
      this.toRolesProxy.send({ cmd: 'getUserRoles' }, { userId }),
    );
  }
  // payload для jwt-токенов
  async generatePayload(user: User) {
    const roles = await this.getUserRoles(user.id);
    const rolesValues = await roles.map((role) => role.value);
    return { userId: user.id, email: user.email, roles: rolesValues };
  }
  // Регистрация нового пользователя
  async registration(dto: UserDto) {
    const candidate = await this.getUserByEmail(dto.email);

    if (candidate) {
      //TODO: returns internal server error in response, not good.
      throw new HttpException(
        'Пользователь с таким email уже существует',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashPassword = await bcrypt.hash(dto.password, 5);
    const activationLink = uuid.v4();

    const user = await this.createUser({
      ...dto,
      password: hashPassword,
    });
    await this.mailService.sendActivationMail(
      user.email,
      `${process.env.API_URL}/api/activate/${activationLink}`,
    );
    user.activationLink = activationLink;
    await this.usersRepository.save(user);

    const payload = await this.generatePayload(user);
    const tokens = this.tokenService.generateTokens(payload);
    return { user: user, tokens: tokens };
  }
  // Создание пользователя в базе данных
  async createUser(dto: UserDto): Promise<User> {
    const userInsertResult = await this.usersRepository.insert(dto);
    return userInsertResult.raw[0];
  }
  // Вход в систему, возвращает токены и пользователя
  async login(userDto: UserDto) {
    const user = await this.getUserByEmail(userDto.email);
    if (!user) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }
    const passwordEquals = await bcrypt.compare(
      userDto.password,
      user.password,
    );
    if (!passwordEquals) {
      throw new UnauthorizedException({
        message: 'Неверный пароль',
      });
    }
    const payload = await this.generatePayload(user);
    const tokens = this.tokenService.generateTokens(payload);
    await this.tokenService.saveToken(user.id, tokens.refreshToken);
    return { ...tokens, user };
  }

  async logout(refreshToken: string) {
    return await this.tokenService.removeToken(refreshToken);
  }
  // Поиск пользователя по email
  async getUserByEmail(email: string): Promise<User> {
    return await this.usersRepository.findOneBy({ email });
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException({
        message: 'Refresh токен отсутствует',
      });
    }
    const userData = this.tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await this.tokenService.findToken(refreshToken);
    if (!userData || !tokenFromDb) {
      throw new UnauthorizedException({
        message: 'Неверный токен',
      });
    }
    const user = await this.usersRepository.findOneBy({
      id: userData.userId,
    });
    const payload = await this.generatePayload(user);
    const tokens = this.tokenService.generateTokens(payload);
    await this.tokenService.saveToken(user.id, tokens.refreshToken);
    return { ...tokens, user };
  }

  async activate(activationLink: string) {
    const user = await this.usersRepository.findOneBy({ activationLink });
    if (!user) {
      throw new HttpException(
        'Неккоректная ссылка активации',
        HttpStatus.BAD_REQUEST,
      );
    }
    user.isActivated = true;
    await this.usersRepository.save(user);
  }

  // Получение всех пользователей
  async getAllUsers(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  // Изменение данных пользователя
  async updateUser(id: number, dto: UserDto): Promise<User> {
    const hashPassword = await bcrypt.hash(dto.password, 5);
    const updateResult = await this.usersRepository.update(
      { id },
      {
        password: hashPassword,
        email: dto.email,
      },
    );
    return updateResult.raw[0];
  }

  // Удаление пользователя по id
  async deleteUser(id: number): Promise<User> {
    const deleteResult = await this.usersRepository.delete({ id });
    return deleteResult.raw;
  }
}
