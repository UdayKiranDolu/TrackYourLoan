import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env, validateEnv } from './config/env';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/errorHandler.middleware';

// Import routes (we'll create these next)
import authRoutes from './routes/auth.routes';
import loanRoutes from './routes/loan.routes';
import notificationRoutes from './routes/notification.routes';
import exportRoutes from './routes/export.routes';
import adminRoutes from './routes/admin.routes';

// Import scheduler
import { startNotificationScheduler } from './jobs/notificationScheduler';

const app = express();

// Middleware
app.use(cors({
    origin: [env.appBaseUrl,
        "http://localhost:5173",
        "https://trackyourloan.onrender.com"
    ],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/admin', adminRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Start server
async function startServer(): Promise<void> {
    try {
        validateEnv();
        await connectDB();

        // Start notification scheduler
        startNotificationScheduler();

        app.listen(env.port, () => {
            console.log(`🚀 Server running on port ${env.port}`);
            console.log(`📍 Environment: ${env.nodeEnv}`);
            console.log(`🌐 API URL: ${env.apiBaseUrl}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

export default app;