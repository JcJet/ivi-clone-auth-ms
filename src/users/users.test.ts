import { UsersService } from './users.service';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeORMTestingModule } from './test-utils/TypeORMTestingModule';
import { User } from './users.entity';
import { UserDto } from './dto/user.dto';

describe('UserService', () => {
  let service = null;
  beforeAll(() => {});
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeORMTestingModule([User]),
        TypeOrmModule.forFeature([User]),
      ],
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });
  it('should create new user', async () => {
    const dto: UserDto = {
      email: 'test211@mail.com',
      password: '12345',
    };
    await service.createUser(dto);
    const getUserResult = await service.getUserByEmail(dto.email);
    expect(dto.email).toEqual(getUserResult.email);
  });

  it('should delete user', async () => {
    const dto: UserDto = {
      email: 'test21t@mail.com',
      password: '12345',
    };
    await service.createUser(dto);

    let getUserResult = await service.getUserByEmail(dto.email);
    await service.deleteUser(getUserResult.id);
    getUserResult = await service.getUserByEmail(dto.email);
    expect(getUserResult).toBeNull();
  });

  it('should get user', async () => {
    const dto: UserDto = {
      email: 'test212@mail.com',
      password: '12345',
    };
    await service.createUser(dto);

    const getUserResult = await service.getUserByEmail(dto.email);
    expect(getUserResult).toEqual(
      expect.objectContaining({
        login: 'testLogin210',
        email: 'test212@mail.com',
      }),
    );
  });

  it('should update user', async () => {
    const dto: UserDto = {
      email: 'test213@mail.com',
      password: '12345',
    };
    await service.createUser(dto);
    let getUserResult = await service.getUserByEmail(dto.email);

    const newDto: UserDto = {
      email: 'newtest213@mail.com',
      password: '12345678',
    };

    await service.updateUser(getUserResult.id, newDto);
    getUserResult = await service.getUserByEmail(newDto.email);
    expect(getUserResult).toEqual(
      expect.objectContaining({
        login: 'newLogin210',
        email: 'newtest213@mail.com',
      }),
    );
  });

  it('should return all users', async () => {
    const getUsersResult = await service.getAllUsers();
    expect(getUsersResult).toBeDefined();
  });
  afterAll(async () => {
    const emails = [
      'test211@mail.com',
      'test21t@mail.com',
      'test212@mail.com',
      'test213@mail.com',
      'newtest213@mail.com',
      'test216@mail.com',
    ];
    for (const email of emails) {
      const getUserResult = await service.getUserByEmail(email);
      if (getUserResult) {
        await service.deleteUser(getUserResult.id);
      }
    }
  });
});
