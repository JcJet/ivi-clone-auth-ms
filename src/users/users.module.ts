import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';
import { TokenModule } from '../token/token.module';
import { Token } from '../token/token.entity';
import { MailModule } from '../mail/mail.module';

const databaseHost = process.env.POSTGRES_HOST || 'localhost';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: databaseHost,
      port: 5432,
      username: 'postgres',
      password: 'my_password',
      database: 'my_database',
      entities: [User, Token],
      synchronize: true,
    }),
/*    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD.toString(),
      database: process.env.POSTGRES_DB,
      entities: [User, Token],
      synchronize: true,
    }),*/
    TokenModule,
    MailModule,
    TypeOrmModule.forFeature([User, Token]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
