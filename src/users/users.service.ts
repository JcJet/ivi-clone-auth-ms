import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { UserDto } from './dto/user.dto';
import { AddRoleDto } from './dto/add-role.dto';
import { BanUserDto } from './dto/ban-user.dto';
import { RolesService } from './roles/roles.service';
import { Role } from './roles/roles.entity';
import * as bcrypt from 'bcrypt';
import { TokenService } from '../token/token.service';
import * as uuid from 'uuid';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private rolesService: RolesService,
    private tokenService: TokenService,
    private mailService: MailService,
  ) {}
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

    const payload = { userId: user.id, email: user.email };
    const tokens = this.tokenService.generateTokens(payload);
    return { user: user, tokens: tokens };
  }
  // Создание пользователя в базе данных
  async createUser(dto: UserDto): Promise<User> {
    const userInsertResult = await this.usersRepository.insert(dto);
    const role = await this.rolesService.getRoleByValue('ADMIN');
    const createdUserId = userInsertResult.raw[0].id;
    const user = await this.usersRepository.findOneBy({ id: createdUserId });
    user.roles = [role];
    await this.usersRepository.save(user);
    return user;
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
    const payload = { userId: user.id, email: user.email };
    const tokens = this.tokenService.generateTokens({ payload });
    await this.tokenService.saveToken(user.id, tokens.refreshToken);
    return { ...tokens, user };
  }

  async logout(refreshToken: string) {
    return await this.tokenService.removeToken(refreshToken);
  }
  // Поиск пользователя по email
  async getUserByEmail(email: string): Promise<User> {
    return await this.usersRepository.findOne({
      where: { email },
      relations: { roles: true },
    });
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException({
        message: 'Refresh токен отсутствует',
      });
    }
    const userData = this.tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await this.tokenService.findToken(refreshToken);
    console.log(userData);
    console.log(tokenFromDb);
    if (!userData || !tokenFromDb) {
      throw new UnauthorizedException({
        message: 'Неверный токен',
      });
    }
    const user = await this.usersRepository.findOneBy({
      id: userData.userId,
    });
    const payload = { userId: user.id, email: user.email };
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
    return await this.usersRepository.find({ relations: { roles: true } });
  }

  // Добавление роли пользователя
  async addRole(dto: AddRoleDto): Promise<Role> {
    const user = await this.usersRepository.findOneBy({ id: dto.userId });
    const role = await this.rolesService.getRoleByValue(dto.value);
    if (role && user) {
      // TODO: user roles - добавить, не заменить
      user.roles = [role];
      await this.usersRepository.save(user);
      return role;
    }
    throw new HttpException(
      'Пользователь или роль не найдены',
      HttpStatus.NOT_FOUND,
    );
  }

  // Заблокировать пользователя
  async ban(dto: BanUserDto): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id: dto.userId });
    if (!user) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }
    user.banned = true;
    user.bannedReason = dto.banReason;
    await this.usersRepository.save(user);
    return user;
  }

  // Изменение данных пользователя
  async updateUser(id: number, dto: UserDto): Promise<User> {
    // TODO: try Repository.update({ id }, dto);
    const updateResult = await this.usersRepository
      .createQueryBuilder()
      .update()
      .set({
        password: dto.password,
        email: dto.email,
      })
      .where({ id })
      .execute();
    return updateResult.raw[0];
  }

  // Удаление пользователя по id
  async deleteUser(id: number): Promise<User> {
    const deleteResult = await this.usersRepository
      .createQueryBuilder()
      .createQueryBuilder()
      .delete()
      .from(User)
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return deleteResult.raw[0];
  }
}
