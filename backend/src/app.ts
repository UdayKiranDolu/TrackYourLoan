// import express from 'express';
// import cors from 'cors';
// import cookieParser from 'cookie-parser';
// import { env, validateEnv } from './config/env';
// import { connectDB } from './config/db';
// import { errorHandler } from './middleware/errorHandler.middleware';

// // Import routes (we'll create these next)
// import authRoutes from './routes/auth.routes';
// import loanRoutes from './routes/loan.routes';
// import notificationRoutes from './routes/notification.routes';
// import exportRoutes from './routes/export.routes';
// import adminRoutes from './routes/admin.routes';

// // Import scheduler
// import { startNotificationScheduler } from './jobs/notificationScheduler';

// const app = express();

// // Middleware
// app.use(cors({
//     origin: [env.appBaseUrl,
//         "http://localhost:5173",
//         "https://track-your-loan.vercel.app"
//     ],
//     credentials: true,
// }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// // Health check
// app.get('/health', (req, res) => {
//     res.json({ status: 'ok', timestamp: new Date().toISOString() });
// });

// // API Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/loans', loanRoutes);
// app.use('/api/notifications', notificationRoutes);
// app.use('/api/export', exportRoutes);
// app.use('/api/admin', adminRoutes);

// // Error handler (must be last)
// app.use(errorHandler);

// // Start server
// async function startServer(): Promise<void> {
//     try {
//         validateEnv();
//         await connectDB();

//         // Start notification scheduler
//         startNotificationScheduler();

//         app.listen(env.port, () => {
//             console.log(`🚀 Server running on port ${env.port}`);
//             console.log(`📍 Environment: ${env.nodeEnv}`);
//             console.log(`🌐 API URL: ${env.apiBaseUrl}`);
//         });
//     } catch (error) {
//         console.error('❌ Failed to start server:', error);
//         process.exit(1);
//     }
// }

// startServer();

// export default app;












import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env, validateEnv, getAllowedOrigins } from './config/env';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/errorHandler.middleware';

// Import routes
import authRoutes from './routes/auth.routes';
import loanRoutes from './routes/loan.routes';
import notificationRoutes from './routes/notification.routes';
import exportRoutes from './routes/export.routes';
import adminRoutes from './routes/admin.routes';

// Import scheduler
import { startNotificationScheduler } from './jobs/notificationScheduler';

const app = express();

// ✅ Get allowed origins from config
const allowedOrigins = getAllowedOrigins();

// ✅ CORS configuration
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, curl)
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`⚠️ CORS blocked: ${origin}`);
            // In development, allow all origins with a warning
            if (env.isDevelopment) {
                console.warn(`   Allowing anyway (development mode)`);
                callback(null, true);
            } else {
                callback(new Error(`Origin ${origin} not allowed by CORS`));
            }
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Handle preflight
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: env.nodeEnv,
        version: process.env.npm_package_version || '1.0.0',
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
    });
});

// Error handler
app.use(errorHandler);

// Start server
async function startServer(): Promise<void> {
    try {
        validateEnv();
        await connectDB();

        startNotificationScheduler();

        app.listen(env.port, () => {
            console.log(`🚀 Server running on port ${env.port}`);
            console.log(`📍 Environment: ${env.nodeEnv}`);
            console.log(`🌐 API URL: ${env.apiBaseUrl}`);
            console.log(`🔒 CORS Origins: ${allowedOrigins.join(', ')}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

export default app;