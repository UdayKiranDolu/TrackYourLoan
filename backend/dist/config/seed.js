"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
const models_1 = require("../models");
const password_1 = require("../utils/password");
async function seedSuperAdmin() {
    (0, env_1.validateEnv)();
    try {
        await mongoose_1.default.connect(env_1.env.mongoUri);
        console.log('✅ Connected to MongoDB');
        // Check if admin already exists
        const existingAdmin = await models_1.User.findOne({ email: env_1.env.superAdminEmail });
        if (existingAdmin) {
            console.log('ℹ️ Super Admin already exists:', env_1.env.superAdminEmail);
        }
        else {
            const passwordHash = await (0, password_1.hashPassword)(env_1.env.superAdminPassword);
            await models_1.User.create({
                email: env_1.env.superAdminEmail,
                passwordHash,
                role: 'ADMIN',
                forcePasswordReset: false,
            });
            console.log('✅ Super Admin created successfully:', env_1.env.superAdminEmail);
        }
        await mongoose_1.default.disconnect();
        console.log('✅ Disconnected from MongoDB');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
}
// Run if called directly
seedSuperAdmin();
//# sourceMappingURL=seed.js.map