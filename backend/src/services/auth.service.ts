// import { User, IUser } from '../models';
// import { hashPassword, comparePassword } from '../utils/password';
// import { generateTokenPair, verifyRefreshToken } from '../utils/jwt';
// import { JwtPayload } from '../types';
// import { AppError } from '../middleware/errorHandler.middleware';

// interface AuthTokens {
//     accessToken: string;
//     refreshToken: string;
// }

// interface AuthResponse extends AuthTokens {
//     user: {
//         id: string;
//         email: string;
//         role: string;
//         forcePasswordReset: boolean;
//     };
// }

// export class AuthService {
//     static async register(email: string, password: string): Promise<AuthResponse> {
//         // Check if user exists
//         const existingUser = await User.findOne({ email: email.toLowerCase() });
//         if (existingUser) {
//             throw new AppError('Email already registered', 409);
//         }

//         // Hash password and create user
//         const passwordHash = await hashPassword(password);
//         const user = await User.create({
//             email: email.toLowerCase(),
//             passwordHash,
//             role: 'USER',
//             forcePasswordReset: false,
//         });

//         // Generate tokens
//         const payload: JwtPayload = {
//             userId: user._id.toString(),
//             email: user.email,
//             role: user.role,
//         };
//         const tokens = generateTokenPair(payload);

//         // Save refresh token
//         user.refreshToken = tokens.refreshToken;
//         await user.save();

//         return {
//             ...tokens,
//             user: {
//                 id: user._id.toString(),
//                 email: user.email,
//                 role: user.role,
//                 forcePasswordReset: user.forcePasswordReset,
//             },
//         };
//     }

//     static async login(email: string, password: string): Promise<AuthResponse> {
//         // Find user
//         const user = await User.findOne({ email: email.toLowerCase() });
//         if (!user) {
//             throw new AppError('Invalid email or password', 401);
//         }

//         // Verify password
//         const isValid = await comparePassword(password, user.passwordHash);
//         if (!isValid) {
//             throw new AppError('Invalid email or password', 401);
//         }

//         // Generate tokens
//         const payload: JwtPayload = {
//             userId: user._id.toString(),
//             email: user.email,
//             role: user.role,
//         };
//         const tokens = generateTokenPair(payload);

//         // Save refresh token
//         user.refreshToken = tokens.refreshToken;
//         await user.save();

//         return {
//             ...tokens,
//             user: {
//                 id: user._id.toString(),
//                 email: user.email,
//                 role: user.role,
//                 forcePasswordReset: user.forcePasswordReset,
//             },
//         };
//     }

//     static async refresh(refreshToken: string): Promise<AuthTokens> {
//         // Verify token
//         let decoded: JwtPayload;
//         try {
//             decoded = verifyRefreshToken(refreshToken);
//         } catch {
//             throw new AppError('Invalid refresh token', 401);
//         }

//         // Find user and verify stored token
//         const user = await User.findById(decoded.userId);
//         if (!user || user.refreshToken !== refreshToken) {
//             throw new AppError('Invalid refresh token', 401);
//         }

//         // Generate new tokens
//         const payload: JwtPayload = {
//             userId: user._id.toString(),
//             email: user.email,
//             role: user.role,
//         };
//         const tokens = generateTokenPair(payload);

//         // Update stored refresh token
//         user.refreshToken = tokens.refreshToken;
//         await user.save();

//         return tokens;
//     }

//     static async logout(userId: string): Promise<void> {
//         await User.findByIdAndUpdate(userId, { refreshToken: null });
//     }

//     static async changePassword(
//         userId: string,
//         currentPassword: string,
//         newPassword: string
//     ): Promise<void> {
//         const user = await User.findById(userId);
//         if (!user) {
//             throw new AppError('User not found', 404);
//         }

//         // Verify current password
//         const isValid = await comparePassword(currentPassword, user.passwordHash);
//         if (!isValid) {
//             throw new AppError('Current password is incorrect', 400);
//         }

//         // Update password
//         user.passwordHash = await hashPassword(newPassword);
//         user.forcePasswordReset = false;
//         user.refreshToken = null; // Invalidate existing sessions
//         await user.save();
//     }

//     static async getProfile(userId: string) {
//         const user = await User.findById(userId).select('-passwordHash -refreshToken');
//         if (!user) {
//             throw new AppError('User not found', 404);
//         }
//         return user;
//     }
// }










// backend/src/services/auth.service.ts

import { User, IUser } from '../models';
import { hashPassword, comparePassword } from '../utils/password';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt';
import { JwtPayload } from '../types';
import { AppError } from '../middleware/errorHandler.middleware';

interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

interface AuthResponse extends AuthTokens {
    user: {
        id: string;
        email: string;
        role: string;
        forcePasswordReset: boolean;
    };
}

export class AuthService {
    static async register(email: string, password: string): Promise<AuthResponse> {
        // Check if user exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
        }

        // Hash password and create user
        const passwordHash = await hashPassword(password);
        const user = await User.create({
            email: email.toLowerCase(),
            passwordHash,
            role: 'USER',
            forcePasswordReset: false,
        });

        // Generate tokens
        const payload: JwtPayload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        };
        const tokens = generateTokenPair(payload);

        // Save refresh token
        user.refreshToken = tokens.refreshToken;
        await user.save();

        return {
            ...tokens,
            user: {
                id: user._id.toString(),
                email: user.email,
                role: user.role,
                forcePasswordReset: user.forcePasswordReset,
            },
        };
    }

    static async login(email: string, password: string): Promise<AuthResponse> {
        // Validate input
        if (!email || !password) {
            throw new AppError('Email and password are required', 400, 'MISSING_FIELDS');
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
        }

        // Check if account is active (if you have status field)
        if ((user as any).status === 'INACTIVE' || (user as any).status === 'DISABLED') {
            throw new AppError('Your account has been disabled. Please contact support.', 403, 'ACCOUNT_DISABLED');
        }

        // Verify password
        const isValid = await comparePassword(password, user.passwordHash);
        if (!isValid) {
            throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
        }

        // Generate tokens
        const payload: JwtPayload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        };
        const tokens = generateTokenPair(payload);

        // Save refresh token
        user.refreshToken = tokens.refreshToken;
        await user.save();

        return {
            ...tokens,
            user: {
                id: user._id.toString(),
                email: user.email,
                role: user.role,
                forcePasswordReset: user.forcePasswordReset,
            },
        };
    }

    static async refresh(refreshToken: string): Promise<AuthTokens> {
        if (!refreshToken) {
            throw new AppError('Refresh token is required', 400, 'MISSING_TOKEN');
        }

        // Verify token
        let decoded: JwtPayload;
        try {
            decoded = verifyRefreshToken(refreshToken);
        } catch {
            throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
        }

        // Find user and verify stored token
        const user = await User.findById(decoded.userId);
        if (!user || user.refreshToken !== refreshToken) {
            throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
        }

        // Generate new tokens
        const payload: JwtPayload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        };
        const tokens = generateTokenPair(payload);

        // Update stored refresh token
        user.refreshToken = tokens.refreshToken;
        await user.save();

        return tokens;
    }

    static async logout(userId: string): Promise<void> {
        await User.findByIdAndUpdate(userId, { refreshToken: null });
    }

    static async changePassword(
        userId: string,
        currentPassword: string,
        newPassword: string
    ): Promise<void> {
        const user = await User.findById(userId);
        if (!user) {
            throw new AppError('User not found', 404, 'USER_NOT_FOUND');
        }

        // Verify current password
        const isValid = await comparePassword(currentPassword, user.passwordHash);
        if (!isValid) {
            throw new AppError('Current password is incorrect', 400, 'INVALID_CURRENT_PASSWORD');
        }

        // Update password
        user.passwordHash = await hashPassword(newPassword);
        user.forcePasswordReset = false;
        user.refreshToken = null; // Invalidate existing sessions
        await user.save();
    }

    static async getProfile(userId: string) {
        const user = await User.findById(userId).select('-passwordHash -refreshToken');
        if (!user) {
            throw new AppError('User not found', 404, 'USER_NOT_FOUND');
        }
        return user;
    }
}