import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { OAuthProvider } from './oauth-provider.entity';

@Entity(`users`)
export class User {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column({ type: 'numeric', nullable: true })
  vkId: number;

  @OneToMany(() => OAuthProvider, (oauthProvider) => oauthProvider.user, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  oauthProviders: OAuthProvider[];
}
