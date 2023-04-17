import { TypeOrmModule } from '@nestjs/typeorm';

export const TypeORMTestingModule = (entities: any[]) =>
  TypeOrmModule.forRoot({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: '12345',
    database: 'Nest_hw3',
    entities: [...entities],
    synchronize: true,
  });
/*
export const TypeORMTestingModule = (entities: any[]) =>
  TypeOrmModule.forRoot({
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD.toString(),
    database: process.env.POSTGRES_DB,
    entities: [...entities],
    synchronize: true,
  });*/
