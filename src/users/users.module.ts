import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';
import { Role } from './roles/roles.entity';
import { RolesModule } from './roles/roles.module';
import { TokenModule } from '../token/token.module';
import { Token } from '../token/token.entity';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD.toString(),
      database: process.env.POSTGRES_DB,
      entities: [User, Role, Token],
      synchronize: true,
    }),
    RolesModule,
    TokenModule,
    MailModule,
    TypeOrmModule.forFeature([User, Role, Token]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
