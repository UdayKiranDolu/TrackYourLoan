// import dotenv from 'dotenv';
// import path from 'path';

// dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// export const env = {
//     nodeEnv: process.env.NODE_ENV || 'development',
//     port: parseInt(process.env.PORT || '4000', 10),

//     mongoUri: process.env.MONGO_URI || '',

//     jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'access_secret_change_me',
//     jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh_secret_change_me',
//     accessTokenTtl: process.env.ACCESS_TOKEN_TTL || '15m',
//     refreshTokenTtl: process.env.REFRESH_TOKEN_TTL || '7d',

//     timezone: process.env.TZ || 'Asia/Kolkata',

//     superAdminEmail: process.env.SUPERADMIN_EMAIL || 'admin@loantracker.com',
//     superAdminPassword: process.env.SUPERADMIN_PASSWORD || 'Admin@123',

//     appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:5173',
//     apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:4000',
// } as const;

// // Type for env object
// export type Env = typeof env;

// // Validate required env vars
// const requiredEnvVars = ['MONGO_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];

// export function validateEnv(): void {
//     const missing = requiredEnvVars.filter((key) => !process.env[key]);
//     if (missing.length > 0) {
//         console.warn(`⚠️ Missing environment variables: ${missing.join(', ')}`);
//         console.warn('Using default values. Please set these in production.');
//     }
// }












import dotenv from 'dotenv';
import path from 'path';

// ✅ Load .env file (only needed in development)
// In production (Render), env vars are set directly
if (process.env.NODE_ENV !== 'production') {
    const envPath = path.resolve(process.cwd(), '.env');
    const result = dotenv.config({ path: envPath });

    if (result.error) {
        console.warn('⚠️ Could not load .env file:', result.error.message);
    } else {
        console.log('✅ Loaded .env from:', envPath);
    }
}

export const env = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '4000', 10),

    // Database
    mongoUri: process.env.MONGO_URI || '',

    // JWT
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'access_secret_change_me',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh_secret_change_me',
    accessTokenTtl: process.env.ACCESS_TOKEN_TTL || '15m',
    refreshTokenTtl: process.env.REFRESH_TOKEN_TTL || '7d',

    // Timezone
    timezone: process.env.TZ || 'Asia/Kolkata',

    // Super Admin
    superAdminEmail: process.env.SUPERADMIN_EMAIL || 'admin@loantracker.com',
    superAdminPassword: process.env.SUPERADMIN_PASSWORD || 'Admin@123',

    // URLs
    appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:5173',
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:4000',

    // ✅ Helper to check if in production
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV !== 'production',
} as const;

// ✅ CORS Allowed Origins
export const getAllowedOrigins = (): string[] => {
    const origins = [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://trackyourloan.vercel.app',  // Your Vercel frontend
    ];

    // Add appBaseUrl if it's set and not already included
    if (env.appBaseUrl && !origins.includes(env.appBaseUrl)) {
        origins.push(env.appBaseUrl);
    }

    // Filter out empty strings and duplicates
    return [...new Set(origins.filter(Boolean))];
};

// Type for env object
export type Env = typeof env;

// ✅ Required environment variables
const requiredEnvVars = [
    'MONGO_URI',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
] as const;

// ✅ Production-only required variables
const productionRequiredVars = [
    'MONGO_URI',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'APP_BASE_URL',
    'API_BASE_URL',
] as const;

// ✅ Enhanced validation function
export function validateEnv(): void {
    console.log('\n🔍 Validating environment variables...');
    console.log(`📍 Environment: ${env.nodeEnv}`);

    const varsToCheck = env.isProduction ? productionRequiredVars : requiredEnvVars;
    const missing: string[] = [];
    const warnings: string[] = [];

    varsToCheck.forEach((key) => {
        if (!process.env[key]) {
            missing.push(key);
        }
    });

    // Check for insecure defaults in production
    if (env.isProduction) {
        if (env.jwtAccessSecret === 'access_secret_change_me') {
            warnings.push('JWT_ACCESS_SECRET is using default value');
        }
        if (env.jwtRefreshSecret === 'refresh_secret_change_me') {
            warnings.push('JWT_REFRESH_SECRET is using default value');
        }
        if (env.superAdminPassword === 'Admin@123') {
            warnings.push('SUPERADMIN_PASSWORD is using default value');
        }
    }

    // Log warnings
    if (warnings.length > 0) {
        console.warn('\n⚠️  Security Warnings:');
        warnings.forEach((w) => console.warn(`   - ${w}`));
    }

    // Handle missing variables
    if (missing.length > 0) {
        console.error('\n❌ Missing required environment variables:');
        missing.forEach((v) => console.error(`   - ${v}`));

        if (env.isProduction) {
            throw new Error(
                `Missing required environment variables in production: ${missing.join(', ')}`
            );
        } else {
            console.warn('\n⚠️  Using default values for development.');
        }
    }

    // Log current configuration (hide sensitive values)
    console.log('\n✅ Environment Configuration:');
    console.log(`   - Port: ${env.port}`);
    console.log(`   - MongoDB: ${env.mongoUri ? '✓ Set' : '✗ Not set'}`);
    console.log(`   - JWT Access Secret: ${env.jwtAccessSecret !== 'access_secret_change_me' ? '✓ Set' : '⚠️ Default'}`);
    console.log(`   - JWT Refresh Secret: ${env.jwtRefreshSecret !== 'refresh_secret_change_me' ? '✓ Set' : '⚠️ Default'}`);
    console.log(`   - App Base URL: ${env.appBaseUrl}`);
    console.log(`   - API Base URL: ${env.apiBaseUrl}`);
    console.log(`   - Allowed Origins: ${getAllowedOrigins().join(', ')}`);
    console.log('');
}

// ✅ Export for debugging
export function printEnvSummary(): void {
    console.log('='.repeat(50));
    console.log('Environment Summary');
    console.log('='.repeat(50));
    console.log(`Node Env:     ${env.nodeEnv}`);
    console.log(`Port:         ${env.port}`);
    console.log(`API URL:      ${env.apiBaseUrl}`);
    console.log(`App URL:      ${env.appBaseUrl}`);
    console.log(`CORS Origins: ${getAllowedOrigins().join(', ')}`);
    console.log('='.repeat(50));
}