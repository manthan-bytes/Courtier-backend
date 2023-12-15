import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
dotenv.config();

export class EmailService {
  async sendEmail(to: string, subject: string, ejsHtml: string): Promise<any> {
    try {
      const transporter = await nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html: ejsHtml,
      };

      return await transporter.sendMail(mailOptions);
    } catch (error) {
      return { error: `Failed to send email to ${to}` };
    }
  }
}
