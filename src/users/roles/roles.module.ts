import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './roles.entity';
import { User } from '../users.entity';

// Модуль для управления ролями

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  imports: [TypeOrmModule.forFeature([Role, User])],
  exports: [RolesService],
})
export class RolesModule {}
