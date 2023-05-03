import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity(`tokens`)
export class Token {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: '1', description: 'Идентификатор пользователя' })
  @Column({ type: 'numeric' })
  userId: number;

  @ApiProperty({
    example:
      'yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFt' +
      'ZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf' +
      '36POk6yJV_adQssw5c',
    description: 'Рефреш токен',
  })
  @Column({ type: 'varchar' })
  refreshToken: string;
}
