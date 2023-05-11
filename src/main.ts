import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { Transport } from "@nestjs/microservices";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  const configService = app.get(ConfigService);
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get('RABBIT_MQ_URI')],
      queue: 'toAuthMs',
      queueOptions: {
        durable: false,
      },
    },
  });
/*  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions('AUTH', true));*/
  await app.startAllMicroservices();
}
bootstrap();
