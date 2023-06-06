import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: any;
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendActivationMail(to, link): Promise<boolean> {
    let mailSent = false;
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject: 'Активация аккаунта на ' + process.env.API_URL,
        text: '',
        html: `
                    <div>
                        <h1>Для активации перейдите по ссылке</h1>
                        <a href="${link}">${link}</a>
                    </div>
                `,
      });
      mailSent = true;
    } catch (e) {
      console.log(`Unable to send activation mail: ${e.message}`);
    }
    return mailSent;
  }
}
