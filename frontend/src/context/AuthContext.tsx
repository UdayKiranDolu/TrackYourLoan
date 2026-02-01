// import React, { createContext, useEffect, useState, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { authApi } from '../api/auth.api';
// import { adminApi } from '../api/admin.api';
// import { User, AuthState, LoginCredentials, RegisterCredentials } from '../types';
// import toast from 'react-hot-toast';

// interface AuthContextType extends AuthState {
//     login: (credentials: LoginCredentials) => Promise<void>;
//     register: (credentials: RegisterCredentials) => Promise<void>;
//     logout: () => Promise<void>;
//     changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
//     impersonate: (userId: string) => Promise<void>;
//     stopImpersonation: () => Promise<void>;
//     refreshUser: () => Promise<void>;
// }

// export const AuthContext = createContext<AuthContextType | null>(null);

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//     const navigate = useNavigate();
//     const [state, setState] = useState<AuthState>({
//         user: null,
//         accessToken: null,
//         isAuthenticated: false,
//         isLoading: true,
//         isImpersonating: false,
//         originalAdminId: undefined,
//     });

//     const loadStoredAuth = useCallback(async () => {
//         try {
//             const accessToken = localStorage.getItem('accessToken');
//             const userStr = localStorage.getItem('user');
//             const isImpersonating = localStorage.getItem('isImpersonating') === 'true';
//             const originalAdminId = localStorage.getItem('originalAdminId') || undefined;

//             if (accessToken && userStr) {
//                 const user = JSON.parse(userStr);
//                 setState({
//                     user,
//                     accessToken,
//                     isAuthenticated: true,
//                     isLoading: false,
//                     isImpersonating,
//                     originalAdminId,
//                 });
//             } else {
//                 setState((prev) => ({ ...prev, isLoading: false }));
//             }
//         } catch (error) {
//             console.error('Error loading auth state:', error);
//             localStorage.clear();
//             setState((prev) => ({ ...prev, isLoading: false }));
//         }
//     }, []);

//     useEffect(() => {
//         loadStoredAuth();
//     }, [loadStoredAuth]);

//     const login = async (credentials: LoginCredentials) => {
//         const response = await authApi.login(credentials);

//         const user: User = {
//             id: response.user.id,
//             email: response.user.email,
//             role: response.user.role,
//             forcePasswordReset: response.user.forcePasswordReset,
//         };

//         // Clear any impersonation state on fresh login
//         localStorage.removeItem('isImpersonating');
//         localStorage.removeItem('originalAdminId');
//         localStorage.removeItem('originalAccessToken');
//         localStorage.removeItem('originalUser');

//         localStorage.setItem('accessToken', response.accessToken);
//         localStorage.setItem('refreshToken', response.refreshToken);
//         localStorage.setItem('user', JSON.stringify(user));

//         setState({
//             user,
//             accessToken: response.accessToken,
//             isAuthenticated: true,
//             isLoading: false,
//             isImpersonating: false,
//             originalAdminId: undefined,
//         });

//         toast.success('Login successful!');

//         if (user.forcePasswordReset) {
//             navigate('/change-password-required');
//         } else if (user.role === 'ADMIN') {
//             navigate('/admin');
//         } else {
//             navigate('/dashboard');
//         }
//     };

//     const register = async (credentials: RegisterCredentials) => {
//         const response = await authApi.register(credentials);

//         const user: User = {
//             id: response.user.id,
//             email: response.user.email,
//             role: response.user.role,
//             forcePasswordReset: response.user.forcePasswordReset,
//         };

//         localStorage.setItem('accessToken', response.accessToken);
//         localStorage.setItem('refreshToken', response.refreshToken);
//         localStorage.setItem('user', JSON.stringify(user));

//         setState({
//             user,
//             accessToken: response.accessToken,
//             isAuthenticated: true,
//             isLoading: false,
//             isImpersonating: false,
//         });

//         toast.success('Registration successful!');
//         navigate('/dashboard');
//     };

//     const logout = async () => {
//         try {
//             await authApi.logout();
//         } catch {
//             // Ignore logout errors
//         }

//         // Clear all storage
//         localStorage.clear();

//         setState({
//             user: null,
//             accessToken: null,
//             isAuthenticated: false,
//             isLoading: false,
//             isImpersonating: false,
//             originalAdminId: undefined,
//         });

//         toast.success('Logged out successfully');
//         navigate('/login');
//     };

//     const changePassword = async (currentPassword: string, newPassword: string) => {
//         await authApi.changePassword(currentPassword, newPassword);

//         // Update user state to remove forcePasswordReset
//         if (state.user) {
//             const updatedUser = { ...state.user, forcePasswordReset: false };
//             localStorage.setItem('user', JSON.stringify(updatedUser));
//             setState((prev) => ({ ...prev, user: updatedUser }));
//         }

//         toast.success('Password changed successfully!');

//         if (state.user?.role === 'ADMIN' && !state.isImpersonating) {
//             navigate('/admin');
//         } else {
//             navigate('/dashboard');
//         }
//     };

//     const impersonate = async (userId: string) => {
//         try {
//             const response = await adminApi.impersonate(userId);

//             const impersonatedUser: User = {
//                 id: response.user._id || response.user.id || '',
//                 email: response.user.email || '',
//                 role: response.user.role || 'USER',
//                 forcePasswordReset: false,
//             };

//             // Store original admin info before impersonating
//             localStorage.setItem('originalAccessToken', state.accessToken || '');
//             localStorage.setItem('originalUser', JSON.stringify(state.user));
//             localStorage.setItem('originalAdminId', state.user?.id || '');
//             localStorage.setItem('isImpersonating', 'true');

//             // Set impersonated user
//             localStorage.setItem('accessToken', response.accessToken);
//             localStorage.setItem('user', JSON.stringify(impersonatedUser));

//             setState({
//                 user: impersonatedUser,
//                 accessToken: response.accessToken,
//                 isAuthenticated: true,
//                 isLoading: false,
//                 isImpersonating: true,
//                 originalAdminId: state.user?.id,
//             });

//             toast.success(`Now viewing as ${impersonatedUser.email}`);
//             navigate('/dashboard');
//         } catch (error) {
//             toast.error('Failed to impersonate user');
//             throw error;
//         }
//     };

//     const stopImpersonation = async () => {
//         try {
//             const response = await adminApi.stopImpersonation();

//             const adminUser: User = {
//                 id: response.user._id || response.user.id || '',
//                 email: response.user.email || '',
//                 role: response.user.role || 'ADMIN',
//                 forcePasswordReset: false,
//             };

//             // Clear impersonation state
//             localStorage.removeItem('originalAccessToken');
//             localStorage.removeItem('originalUser');
//             localStorage.removeItem('originalAdminId');
//             localStorage.removeItem('isImpersonating');

//             // Restore admin
//             localStorage.setItem('accessToken', response.accessToken);
//             localStorage.setItem('user', JSON.stringify(adminUser));

//             setState({
//                 user: adminUser,
//                 accessToken: response.accessToken,
//                 isAuthenticated: true,
//                 isLoading: false,
//                 isImpersonating: false,
//                 originalAdminId: undefined,
//             });

//             toast.success('Returned to admin view');
//             navigate('/admin');
//         } catch (error) {
//             toast.error('Failed to stop impersonation');
//             throw error;
//         }
//     };

//     const refreshUser = async () => {
//         try {
//             const user = await authApi.getProfile();
//             const updatedUser: User = {
//                 id: (user as any)._id || (user as any).id || '',
//                 email: user.email,
//                 role: user.role,
//                 forcePasswordReset: user.forcePasswordReset,
//             };

//             localStorage.setItem('user', JSON.stringify(updatedUser));
//             setState((prev) => ({ ...prev, user: updatedUser }));
//         } catch (error) {
//             console.error('Failed to refresh user:', error);
//         }
//     };

//     return (
//         <AuthContext.Provider
//             value={{
//                 ...state,
//                 login,
//                 register,
//                 logout,
//                 changePassword,
//                 impersonate,
//                 stopImpersonation,
//                 refreshUser,
//             }}
//         >
//             {children}
//         </AuthContext.Provider>
//     );
// }





















// frontend/src/context/AuthContext.tsx

import React, { createContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import { adminApi } from '../api/admin.api';
import { User, AuthState, LoginCredentials, RegisterCredentials } from '../types';
import toast from 'react-hot-toast';

interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (credentials: RegisterCredentials) => Promise<void>;
    logout: () => Promise<void>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
    impersonate: (userId: string) => Promise<void>;
    stopImpersonation: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    const [state, setState] = useState<AuthState>({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: true,
        isImpersonating: false,
        originalAdminId: undefined,
    });

    const loadStoredAuth = useCallback(async () => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const userStr = localStorage.getItem('user');
            const isImpersonating = localStorage.getItem('isImpersonating') === 'true';
            const originalAdminId = localStorage.getItem('originalAdminId') || undefined;

            if (accessToken && userStr) {
                const user = JSON.parse(userStr);
                setState({
                    user,
                    accessToken,
                    isAuthenticated: true,
                    isLoading: false,
                    isImpersonating,
                    originalAdminId,
                });
            } else {
                setState((prev) => ({ ...prev, isLoading: false }));
            }
        } catch (error) {
            console.error('Error loading auth state:', error);
            localStorage.clear();
            setState((prev) => ({ ...prev, isLoading: false }));
        }
    }, []);

    useEffect(() => {
        loadStoredAuth();
    }, [loadStoredAuth]);

    const login = async (credentials: LoginCredentials) => {
        // Let errors bubble up to the Login component
        // DO NOT catch errors here - the Login form will handle them
        const response = await authApi.login(credentials);

        const user: User = {
            id: response.user.id,
            email: response.user.email,
            role: response.user.role,
            forcePasswordReset: response.user.forcePasswordReset,
        };

        // Clear any impersonation state on fresh login
        localStorage.removeItem('isImpersonating');
        localStorage.removeItem('originalAdminId');
        localStorage.removeItem('originalAccessToken');
        localStorage.removeItem('originalUser');

        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('user', JSON.stringify(user));

        setState({
            user,
            accessToken: response.accessToken,
            isAuthenticated: true,
            isLoading: false,
            isImpersonating: false,
            originalAdminId: undefined,
        });

        toast.success('Login successful!');

        if (user.forcePasswordReset) {
            navigate('/change-password-required');
        } else if (user.role === 'ADMIN') {
            navigate('/admin');
        } else {
            navigate('/dashboard');
        }
    };

    const register = async (credentials: RegisterCredentials) => {
        // Let errors bubble up to the Register component
        const response = await authApi.register(credentials);

        const user: User = {
            id: response.user.id,
            email: response.user.email,
            role: response.user.role,
            forcePasswordReset: response.user.forcePasswordReset,
        };

        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('user', JSON.stringify(user));

        setState({
            user,
            accessToken: response.accessToken,
            isAuthenticated: true,
            isLoading: false,
            isImpersonating: false,
        });

        toast.success('Registration successful!');
        navigate('/dashboard');
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch {
            // Ignore logout errors
        }

        // Clear all storage
        localStorage.clear();

        setState({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
            isImpersonating: false,
            originalAdminId: undefined,
        });

        toast.success('Logged out successfully');
        navigate('/login');
    };

    const changePassword = async (currentPassword: string, newPassword: string) => {
        await authApi.changePassword(currentPassword, newPassword);

        // Update user state to remove forcePasswordReset
        if (state.user) {
            const updatedUser = { ...state.user, forcePasswordReset: false };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setState((prev) => ({ ...prev, user: updatedUser }));
        }

        toast.success('Password changed successfully!');

        if (state.user?.role === 'ADMIN' && !state.isImpersonating) {
            navigate('/admin');
        } else {
            navigate('/dashboard');
        }
    };

    const impersonate = async (userId: string) => {
        try {
            const response = await adminApi.impersonate(userId);

            const impersonatedUser: User = {
                id: response.user._id || response.user.id || '',
                email: response.user.email || '',
                role: response.user.role || 'USER',
                forcePasswordReset: false,
            };

            // Store original admin info before impersonating
            localStorage.setItem('originalAccessToken', state.accessToken || '');
            localStorage.setItem('originalUser', JSON.stringify(state.user));
            localStorage.setItem('originalAdminId', state.user?.id || '');
            localStorage.setItem('isImpersonating', 'true');

            // Set impersonated user
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('user', JSON.stringify(impersonatedUser));

            setState({
                user: impersonatedUser,
                accessToken: response.accessToken,
                isAuthenticated: true,
                isLoading: false,
                isImpersonating: true,
                originalAdminId: state.user?.id,
            });

            toast.success(`Now viewing as ${impersonatedUser.email}`);
            navigate('/dashboard');
        } catch (error) {
            toast.error('Failed to impersonate user');
            throw error;
        }
    };

    const stopImpersonation = async () => {
        try {
            const response = await adminApi.stopImpersonation();

            const adminUser: User = {
                id: response.user._id || response.user.id || '',
                email: response.user.email || '',
                role: response.user.role || 'ADMIN',
                forcePasswordReset: false,
            };

            // Clear impersonation state
            localStorage.removeItem('originalAccessToken');
            localStorage.removeItem('originalUser');
            localStorage.removeItem('originalAdminId');
            localStorage.removeItem('isImpersonating');

            // Restore admin
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('user', JSON.stringify(adminUser));

            setState({
                user: adminUser,
                accessToken: response.accessToken,
                isAuthenticated: true,
                isLoading: false,
                isImpersonating: false,
                originalAdminId: undefined,
            });

            toast.success('Returned to admin view');
            navigate('/admin');
        } catch (error) {
            toast.error('Failed to stop impersonation');
            throw error;
        }
    };

    const refreshUser = async () => {
        try {
            const user = await authApi.getProfile();
            const updatedUser: User = {
                id: (user as any)._id || (user as any).id || '',
                email: user.email,
                role: user.role,
                forcePasswordReset: user.forcePasswordReset,
            };

            localStorage.setItem('user', JSON.stringify(updatedUser));
            setState((prev) => ({ ...prev, user: updatedUser }));
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                ...state,
                login,
                register,
                logout,
                changePassword,
                impersonate,
                stopImpersonation,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}