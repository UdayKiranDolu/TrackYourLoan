interface EmailPayload {
    to: string;
    subject: string;
    html: string;
}
export declare class EmailService {
    /**
     * Stub method for sending emails.
     * Replace this with actual email provider integration later.
     * (SendGrid, Resend, AWS SES, etc.)
     */
    static send(payload: EmailPayload): Promise<boolean>;
    /**
     * Process pending email notifications
     * Call this from a scheduled job or manually
     */
    static processPendingEmails(): Promise<void>;
    private static buildEmailTemplate;
}
export {};
//# sourceMappingURL=email.service.d.ts.map