import { TypeOrmModule } from '@nestjs/typeorm';

export const TypeORMTestingModule = (entities: any[]) =>
  TypeOrmModule.forRoot({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.POSTGRES_PORT),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD.toString(),
    database: `${process.env.POSTGRES_DB}_tests`,
    entities: [...entities],
    synchronize: false,
    dropSchema: true,
  });
