import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';
import { TokenModule } from '../token/token.module';
import { Token } from '../token/token.entity';
import { MailModule } from '../mail/mail.module';
import { ClientsModule, Transport } from "@nestjs/microservices";

const databaseHost = process.env.DB_HOST || 'localhost';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: databaseHost,
      port: 5432,
      username: 'admin',
      password: 'admin',
      database: 'auth',
      entities: [User, Token],
      synchronize: true,
    }),
/*    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD.toString(),
      database: process.env.POSTGRES_DB,
      entities: [User, Token],
      synchronize: true,
    }),*/
    ClientsModule.registerAsync([
      {
        name: 'TO_ROLES_MS',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RMQ_URL')],
            queue: 'toRolesMs',
            queueOptions: {
              durable: false,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    TokenModule,
    MailModule,
    TypeOrmModule.forFeature([User, Token]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
