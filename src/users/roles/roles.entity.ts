import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../users.entity';

@Entity(`roles`)
export class Role {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'ADMIN', description: 'Значение роли' })
  @Column({ type: 'varchar', length: 255, unique: true })
  value: string;

  @ApiProperty({ example: 'Администратор', description: 'Описание роли' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @ManyToMany(() => User, (user) => user.roles)
  @JoinTable()
  users: User[];
}
