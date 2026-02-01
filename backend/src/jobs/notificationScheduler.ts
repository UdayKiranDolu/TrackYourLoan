import cron from 'node-cron';
import { addDays, startOfDay, isSameDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { Loan, Notification, ILoan } from '../models';
import { env } from '../config/env';

const IST = env.timezone;

async function createNotificationIfNotExists(
    loan: ILoan,
    type: 'DUE_SOON' | 'OVERDUE',
    channel: 'IN_APP' | 'EMAIL'
): Promise<void> {
    try {
        const exists = await Notification.findOne({
            loanId: loan._id,
            type,
            channel,
        });

        if (exists) return;

        const title =
            type === 'DUE_SOON'
                ? `Loan due soon: ${loan.borrowerName}`
                : `Loan overdue: ${loan.borrowerName}`;

        const dueStr = loan.dueDate.toLocaleDateString('en-IN');
        const amountStr = `₹${loan.actualAmount.toLocaleString('en-IN')}`;

        const message =
            type === 'DUE_SOON'
                ? `Loan of ${amountStr} to ${loan.borrowerName} is due on ${dueStr}.`
                : `Loan of ${amountStr} to ${loan.borrowerName} was due on ${dueStr} and is now overdue.`;

        await Notification.create({
            userId: loan.ownerUserId,
            loanId: loan._id,
            type,
            channel,
            title,
            message,
            emailStatus: channel === 'EMAIL' ? 'PENDING' : undefined,
        });

        console.log(`📬 Created ${channel} ${type} notification for loan ${loan._id}`);
    } catch (error: any) {
        // Handle duplicate key error gracefully (race condition)
        if (error.code === 11000) {
            console.log(`ℹ️ Notification already exists for loan ${loan._id}`);
        } else {
            console.error(`❌ Error creating notification:`, error);
        }
    }
}

async function processNotifications(): Promise<void> {
    console.log('🔄 Running notification scheduler...');

    const nowIST = toZonedTime(new Date(), IST);
    const todayIST = startOfDay(nowIST);
    const in3Days = addDays(todayIST, 3);
    const in1Day = addDays(todayIST, 1);

    // Find all non-completed loans
    const loans = await Loan.find({ status: { $ne: 'COMPLETED' } });

    console.log(`📊 Processing ${loans.length} active loans...`);

    for (const loan of loans) {
        const dueDate = startOfDay(loan.dueDate);

        // IN-APP: 3 days before due
        if (isSameDay(dueDate, in3Days)) {
            await createNotificationIfNotExists(loan, 'DUE_SOON', 'IN_APP');
        }

        // EMAIL: 1 day before due
        if (isSameDay(dueDate, in1Day)) {
            await createNotificationIfNotExists(loan, 'DUE_SOON', 'EMAIL');
        }

        // OVERDUE: due date has passed
        if (dueDate < todayIST) {
            await createNotificationIfNotExists(loan, 'OVERDUE', 'IN_APP');
            await createNotificationIfNotExists(loan, 'OVERDUE', 'EMAIL');
        }
    }

    console.log('✅ Notification scheduler completed');
}

export function startNotificationScheduler(): void {
    // Run at 09:00 IST daily
    cron.schedule(
        '0 9 * * *',
        async () => {
            await processNotifications();
        },
        { timezone: IST }
    );

    console.log(`⏰ Notification scheduler started (runs daily at 09:00 ${IST})`);

    // Also run once on startup (for development/testing)
    if (env.nodeEnv === 'development') {
        setTimeout(() => {
            processNotifications();
        }, 5000);
    }
}

// Export for manual trigger (e.g., admin endpoint)
export { processNotifications };