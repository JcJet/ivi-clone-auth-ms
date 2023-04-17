import { NestFactory } from '@nestjs/core';
import { UsersModule } from './users.module';
import { RmqService } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(UsersModule);
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions('USERS', true));
  await app.startAllMicroservices();
}
bootstrap();
