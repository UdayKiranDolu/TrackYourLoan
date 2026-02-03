"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startNotificationScheduler = startNotificationScheduler;
exports.processNotifications = processNotifications;
const node_cron_1 = __importDefault(require("node-cron"));
const date_fns_1 = require("date-fns");
const date_fns_tz_1 = require("date-fns-tz");
const models_1 = require("../models");
const env_1 = require("../config/env");
const IST = env_1.env.timezone;
async function createNotificationIfNotExists(loan, type, channel) {
    try {
        const exists = await models_1.Notification.findOne({
            loanId: loan._id,
            type,
            channel,
        });
        if (exists)
            return;
        const title = type === 'DUE_SOON'
            ? `Loan due soon: ${loan.borrowerName}`
            : `Loan overdue: ${loan.borrowerName}`;
        const dueStr = loan.dueDate.toLocaleDateString('en-IN');
        const amountStr = `₹${loan.actualAmount.toLocaleString('en-IN')}`;
        const message = type === 'DUE_SOON'
            ? `Loan of ${amountStr} to ${loan.borrowerName} is due on ${dueStr}.`
            : `Loan of ${amountStr} to ${loan.borrowerName} was due on ${dueStr} and is now overdue.`;
        await models_1.Notification.create({
            userId: loan.ownerUserId,
            loanId: loan._id,
            type,
            channel,
            title,
            message,
            emailStatus: channel === 'EMAIL' ? 'PENDING' : undefined,
        });
        console.log(`📬 Created ${channel} ${type} notification for loan ${loan._id}`);
    }
    catch (error) {
        // Handle duplicate key error gracefully (race condition)
        if (error.code === 11000) {
            console.log(`ℹ️ Notification already exists for loan ${loan._id}`);
        }
        else {
            console.error(`❌ Error creating notification:`, error);
        }
    }
}
async function processNotifications() {
    console.log('🔄 Running notification scheduler...');
    const nowIST = (0, date_fns_tz_1.toZonedTime)(new Date(), IST);
    const todayIST = (0, date_fns_1.startOfDay)(nowIST);
    const in3Days = (0, date_fns_1.addDays)(todayIST, 3);
    const in1Day = (0, date_fns_1.addDays)(todayIST, 1);
    // Find all non-completed loans
    const loans = await models_1.Loan.find({ status: { $ne: 'COMPLETED' } });
    console.log(`📊 Processing ${loans.length} active loans...`);
    for (const loan of loans) {
        const dueDate = (0, date_fns_1.startOfDay)(loan.dueDate);
        // IN-APP: 3 days before due
        if ((0, date_fns_1.isSameDay)(dueDate, in3Days)) {
            await createNotificationIfNotExists(loan, 'DUE_SOON', 'IN_APP');
        }
        // EMAIL: 1 day before due
        if ((0, date_fns_1.isSameDay)(dueDate, in1Day)) {
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
function startNotificationScheduler() {
    // Run at 09:00 IST daily
    node_cron_1.default.schedule('0 9 * * *', async () => {
        await processNotifications();
    }, { timezone: IST });
    console.log(`⏰ Notification scheduler started (runs daily at 09:00 ${IST})`);
    // Also run once on startup (for development/testing)
    if (env_1.env.nodeEnv === 'development') {
        setTimeout(() => {
            processNotifications();
        }, 5000);
    }
}
//# sourceMappingURL=notificationScheduler.js.map