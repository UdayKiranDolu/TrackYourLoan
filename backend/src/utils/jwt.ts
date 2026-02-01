import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload } from '../types';

const ACCESS_SECRET: jwt.Secret = env.jwtAccessSecret;
const REFRESH_SECRET: jwt.Secret = env.jwtRefreshSecret;

export function generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(
        payload,
        ACCESS_SECRET,
        { expiresIn: env.accessTokenTtl } as jwt.SignOptions
    );
}

export function generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(
        payload,
        REFRESH_SECRET,
        { expiresIn: env.refreshTokenTtl } as jwt.SignOptions
    );
}

export function verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
}

export function generateTokenPair(payload: JwtPayload): {
    accessToken: string;
    refreshToken: string;
} {
    return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
    };
}