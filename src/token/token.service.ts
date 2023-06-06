import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import {DeleteResult, InsertResult, Repository} from 'typeorm';
import { Token } from './token.entity';
import { Injectable } from '@nestjs/common';
import * as process from 'process';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly jwtService: JwtService,
  ) {}
  generateTokens(payload: string | object): {
    accessToken: string;
    refreshToken: string;
  } {
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_ACCESS_EXPIRATION,
      secret: process.env.JWT_ACCESS_SECRET,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_REFRESH_EXPIRATION,
      secret: process.env.JWT_REFRESH_SECRET,
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  validateAccessToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
    } catch (e) {
      return null;
    }
  }

  validateRefreshToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch (e) {
      return null;
    }
  }

  async saveToken(
    userId: number,
    refreshToken: string,
  ): Promise<Token | InsertResult> {
    const tokenData = await this.tokenRepository.findOneBy({ userId });
    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      return this.tokenRepository.save(tokenData);
    }
    return await this.tokenRepository.insert({ userId, refreshToken });
  }

  async removeToken(refreshToken: string): Promise<DeleteResult> {
    return await this.tokenRepository.delete({ refreshToken });
  }

  async findToken(refreshToken: string): Promise<Token> {
    return await this.tokenRepository.findOneBy({ refreshToken });
  }
}
