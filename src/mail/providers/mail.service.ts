import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from 'src/users/user.entity';

@Injectable()
export class MailService {
  constructor(
    /** inject the mailservice */
    private mailerService: MailerService
  ) {}
  public async sendUserWelcome(user: User): Promise<void> {
    await this.mailerService.sendMail({
      to: user.email,
      from: `Onboarding Team <support@zerblog.com>`,
      subject: `Welcome to ZerBlog`,
      template: './welcome',
      context: {
        name: user.firstName,
        email: user.email,
        loginUrl: `http://localhost:3000`
      }
    });
  }
}
