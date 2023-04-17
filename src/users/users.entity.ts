import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from './roles/roles.entity';

@Entity(`users`)
export class User {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'User1', description: 'Логин пользователя' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  login: string;

  //Email string in limited to 254 according to errata against RFC 3696 https://www.rfc-editor.org/errata_search.php?rfc=3696
  @ApiProperty({
    example: 'user@gmail.com',
    description: 'Адрес электронной почты',
  })
  @Column({ type: 'varchar', length: 254, nullable: true })
  email: string;

  @ApiProperty({ example: '12345', description: 'Пароль пользователя' })
  @Column({ type: 'varchar', length: 255 })
  password: string;

  @ApiProperty({ example: 'false', description: 'Забанен или нет' })
  @Column({ type: 'boolean', default: false })
  banned: boolean;

  @ApiProperty({ example: 'спам', description: 'Причина блокировки' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  bannedReason: string;

  @ManyToMany(() => Role, (role) => role.users, { onDelete: 'CASCADE' })
  roles: Role[];

}
