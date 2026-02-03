import { JwtPayload } from '../types';
export declare function generateAccessToken(payload: JwtPayload): string;
export declare function generateRefreshToken(payload: JwtPayload): string;
export declare function verifyAccessToken(token: string): JwtPayload;
export declare function verifyRefreshToken(token: string): JwtPayload;
export declare function generateTokenPair(payload: JwtPayload): {
    accessToken: string;
    refreshToken: string;
};
//# sourceMappingURL=jwt.d.ts.map