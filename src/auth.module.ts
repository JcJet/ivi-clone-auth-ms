import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from './users/users.entity';
import { UsersModule } from './users/users.module';
import { TokenModule } from './token/token.module';
import { MailModule } from './mail/mail.module';

// Модуль авторизации и проверки доступа
const databaseHost = process.env.POSTGRES_HOST || 'localhost';
@Module({
  providers: [AuthService],
  imports: [
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: databaseHost,
      port: 5432,
      username: 'postgres',
      password: 'my_password',
      database: 'my_database',
      entities: [User],
      synchronize: true,
    }),
/*    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD.toString(),
      database: process.env.POSTGRES_DB,
      entities: [User],
      synchronize: true,
    }),*/
    TypeOrmModule.forFeature([User]),
    TokenModule,
    MailModule,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
