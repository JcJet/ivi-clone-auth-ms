import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RmqModule } from '@app/common';
import { ConfigModule } from '@nestjs/config';
import { User } from './users/users.entity';
import { Role } from './users/roles/roles.entity';
import { UsersModule } from './users/users.module';
import { Token } from "./token/token.entity";
import { TokenModule } from './token/token.module';
import { MailModule } from './mail/mail.module';

// Модуль авторизации и проверки доступа

@Module({
  providers: [AuthService],
  imports: [
    RmqModule,
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
      //envFilePath: './apps/auth/.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD.toString(),
      database: process.env.POSTGRES_DB,
      entities: [User, Role],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Role]),
    TokenModule,
    MailModule,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
