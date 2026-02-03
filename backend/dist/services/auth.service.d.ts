import { IUser } from '../models';
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
export declare class AuthService {
    static register(email: string, password: string): Promise<AuthResponse>;
    static login(email: string, password: string): Promise<AuthResponse>;
    static refresh(refreshToken: string): Promise<AuthTokens>;
    static logout(userId: string): Promise<void>;
    static changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    static getProfile(userId: string): Promise<import("mongoose").Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
export {};
//# sourceMappingURL=auth.service.d.ts.map