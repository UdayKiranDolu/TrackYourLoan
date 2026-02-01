import mongoose from 'mongoose';
import { env, validateEnv } from './env';
import { User } from '../models';
import { hashPassword } from '../utils/password';

async function seedSuperAdmin(): Promise<void> {
    validateEnv();

    try {
        await mongoose.connect(env.mongoUri);
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: env.superAdminEmail });

        if (existingAdmin) {
            console.log('ℹ️ Super Admin already exists:', env.superAdminEmail);
        } else {
            const passwordHash = await hashPassword(env.superAdminPassword);

            await User.create({
                email: env.superAdminEmail,
                passwordHash,
                role: 'ADMIN',
                forcePasswordReset: false,
            });

            console.log('✅ Super Admin created successfully:', env.superAdminEmail);
        }

        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
}

// Run if called directly
seedSuperAdmin();