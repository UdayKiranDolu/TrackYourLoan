export declare const env: {
    readonly nodeEnv: string;
    readonly port: number;
    readonly mongoUri: string;
    readonly jwtAccessSecret: string;
    readonly jwtRefreshSecret: string;
    readonly accessTokenTtl: string;
    readonly refreshTokenTtl: string;
    readonly timezone: string;
    readonly superAdminEmail: string;
    readonly superAdminPassword: string;
    readonly appBaseUrl: string;
    readonly apiBaseUrl: string;
};
export type Env = typeof env;
export declare function validateEnv(): void;
//# sourceMappingURL=env.d.ts.map