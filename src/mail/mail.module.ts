import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [MailService],
  imports: [
    ConfigModule.forRoot({
      //isGlobal: true,
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
  ],
  exports: [MailService],
})
export class MailModule {}
