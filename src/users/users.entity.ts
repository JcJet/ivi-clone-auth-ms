import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity(`users`)
export class User {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @PrimaryGeneratedColumn()
  id: number;

  //Email string in limited to 254 according to errata against RFC 3696 https://www.rfc-editor.org/errata_search.php?rfc=3696
  @ApiProperty({
    example: 'user@gmail.com',
    description: 'Адрес электронной почты',
  })
  @Column({ type: 'varchar', length: 254 })
  email: string;

  @ApiProperty({ example: '12345', description: 'Пароль пользователя' })
  @Column({ type: 'varchar', length: 255 })
  password: string;

  @ApiProperty({
    example: 'false',
    description: 'Активирован ли по ссылке из почты',
  })
  @Column({ type: 'boolean', default: false, nullable: true })
  isActivated: boolean;

  @ApiProperty({
    example: 'v34fa-asfasf-142saf-sa-asf',
    description: 'Ссылка для активации',
  })
  @Column({ type: 'varchar', nullable: true })
  activationLink: string;
}
