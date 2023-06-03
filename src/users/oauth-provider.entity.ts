import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from './users.entity';

@Entity('oauth_providers')
@Unique('', ['user', 'provider'])
export class OAuthProvider {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  public provider: string;

  @ManyToOne(() => User, (user) => user.oauthProviders, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  public user: User;
}
