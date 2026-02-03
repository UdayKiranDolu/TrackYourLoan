"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
exports.validateEnv = validateEnv;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
exports.env = {
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
};
// Validate required env vars
const requiredEnvVars = ['MONGO_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
function validateEnv() {
    const missing = requiredEnvVars.filter((key) => !process.env[key]);
    if (missing.length > 0) {
        console.warn(`⚠️ Missing environment variables: ${missing.join(', ')}`);
        console.warn('Using default values. Please set these in production.');
    }
}
//# sourceMappingURL=env.js.map