import { Repository } from 'typeorm';

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { TypeORMTestingModule } from './test-utils/TypeORMTestingModule';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './users/users.entity';
import { Token } from './token/token.entity';
import { UsersService } from './users/users.service';
import { UserDto } from './users/dto/user.dto';
import { TokenModule } from './token/token.module';
import { MailModule } from './mail/mail.module';
import { UsersModule } from './users/users.module';
import { HttpException } from '@nestjs/common';
import {OAuthProvider} from "./users/oauth-provider.entity";

describe('auth Controller', () => {
  let controller: AuthController;
  let userService: UsersService;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const authModule: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: `.${process.env.NODE_ENV}.env`,
        }),

        TypeORMTestingModule([User, Token, OAuthProvider]),
        TypeOrmModule.forFeature([User, Token, OAuthProvider]),

        TokenModule,
        MailModule,
        UsersModule,
      ],
      providers: [AuthService],
      controllers: [AuthController],
    }).compile();

    controller = authModule.get<AuthController>(AuthController);
    userService = authModule.get<UsersService>(UsersService);
    userRepository = await userService.getRepository();

    const app = authModule.createNestApplication();
    const connection = userRepository.manager.connection;
    await connection.synchronize(true);
    await app.init();

    jest.spyOn(userService, 'getUserRoles').mockImplementation(async () => {
      return ['USER'];
    });
  });
  describe('users CRUD', () => {
    it('create new user with correct properties', async () => {
      const dto: UserDto = {
        email: 'test211@mail.com',
        password: '12345',
        provider: 'local',
        vkId: null,
      };
      await userService.registration(dto);
      const getUserResult = await userService.getUserByEmail(dto.email);
      expect(dto.email).toEqual(getUserResult.email);
    });
    it('should delete user', async () => {
      const dto: UserDto = {
        email: 'test21t@mail.com',
        password: '12345',
        provider: 'local',
        vkId: null,
      };
      await userService.createUser(dto);

      let getUserResult = await userService.getUserByEmail(dto.email);
      await userService.deleteUser(getUserResult.id);
      getUserResult = await userService.getUserByEmail(dto.email);
      expect(getUserResult).toBeNull();
    });

    it('should get user', async () => {
      const dto: UserDto = {
        email: 'test212@mail.com',
        password: '12345',
        provider: 'local',
        vkId: null,
      };
      await userService.createUser(dto);

      const getUserResult = await userService.getUserByEmail(dto.email);
      expect(getUserResult.email).toEqual(dto.email);
      expect(getUserResult.password).toBeDefined();
    });

    it('should update user', async () => {
      const dto: UserDto = {
        email: 'test213@mail.com',
        password: '12345',
        provider: 'local',
        vkId: null,
      };
      await userService.createUser(dto);
      let getUserResult = await userService.getUserByEmail(dto.email);

      const newDto: UserDto = {
        email: 'newtest213@mail.com',
        password: '12345678',
        provider: 'local',
        vkId: null,
      };

      await userService.updateUser(getUserResult.id, newDto);
      getUserResult = await userService.getUserByEmail(newDto.email);
      expect(getUserResult.email).toEqual(newDto.email);
      expect(getUserResult.password).toBeDefined();
    });

    it('should return all users', async () => {
      const getUsersResult = await userService.getAllUsers();
      expect(getUsersResult).toBeDefined();
    });
  });
  describe('auth methods', () => {
    const testUserDto: UserDto = {
      email: 'test_email2@mail.com',
      password: 'pass',
      provider: 'local',
      vkId: null,
    };
    beforeAll(async () => {
      await userService.registration(testUserDto);
    });
    it('login should return correct data', async () => {
      const loginResult = await controller.login({ dto: testUserDto });
      expect(loginResult.user.email).toBeDefined();
      expect(loginResult.refreshToken).toBeDefined();
      expect(loginResult.accessToken).toBeDefined();
    });
    it('login should return error with incorrect credentials', async () => {
      const loginFunc = async () =>
        await controller.login({
          dto: {
            email: 'a@a.com',
            password: 'asd',
            vkId: null,
            provider: 'local',
          },
        });
      await expect(loginFunc()).rejects.toThrow(HttpException);
    });
  });
});
