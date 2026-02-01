import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '4000', 10),

    mongoUri: process.env.MONGO_URI || '',

    jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'access_secret_change_me',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh_secret_change_me',
    accessTokenTtl: process.env.ACCESS_TOKEN_TTL || '15m',
    refreshTokenTtl: process.env.REFRESH_TOKEN_TTL || '7d',

    timezone: process.env.TZ || 'Asia/Kolkata',

    superAdminEmail: process.env.SUPERADMIN_EMAIL || 'admin@loantracker.com',
    superAdminPassword: process.env.SUPERADMIN_PASSWORD || 'Admin@123',

    appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:5173',
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:4000',
} as const;

// Type for env object
export type Env = typeof env;

// Validate required env vars
const requiredEnvVars = ['MONGO_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];

export function validateEnv(): void {
    const missing = requiredEnvVars.filter((key) => !process.env[key]);
    if (missing.length > 0) {
        console.warn(`⚠️ Missing environment variables: ${missing.join(', ')}`);
        console.warn('Using default values. Please set these in production.');
    }
}