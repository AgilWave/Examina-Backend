import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import {
  getExamNotificationTemplate,
  getExamNotificationPlainText,
  getExamWarningTemplate,
  getExamWarningPlainText,
  ExamNotificationData,
} from './templates/exam-notification.template';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendExamNotification(
    toEmail: string,
    data: Omit<ExamNotificationData, 'unsubscribeUrl'>,
  ): Promise<void> {
    try {
      const unsubscribeUrl = `https://updates.examina.live/unsubscribe?email=${toEmail}`;

      const emailData: ExamNotificationData = {
        ...data,
        unsubscribeUrl,
      };

      const result = await this.resend.emails.send({
        from: 'Examination Portal <exams@updates.examina.live>',
        to: toEmail,
        subject: `Upcoming Exam: ${data.examName}`,
        replyTo: 'support@examina.live',
        text: getExamNotificationPlainText(emailData),
        html: getExamNotificationTemplate(emailData),
        headers: {
          'List-Unsubscribe': `<mailto:${unsubscribeUrl}>`,
          Precedence: 'bulk',
          'X-Auto-Response-Suppress': 'All',
          'Auto-Submitted': 'auto-generated',
        },
        tags: [
          {
            name: 'category',
            value: 'exam-notification',
          },
        ],
      });

      this.logger.log(
        `Email sent to ${toEmail}: ${result.data?.id || 'unknown'}`,
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.stack : 'Unknown error';
      this.logger.error(`Failed to send email to ${toEmail}`, errorMessage);
    }
  }

  async sendExamWarning(
    toEmail: string,
    data: Omit<ExamNotificationData, 'unsubscribeUrl'>,
  ): Promise<void> {
    try {
      const unsubscribeUrl = `https://updates.examina.live/unsubscribe?email=${toEmail}`;

      const emailData: ExamNotificationData = {
        ...data,
        unsubscribeUrl,
      };

      const result = await this.resend.emails.send({
        from: 'Examination Portal <exams@updates.examina.live>',
        to: toEmail,
        subject: `URGENT: Exam Starts in 10 Minutes - ${data.examName}`,
        replyTo: 'support@examina.live',
        text: getExamWarningPlainText(emailData),
        html: getExamWarningTemplate(emailData),
        headers: {
          'List-Unsubscribe': `<mailto:${unsubscribeUrl}>`,
          Precedence: 'bulk',
          'X-Auto-Response-Suppress': 'All',
          'Auto-Submitted': 'auto-generated',
        },
        tags: [
          {
            name: 'category',
            value: 'exam-warning',
          },
        ],
      });

      this.logger.log(
        `Warning email sent to ${toEmail}: ${result.data?.id || 'unknown'}`,
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.stack : 'Unknown error';
      this.logger.error(
        `Failed to send warning email to ${toEmail}`,
        errorMessage,
      );
    }
  }
}
