import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from './users/users.entity';
import { UsersModule } from './users/users.module';
import { TokenModule } from './token/token.module';
import { MailModule } from './mail/mail.module';
import { Token } from './token/token.entity';
import { GoogleStrategy } from './auth-strategies/google.strategy';
import { OAuthProvider } from './users/oauth-provider.entity';

// Модуль авторизации и проверки доступа

@Module({
  providers: [AuthService, GoogleStrategy],
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [User, Token, OAuthProvider],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Token, OAuthProvider]),
    TokenModule,
    MailModule,
    UsersModule,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
