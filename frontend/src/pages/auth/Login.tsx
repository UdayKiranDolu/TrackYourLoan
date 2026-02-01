// import React, { useState } from 'react';
// import { Link, Navigate } from 'react-router-dom';
// import { FiLogIn } from 'react-icons/fi';
// import { useAuth } from '../../hooks/useAuth';
// import Input from '../../components/common/Input';
// import Button from '../../components/common/Button';

// export default function Login(): JSX.Element {
//     const { login, isAuthenticated, user } = useAuth();
//     const [email, setEmail] = useState<string>('');
//     const [password, setPassword] = useState<string>('');
//     const [isLoading, setIsLoading] = useState<boolean>(false);
//     const [error, setError] = useState<string>('');

//     if (isAuthenticated) {
//         return <Navigate to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
//     }

//     const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//         e.preventDefault();
//         setError('');
//         setIsLoading(true);

//         try {
//             await login({ email, password });
//         } catch (err: any) {
//             setError(err.response?.data?.error || 'Login failed. Please try again.');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <div className="min-h-screen flex items-center justify-center relative px-4 py-12 font-sans">
//             {/* Background */}
//             <div
//                 className="absolute inset-0 bg-cover bg-center"
//                 style={{
//                     backgroundImage:
//                         "url('/images/bg_image.avif')",
//                 }}
//             >
//                 <div className="absolute inset-0 bg-black/50" />
//             </div>

//             {/* Glass Card */}
//             <div className="relative w-full max-w-md bg-white/10 backdrop-blur-lg border border-gray-100 rounded-3xl p-10 shadow-2xl z-10">
//                 {/* Logo */}
//                 <div className="text-center mb-8">
//                     <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center mx-auto mb-4 backdrop-blur-md shadow-lg">
//                         <span className="text-white font-extrabold text-2xl">LT</span>
//                     </div>
//                     <h1 className="text-3xl font-bold text-white drop-shadow-md">Welcome Back</h1>
//                     <p className="text-white/70 mt-2">Sign in to your account</p>
//                 </div>

//                 {/* Form */}
//                 <form onSubmit={handleSubmit} className="space-y-5">
//                     {error && (
//                         <div className="p-3 bg-red-600/20 border border-red-500/30 rounded-xl text-sm text-red-100">
//                             {error}
//                         </div>
//                     )}

//                     {/* Email Input */}
//                     <div className="flex flex-col">
//                         <label className="mb-1 text-white">Email</label>
//                         <Input
//                             type="email"
//                             value={email}
//                             onChange={(e) => setEmail(e.target.value)}
//                             placeholder="Enter your email"
//                             required
//                             className="bg-white/20 text-white placeholder-white/50 focus:ring-indigo-400 focus:border-indigo-400"
//                         />
//                     </div>

//                     {/* Password Input */}
//                     <div className="flex flex-col">
//                         <label className="mb-1 text-white">Password</label>
//                         <Input
//                             type="password"
//                             value={password}
//                             onChange={(e) => setPassword(e.target.value)}
//                             placeholder="Enter your password"
//                             required
//                             className="bg-white/20 text-white placeholder-white/50 focus:ring-indigo-400 focus:border-indigo-400"
//                         />
//                     </div>

//                     <div className="flex items-center justify-between text-sm text-white/70">
//                         <Link to="/forgot-password" className="hover:text-indigo-400 transition-colors">
//                             Forgot password?
//                         </Link>
//                     </div>

//                     <Button
//                         type="submit"
//                         className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl shadow-lg transition-all"
//                         isLoading={isLoading}
//                         leftIcon={<FiLogIn className="w-5 h-5" />}
//                     >
//                         Sign In
//                     </Button>
//                 </form>

//                 <div className="mt-6 text-center text-sm text-white/70">
//                     <span>Don't have an account? </span>
//                     <Link
//                         to="/register"
//                         className="text-indigo-800 hover:text-indigo-300 font-bold font-large transition-colors underline "
//                     >
//                         Sign up
//                     </Link>
//                 </div>
//             </div>
//         </div>
//     );
// }











// frontend/src/pages/auth/Login.tsx

// frontend/src/pages/auth/Login.tsx

import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
    FiLogIn,
    FiAlertCircle,
    FiX,
    FiWifi,
    FiLock,
    FiEye,
    FiEyeOff
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

type ErrorType = 'credentials' | 'network' | 'locked' | 'validation' | 'server' | null;

interface ErrorInfo {
    message: string;
    type: ErrorType;
}

export default function Login(): JSX.Element {
    const { login, isAuthenticated, user, isLoading: authLoading } = useAuth();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<ErrorInfo | null>(null);
    const [shake, setShake] = useState<boolean>(false);
    const [attempts, setAttempts] = useState<number>(0);
    const [showPassword, setShowPassword] = useState<boolean>(false);

    // Show loading while checking auth state
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
    }

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    const parseError = (err: any): ErrorInfo => {
        // Network error - no response
        if (!err.response) {
            return {
                message: 'Unable to connect to server. Please check your internet connection.',
                type: 'network',
            };
        }

        const status = err.response?.status;
        const errorMessage = err.response?.data?.error || err.response?.data?.message;

        // 401 - Invalid credentials
        if (status === 401) {
            return {
                message: errorMessage || 'Invalid email or password. Please try again.',
                type: 'credentials',
            };
        }

        // 403 - Account locked/disabled
        if (status === 403) {
            return {
                message: errorMessage || 'Your account has been disabled. Please contact support.',
                type: 'locked',
            };
        }

        // 429 - Too many requests
        if (status === 429) {
            return {
                message: 'Too many login attempts. Please wait a few minutes and try again.',
                type: 'locked',
            };
        }

        // 400/422 - Validation error
        if (status === 400 || status === 422) {
            return {
                message: errorMessage || 'Please check your input and try again.',
                type: 'validation',
            };
        }

        // 500+ - Server error
        if (status >= 500) {
            return {
                message: 'Server error. Please try again later.',
                type: 'server',
            };
        }

        // Default error
        return {
            message: errorMessage || 'An unexpected error occurred. Please try again.',
            type: 'credentials',
        };
    };

    const getErrorIcon = () => {
        switch (error?.type) {
            case 'network':
                return <FiWifi className="w-5 h-5" />;
            case 'locked':
                return <FiLock className="w-5 h-5" />;
            default:
                return <FiAlertCircle className="w-5 h-5" />;
        }
    };

    const getErrorStyles = () => {
        switch (error?.type) {
            case 'network':
                return 'bg-orange-500/20 border-orange-500/50 text-orange-100';
            case 'locked':
                return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-100';
            case 'server':
                return 'bg-purple-500/20 border-purple-500/50 text-purple-100';
            default:
                return 'bg-red-500/20 border-red-500/50 text-red-100';
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Clear previous error
        setError(null);

        // Basic validation
        if (!email.trim()) {
            setError({ message: 'Please enter your email address.', type: 'validation' });
            triggerShake();
            return;
        }

        if (!password) {
            setError({ message: 'Please enter your password.', type: 'validation' });
            triggerShake();
            return;
        }

        setIsLoading(true);

        try {
            await login({ email: email.trim(), password });
            // Success - navigation is handled in AuthContext
        } catch (err: any) {
            const errorInfo = parseError(err);
            setError(errorInfo);
            setAttempts((prev) => prev + 1);
            triggerShake();
        } finally {
            setIsLoading(false);
        }
    };

    const clearError = () => {
        setError(null);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative px-4 py-12 font-sans">
            {/* Background */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: "url('/images/bg_image.avif')",
                }}
            >
                <div className="absolute inset-0 bg-black/50" />
            </div>

            {/* Glass Card */}
            <div
                className={`relative w-full max-w-md bg-white/10 backdrop-blur-lg border border-gray-100 rounded-3xl p-10 shadow-2xl z-10 transition-transform ${shake ? 'animate-shake' : ''
                    }`}
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center mx-auto mb-4 backdrop-blur-md shadow-lg">
                        <span className="text-white font-extrabold text-2xl">LT</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white drop-shadow-md">Welcome Back</h1>
                    <p className="text-white/70 mt-2">Sign in to your account</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Error Alert */}
                    {error && (
                        <div
                            className={`p-4 border rounded-xl animate-fadeIn ${getErrorStyles()}`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                    {getErrorIcon()}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{error.message}</p>
                                    {attempts >= 3 && error.type === 'credentials' && (
                                        <p className="text-xs mt-2 opacity-80">
                                            Forgot your password?{' '}
                                            <Link
                                                to="/forgot-password"
                                                className="underline hover:opacity-100 font-semibold"
                                            >
                                                Reset it here
                                            </Link>
                                        </p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={clearError}
                                    className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
                                >
                                    <FiX className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Email Input */}
                    <div className="flex flex-col">
                        <label className="mb-1 text-white text-sm font-medium">Email</label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (error) clearError();
                            }}
                            placeholder="Enter your email"
                            required
                            disabled={isLoading}
                            showErrorIcon={false}
                            className={`bg-white/20 text-white placeholder-white/50 transition-all ${error
                                ? 'border-red-400 focus:border-red-400 focus:ring-red-400/50'
                                : 'border-white/30 focus:ring-indigo-400 focus:border-indigo-400'
                                }`}
                        />
                    </div>

                    {/* Password Input with Show/Hide Toggle */}
                    <div className="flex flex-col">
                        <label className="mb-1 text-white text-sm font-medium">Password</label>
                        <div className="relative">
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (error) clearError();
                                }}
                                placeholder="Enter your password"
                                required
                                disabled={isLoading}
                                showErrorIcon={false}
                                className={`bg-white/20 text-white placeholder-white/50 transition-all pr-12 ${error
                                    ? 'border-red-400 focus:border-red-400 focus:ring-red-400/50'
                                    : 'border-white/30 focus:ring-indigo-400 focus:border-indigo-400'
                                    }`}
                            />
                            {/* Password Visibility Toggle Button */}
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                disabled={isLoading}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors focus:outline-none disabled:opacity-50"
                                tabIndex={-1}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? (
                                    <FiEyeOff className="w-5 h-5" />
                                ) : (
                                    <FiEye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-white/70">
                        <Link
                            to="/forgot-password"
                            className="hover:text-indigo-400 transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        isLoading={isLoading}
                        disabled={isLoading}
                        leftIcon={!isLoading ? <FiLogIn className="w-5 h-5" /> : undefined}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-white/70">
                    <span>Don't have an account? </span>
                    <Link
                        to="/register"
                        className="text-indigo-800 hover:text-indigo-200 font-bold transition-colors underline"
                    >
                        Sign up
                    </Link>
                </div>
            </div>

            {/* CSS for animations */}
            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}