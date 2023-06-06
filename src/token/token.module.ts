import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './token.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [TokenService],
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
    JwtModule.register({
      secret: process.env.PRIVATE_KEY || 'SECRET',
      signOptions: {
        expiresIn: '1h',
      },
    }),
    TypeOrmModule.forFeature([Token]),
  ],
  exports: [TokenService, JwtModule],
})
export class TokenModule {}
