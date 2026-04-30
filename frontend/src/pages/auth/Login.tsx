// // frontend/src/pages/auth/Login.tsx

// import React, { useState } from 'react';
// import { Link, Navigate } from 'react-router-dom';
// import {
//     FiLogIn,
//     FiAlertCircle,
//     FiX,
//     FiWifi,
//     FiLock,
//     FiEye,
//     FiEyeOff
// } from 'react-icons/fi';
// import { useAuth } from '../../hooks/useAuth';
// import Input from '../../components/common/Input';
// import Button from '../../components/common/Button';

// type ErrorType = 'credentials' | 'network' | 'locked' | 'validation' | 'server' | null;

// interface ErrorInfo {
//     message: string;
//     type: ErrorType;
// }

// export default function Login(): JSX.Element {
//     const { login, isAuthenticated, user, isLoading: authLoading } = useAuth();
//     const [email, setEmail] = useState<string>('');
//     const [password, setPassword] = useState<string>('');
//     const [isLoading, setIsLoading] = useState<boolean>(false);
//     const [error, setError] = useState<ErrorInfo | null>(null);
//     const [shake, setShake] = useState<boolean>(false);
//     const [attempts, setAttempts] = useState<number>(0);
//     const [showPassword, setShowPassword] = useState<boolean>(false);

//     // Show loading while checking auth state
//     if (authLoading) {
//         return (
//             <div className="min-h-screen flex items-center justify-center bg-gray-900">
//                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
//             </div>
//         );
//     }

//     if (isAuthenticated) {
//         return <Navigate to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
//     }

//     const triggerShake = () => {
//         setShake(true);
//         setTimeout(() => setShake(false), 500);
//     };

//     const parseError = (err: any): ErrorInfo => {
//         // Network error - no response
//         if (!err.response) {
//             return {
//                 message: 'Unable to connect to server. Please check your internet connection.',
//                 type: 'network',
//             };
//         }

//         const status = err.response?.status;
//         const errorMessage = err.response?.data?.error || err.response?.data?.message;

//         // 401 - Invalid credentials
//         if (status === 401) {
//             return {
//                 message: errorMessage || 'Invalid email or password. Please try again.',
//                 type: 'credentials',
//             };
//         }

//         // 403 - Account locked/disabled
//         if (status === 403) {
//             return {
//                 message: errorMessage || 'Your account has been disabled. Please contact support.',
//                 type: 'locked',
//             };
//         }

//         // 429 - Too many requests
//         if (status === 429) {
//             return {
//                 message: 'Too many login attempts. Please wait a few minutes and try again.',
//                 type: 'locked',
//             };
//         }

//         // 400/422 - Validation error
//         if (status === 400 || status === 422) {
//             return {
//                 message: errorMessage || 'Please check your input and try again.',
//                 type: 'validation',
//             };
//         }

//         // 500+ - Server error
//         if (status >= 500) {
//             return {
//                 message: 'Server error. Please try again later.',
//                 type: 'server',
//             };
//         }

//         // Default error
//         return {
//             message: errorMessage || 'An unexpected error occurred. Please try again.',
//             type: 'credentials',
//         };
//     };

//     const getErrorIcon = () => {
//         switch (error?.type) {
//             case 'network':
//                 return <FiWifi className="w-5 h-5" />;
//             case 'locked':
//                 return <FiLock className="w-5 h-5" />;
//             default:
//                 return <FiAlertCircle className="w-5 h-5" />;
//         }
//     };

//     const getErrorStyles = () => {
//         switch (error?.type) {
//             case 'network':
//                 return 'bg-orange-500/20 border-orange-500/50 text-orange-100';
//             case 'locked':
//                 return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-100';
//             case 'server':
//                 return 'bg-purple-500/20 border-purple-500/50 text-purple-100';
//             default:
//                 return 'bg-red-500/20 border-red-500/50 text-red-100';
//         }
//     };

//     const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//         e.preventDefault();

//         // Clear previous error
//         setError(null);

//         // Basic validation
//         if (!email.trim()) {
//             setError({ message: 'Please enter your email address.', type: 'validation' });
//             triggerShake();
//             return;
//         }

//         if (!password) {
//             setError({ message: 'Please enter your password.', type: 'validation' });
//             triggerShake();
//             return;
//         }

//         setIsLoading(true);

//         try {
//             await login({ email: email.trim(), password });
//             // Success - navigation is handled in AuthContext
//         } catch (err: any) {
//             const errorInfo = parseError(err);
//             setError(errorInfo);
//             setAttempts((prev) => prev + 1);
//             triggerShake();
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const clearError = () => {
//         setError(null);
//     };

//     const togglePasswordVisibility = () => {
//         setShowPassword(!showPassword);
//     };

//     return (
//         <div className="min-h-screen flex items-center justify-center relative px-4 py-12 font-sans">
//             {/* Background */}
//             <div
//                 className="absolute inset-0 bg-cover bg-center"
//                 style={{
//                     backgroundImage: "url('/images/bg_image.avif')",
//                 }}
//             >
//                 <div className="absolute inset-0 bg-black/50" />
//             </div>

//             {/* Glass Card */}
//             <div
//                 className={`relative w-full max-w-md bg-white/10 backdrop-blur-lg border border-gray-100 rounded-3xl p-10 shadow-2xl z-10 transition-transform ${shake ? 'animate-shake' : ''
//                     }`}
//             >
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
//                     {/* Error Alert */}
//                     {error && (
//                         <div
//                             className={`p-4 border rounded-xl animate-fadeIn ${getErrorStyles()}`}
//                         >
//                             <div className="flex items-start gap-3">
//                                 <div className="flex-shrink-0 mt-0.5">
//                                     {getErrorIcon()}
//                                 </div>
//                                 <div className="flex-1">
//                                     <p className="text-sm font-medium">{error.message}</p>
//                                     {attempts >= 3 && error.type === 'credentials' && (
//                                         <p className="text-xs mt-2 opacity-80">
//                                             Forgot your password?{' '}
//                                             <Link
//                                                 to="/forgot-password"
//                                                 className="underline hover:opacity-100 font-semibold"
//                                             >
//                                                 Reset it here
//                                             </Link>
//                                         </p>
//                                     )}
//                                 </div>
//                                 <button
//                                     type="button"
//                                     onClick={clearError}
//                                     className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
//                                 >
//                                     <FiX className="w-4 h-4" />
//                                 </button>
//                             </div>
//                         </div>
//                     )}

//                     {/* Email Input */}
//                     <div className="flex flex-col">
//                         <label className="mb-1 text-white text-sm font-medium">Email</label>
//                         <Input
//                             type="email"
//                             value={email}
//                             onChange={(e) => {
//                                 setEmail(e.target.value);
//                                 if (error) clearError();
//                             }}
//                             placeholder="Enter your email"
//                             required
//                             disabled={isLoading}
//                             showErrorIcon={false}
//                             className={`bg-white/20 text-white placeholder-white/50 transition-all ${error
//                                 ? 'border-red-400 focus:border-red-400 focus:ring-red-400/50'
//                                 : 'border-white/30 focus:ring-indigo-400 focus:border-indigo-400'
//                                 }`}
//                         />
//                     </div>

//                     {/* Password Input with Show/Hide Toggle */}
//                     <div className="flex flex-col">
//                         <label className="mb-1 text-white text-sm font-medium">Password</label>
//                         <div className="relative">
//                             <Input
//                                 type={showPassword ? 'text' : 'password'}
//                                 value={password}
//                                 onChange={(e) => {
//                                     setPassword(e.target.value);
//                                     if (error) clearError();
//                                 }}
//                                 placeholder="Enter your password"
//                                 required
//                                 disabled={isLoading}
//                                 showErrorIcon={false}
//                                 className={`bg-white/20 text-white placeholder-white/50 transition-all pr-12 ${error
//                                     ? 'border-red-400 focus:border-red-400 focus:ring-red-400/50'
//                                     : 'border-white/30 focus:ring-indigo-400 focus:border-indigo-400'
//                                     }`}
//                             />
//                             {/* Password Visibility Toggle Button */}
//                             <button
//                                 type="button"
//                                 onClick={togglePasswordVisibility}
//                                 disabled={isLoading}
//                                 className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors focus:outline-none disabled:opacity-50"
//                                 tabIndex={-1}
//                                 aria-label={showPassword ? 'Hide password' : 'Show password'}
//                             >
//                                 {showPassword ? (
//                                     <FiEyeOff className="w-5 h-5" />
//                                 ) : (
//                                     <FiEye className="w-5 h-5" />
//                                 )}
//                             </button>
//                         </div>
//                     </div>

//                     <div className="flex items-center justify-between text-sm text-white/70">
//                         <Link
//                             to="/forgot-password"
//                             className="hover:text-indigo-400 transition-colors"
//                         >
//                             Forgot password?
//                         </Link>
//                     </div>

//                     <Button
//                         type="submit"
//                         className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//                         isLoading={isLoading}
//                         disabled={isLoading}
//                         leftIcon={!isLoading ? <FiLogIn className="w-5 h-5" /> : undefined}
//                     >
//                         {isLoading ? 'Signing in...' : 'Sign In'}
//                     </Button>
//                 </form>

//                 <div className="mt-6 text-center text-sm text-white/70">
//                     <span>Don't have an account? </span>
//                     <Link
//                         to="/register"
//                         className="text-indigo-800 hover:text-indigo-200 font-bold transition-colors underline"
//                     >
//                         Sign up
//                     </Link>
//                 </div>
//             </div>

//             {/* CSS for animations */}
//             <style>{`
//                 @keyframes shake {
//                     0%, 100% { transform: translateX(0); }
//                     10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
//                     20%, 40%, 60%, 80% { transform: translateX(5px); }
//                 }
                
//                 @keyframes fadeIn {
//                     from { opacity: 0; transform: translateY(-10px); }
//                     to { opacity: 1; transform: translateY(0); }
//                 }
                
//                 .animate-shake {
//                     animation: shake 0.5s ease-in-out;
//                 }
                
//                 .animate-fadeIn {
//                     animation: fadeIn 0.3s ease-out;
//                 }
//             `}</style>
//         </div>




//     );
// }













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

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<ErrorInfo | null>(null);
    const [shake, setShake] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [showPassword, setShowPassword] = useState(false);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-indigo-500 rounded-full" />
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
    }

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 400);
    };

    const parseError = (err: any): ErrorInfo => {
        if (!err?.response) {
            return { message: 'Check your internet connection.', type: 'network' };
        }

        const status = err.response?.status;
        const msg = err.response?.data?.error || err.response?.data?.message;

        if (status === 401) return { message: msg || 'Invalid credentials.', type: 'credentials' };
        if (status === 403) return { message: msg || 'Account locked.', type: 'locked' };
        if (status === 429) return { message: 'Too many attempts.', type: 'locked' };
        if (status === 400 || status === 422) return { message: msg || 'Invalid input.', type: 'validation' };
        if (typeof status === 'number' && status >= 500) return { message: 'Server error.', type: 'server' };

        return { message: msg || 'Something went wrong.', type: 'credentials' };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email.trim()) {
            setError({ message: 'Enter email.', type: 'validation' });
            triggerShake();
            return;
        }

        if (!password) {
            setError({ message: 'Enter password.', type: 'validation' });
            triggerShake();
            return;
        }

        setIsLoading(true);

        try {
            await login({ email: email.trim(), password });
        } catch (err) {
            setError(parseError(err));
            setAttempts(prev => prev + 1);
            triggerShake();
        } finally {
            setIsLoading(false);
        }
    };

    const getErrorIcon = () => {
        switch (error?.type) {
            case 'network': return <FiWifi />;
            case 'locked': return <FiLock />;
            default: return <FiAlertCircle />;
        }
    };

    const getErrorStyles = () => {
        switch (error?.type) {
            case 'network': return 'bg-orange-500/20 border-orange-400';
            case 'locked': return 'bg-yellow-500/20 border-yellow-400';
            case 'server': return 'bg-purple-500/20 border-purple-400';
            default: return 'bg-red-500/20 border-red-400';
        }
    };

    return (
        <div className="relative min-h-screen flex flex-col lg:flex-row text-white font-sans">

            {/* BACKGROUND IMAGE */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/images/bg_image.avif')" }}
            />

            {/* DARK OVERLAY */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-indigo-900/60" />

            {/* CONTENT WRAPPER */}
            <div className="relative z-10 flex flex-col lg:flex-row w-full min-h-screen">

                {/* LEFT SIDE */}
                <div className="lg:w-1/2 w-full flex items-center justify-center text-center p-8">

                    <div className="max-w-md">

                        {/* LOGO */}
                        <div className="flex items-center justify-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center font-bold">
                                LT
                            </div>
                            <span className="text-xl font-semibold tracking-wide">
                                LoanTrack
                            </span>
                        </div>

                        {/* TITLE */}
                        <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                            Track Your Loan
                        </h1>

                        {/* QUOTE */}
                        <p className="text-lg text-white/80">
                            “Clarity today builds financial freedom tomorrow.”
                        </p>

                        {/* FOOTER LINE */}
                        <div className="mt-8 flex flex-col items-center">
                            <div className="w-24 h-1 bg-indigo-400 rounded-full mb-2" />
                            <p className="text-sm text-white/60">
                                Smart insights. Better decisions.
                            </p>
                        </div>

                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="lg:w-1/2 w-full flex items-center justify-center px-6 py-12">

                    <div className={`w-full max-w-lg bg-white/15 backdrop-blur-2xl border border-white/20 rounded-3xl p-10 lg:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.6)] transition-all duration-300 hover:scale-[1.01] ${shake ? 'animate-shake' : ''}`}>

                        {/* HEADER */}
                        <h2 className="text-3xl lg:text-4xl font-bold text-center mb-2">
                            Welcome Back
                        </h2>

                        <p className="text-center text-white/60 mb-8">
                            Sign in to continue to your dashboard
                        </p>

                        {/* FORM */}
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* ERROR */}
                            {error && (
                                <div className={`p-4 border rounded-xl flex gap-3 items-center ${getErrorStyles()}`}>
                                    {getErrorIcon()}
                                    <span className="text-sm flex-1">{error.message}</span>
                                    <button onClick={() => setError(null)}>
                                        <FiX />
                                    </button>
                                </div>
                            )}

                            {/* EMAIL */}
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email"
                                disabled={isLoading}
                                className="h-12 px-4 rounded-xl bg-white/20 text-white placeholder-white/50 border border-white/20 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/40"
                            />

                            {/* PASSWORD */}
                            <div className="relative">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    disabled={isLoading}
                                    className="h-12 px-4 rounded-xl bg-white/20 text-white placeholder-white/50 border border-white/20 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/40"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(prev => !prev)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>

                            {/* FORGOT */}
                            <div className="text-sm text-blue-800 font-extrabold">
                                <Link to="/forgot-password">Forgot password?</Link>
                            </div>

                            {/* BUTTON */}
                            <Button
                                type="submit"
                                isLoading={isLoading}
                                className="w-full h-12 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-semibold shadow-lg shadow-indigo-500/30"
                                leftIcon={!isLoading ? <FiLogIn /> : undefined}
                            >
                                {isLoading ? 'Signing in...' : 'Sign In'}
                            </Button>
                        </form>

                        {/* SIGNUP */}
                        <p className="text-center text-sm mt-8 text-white/70">
                            Don’t have an account?{' '}
                            <Link to="/register" className="text-blue-900 font-extrabold underline">
                                Sign up
                            </Link>
                        </p>

                    </div>
                </div>
            </div>

            {/* ANIMATION */}
            <style>{`
                @keyframes shake {
                    0%,100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }
                .animate-shake {
                    animation: shake 0.4s ease-in-out;
                }
            `}</style>
        </div>
    );
}