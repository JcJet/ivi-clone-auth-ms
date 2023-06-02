import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { UserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { TokenService } from '../token/token.service';
import * as uuid from 'uuid';
import { MailService } from '../mail/mail.service';
import { lastValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { OAuthProvider } from './oauth-provider.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(OAuthProvider)
    private oauthRepository: Repository<OAuthProvider>,
    private tokenService: TokenService,
    private mailService: MailService,
    private configService: ConfigService,
    @Inject('TO_ROLES_MS') private toRolesProxy: ClientProxy,
  ) {}
  async getRepository() {
    return this.usersRepository;
  }
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
  private async createOAuthProvider(provider: string, user: User) {
    return this.oauthRepository.insert({
      provider,
      user,
    });
  }
  // Регистрация нового пользователя
  async registration(dto: UserDto) {
    const formattedEmail = dto.email.toLowerCase();
    const provider = dto?.provider || 'local';
    const candidate = await this.getUserByEmail(formattedEmail);
    if (candidate) {
      //TODO: returns internal server error in response, not good.
      throw new HttpException(
        'Пользователь с таким email уже существует',
        HttpStatus.CONFLICT,
      );
    }

    const hashPassword = await bcrypt.hash(dto.password, 5);
    const activationLink = uuid.v4();

    const user = await this.createUser({
      email: formattedEmail,
      password: hashPassword,
      provider: provider,
      vkId: dto.vkId,
    });
    const existingProvider = await this.oauthRepository.findOneBy({
      provider: provider,
      user,
    });
    if (!existingProvider) {
      await this.createOAuthProvider(provider, user);
    }
    await this.mailService.sendActivationMail(
      user.email,
      `${this.configService.get('API_URL')}/api/activate/${activationLink}`,
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
    const provider = userDto?.provider || 'local';
    const user = await this.usersRepository.findOne({
      where: { email: userDto.email },
      relations: ['oauthProviders'],
    });

    if (!user) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }

    const providerFound = user.oauthProviders.find(
      (p) => p.provider == provider,
    );
    if (!providerFound) {
      const providerInsertResult = await this.oauthRepository.insert({
        provider,
        user,
      });
      user.oauthProviders.push(providerInsertResult.raw[0]);
      await this.oauthRepository.save(user);
    }

    const passwordEquals = await bcrypt.compare(
      userDto.password,
      user.password,
    );
    if (!passwordEquals && provider == 'local') {
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


  async getUser(email: string, vkId: number) {
    if (email) {
      return this.getUserByEmail(email);
    } else if (vkId) {
      return this.usersRepository.findOneBy({ vkId });
    }
  }
}
