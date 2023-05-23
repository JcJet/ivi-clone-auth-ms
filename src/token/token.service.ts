import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from './token.entity';
import { Injectable } from '@nestjs/common';
@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
    private jwtService: JwtService,
  ) {}
  generateTokens(payload) {
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15s',
      secret: process.env.JWT_ACCESS_SECRET,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '30s',
      secret: process.env.JWT_REFRESH_SECRET,
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  validateAccessToken(token) {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
    } catch (e) {
      return null;
    }
  }

  validateRefreshToken(token) {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch (e) {
      return null;
    }
  }

  async saveToken(userId: number, refreshToken: string) {
    const tokenData = await this.tokenRepository.findOneBy({ userId });
    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      return this.tokenRepository.save(tokenData);
    }
    return await this.tokenRepository.insert({ userId, refreshToken });
  }

  async removeToken(refreshToken) {
    return await this.tokenRepository.delete({ refreshToken });
  }

  async findToken(refreshToken) {
    return await this.tokenRepository.findOneBy({ refreshToken });
  }
}
