import { Notification } from '../models';

interface EmailPayload {
    to: string;
    subject: string;
    html: string;
}

export class EmailService {
    /**
     * Stub method for sending emails.
     * Replace this with actual email provider integration later.
     * (SendGrid, Resend, AWS SES, etc.)
     */
    static async send(payload: EmailPayload): Promise<boolean> {
        console.log('📧 [EMAIL STUB] Would send email:', {
            to: payload.to,
            subject: payload.subject,
        });

        // In production, integrate with email provider here
        // Example with SendGrid:
        // await sgMail.send({
        //   to: payload.to,
        //   from: env.emailFrom,
        //   subject: payload.subject,
        //   html: payload.html,
        // });

        return true;
    }

    /**
     * Process pending email notifications
     * Call this from a scheduled job or manually
     */
    static async processPendingEmails(): Promise<void> {
        const pendingNotifications = await Notification.find({
            channel: 'EMAIL',
            emailStatus: 'PENDING',
        }).populate('userId', 'email');

        console.log(`📬 Processing ${pendingNotifications.length} pending emails...`);

        for (const notification of pendingNotifications) {
            try {
                const user = notification.userId as any;
                if (!user?.email) continue;

                const sent = await this.send({
                    to: user.email,
                    subject: notification.title,
                    html: this.buildEmailTemplate(notification.title, notification.message),
                });

                notification.emailStatus = sent ? 'SENT' : 'FAILED';
                await notification.save();
            } catch (error) {
                console.error('Failed to send email notification:', error);
                notification.emailStatus = 'FAILED';
                await notification.save();
            }
        }
    }

    private static buildEmailTemplate(title: string, message: string): string {
        return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Loan Tracker</h1>
            </div>
            <div class="content">
              <h2>${title}</h2>
              <p>${message}</p>
            </div>
            <div class="footer">
              <p>This is an automated notification from Loan Tracker.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    }
}