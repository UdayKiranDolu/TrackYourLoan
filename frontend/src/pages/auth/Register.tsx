// import React, { useState } from 'react';
// import { Link, Navigate } from 'react-router-dom';
// import { FiMail, FiLock, FiUserPlus } from 'react-icons/fi';
// import { useAuth } from '../../hooks/useAuth';
// import Input from '../../components/common/Input';
// import Button from '../../components/common/Button';

// export default function Register() {
//     const { register, isAuthenticated } = useAuth();
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [confirmPassword, setConfirmPassword] = useState('');
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState('');

//     // Redirect if already authenticated
//     if (isAuthenticated) {
//         return <Navigate to="/dashboard" replace />;
//     }

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setError('');

//         if (password !== confirmPassword) {
//             setError('Passwords do not match');
//             return;
//         }

//         if (password.length < 6) {
//             setError('Password must be at least 6 characters');
//             return;
//         }

//         setIsLoading(true);

//         try {
//             await register({ email, password });
//         } catch (err: any) {
//             setError(err.response?.data?.error || 'Registration failed. Please try again.');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
//             <div className="w-full max-w-md">
//                 {/* Logo */}
//                 <div className="text-center mb-8">
//                     <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
//                         <span className="text-white font-bold text-2xl">LT</span>
//                     </div>
//                     <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
//                     <p className="text-gray-500 mt-1">Start tracking your loans today</p>
//                 </div>

//                 {/* Form */}
//                 <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
//                     <form onSubmit={handleSubmit} className="space-y-6">
//                         {error && (
//                             <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
//                                 {error}
//                             </div>
//                         )}

//                         <Input
//                             label="Email"
//                             type="email"
//                             value={email}
//                             onChange={(e) => setEmail(e.target.value)}
//                             placeholder="Enter your email"
//                             required
//                         />

//                         <Input
//                             label="Password"
//                             type="password"
//                             value={password}
//                             onChange={(e) => setPassword(e.target.value)}
//                             placeholder="Create a password"
//                             helperText="Must be at least 6 characters"
//                             required
//                         />

//                         <Input
//                             label="Confirm Password"
//                             type="password"
//                             value={confirmPassword}
//                             onChange={(e) => setConfirmPassword(e.target.value)}
//                             placeholder="Confirm your password"
//                             required
//                         />

//                         <Button
//                             type="submit"
//                             className="w-full"
//                             isLoading={isLoading}
//                             leftIcon={<FiUserPlus className="w-4 h-4" />}
//                         >
//                             Create Account
//                         </Button>
//                     </form>

//                     <div className="mt-6 text-center text-sm">
//                         <span className="text-gray-500">Already have an account? </span>
//                         <Link
//                             to="/login"
//                             className="text-primary-600 hover:text-primary-700 font-medium"
//                         >
//                             Sign in
//                         </Link>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }












// src/pages/auth/Register.tsx


import React, { useState, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
    FiUserPlus,
    FiAlertCircle,
    FiX,
    FiWifi,
    FiCheck,
    FiEye,
    FiEyeOff
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

type ErrorType = 'validation' | 'duplicate' | 'network' | 'server' | null;

interface FormErrors {
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
}

interface ErrorInfo {
    message: string;
    type: ErrorType;
}

interface PasswordStrength {
    score: number; // 0-4
    label: string;
    color: string;
    bgColor: string;
}

export default function Register(): JSX.Element {
    const { register, isAuthenticated, isLoading: authLoading } = useAuth();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [generalError, setGeneralError] = useState<ErrorInfo | null>(null);
    const [shake, setShake] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [touched, setTouched] = useState<{ email: boolean; password: boolean; confirmPassword: boolean }>({
        email: false,
        password: false,
        confirmPassword: false,
    });

    // Show loading while checking auth state
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    // Calculate password strength
    const passwordStrength = useMemo((): PasswordStrength => {
        if (!password) {
            return { score: 0, label: '', color: '', bgColor: '' };
        }

        let score = 0;

        // Length checks
        if (password.length >= 6) score++;
        if (password.length >= 8) score++;

        // Character type checks
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

        // Cap at 4
        score = Math.min(score, 4);

        const strengths: Record<number, PasswordStrength> = {
            0: { score: 0, label: 'Very Weak', color: 'text-red-400', bgColor: 'bg-red-500' },
            1: { score: 1, label: 'Weak', color: 'text-orange-400', bgColor: 'bg-orange-500' },
            2: { score: 2, label: 'Fair', color: 'text-yellow-400', bgColor: 'bg-yellow-500' },
            3: { score: 3, label: 'Good', color: 'text-blue-400', bgColor: 'bg-blue-500' },
            4: { score: 4, label: 'Strong', color: 'text-green-400', bgColor: 'bg-green-500' },
        };

        return strengths[score];
    }, [password]);

    // Password requirements
    const passwordRequirements = useMemo(() => [
        { met: password.length >= 6, text: 'At least 6 characters' },
        { met: /[a-z]/.test(password), text: 'One lowercase letter' },
        { met: /[A-Z]/.test(password), text: 'One uppercase letter' },
        { met: /\d/.test(password), text: 'One number' },
        { met: /[!@#$%^&*(),.?":{}|<>]/.test(password), text: 'One special character (optional)' },
    ], [password]);

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    const validateEmail = (email: string): string | undefined => {
        if (!email.trim()) {
            return 'Email is required';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return 'Please enter a valid email address';
        }
        return undefined;
    };

    const validatePassword = (password: string): string | undefined => {
        if (!password) {
            return 'Password is required';
        }
        if (password.length < 6) {
            return 'Password must be at least 6 characters';
        }
        return undefined;
    };

    const validateConfirmPassword = (confirmPassword: string, password: string): string | undefined => {
        if (!confirmPassword) {
            return 'Please confirm your password';
        }
        if (confirmPassword !== password) {
            return 'Passwords do not match';
        }
        return undefined;
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        const emailError = validateEmail(email);
        if (emailError) newErrors.email = emailError;

        const passwordError = validatePassword(password);
        if (passwordError) newErrors.password = passwordError;

        const confirmPasswordError = validateConfirmPassword(confirmPassword, password);
        if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
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
        const errorCode = err.response?.data?.code;

        // 409 - Email already exists
        if (status === 409 || errorCode === 'EMAIL_EXISTS' || errorCode === 'DUPLICATE_ERROR') {
            // Also set field-specific error
            setErrors((prev) => ({ ...prev, email: 'This email is already registered' }));
            return {
                message: 'This email is already registered. Please use a different email or sign in.',
                type: 'duplicate',
            };
        }

        // 400/422 - Validation error
        if (status === 400 || status === 422) {
            // Handle field-specific validation errors from backend
            if (err.response?.data?.details) {
                const backendErrors: FormErrors = {};
                err.response.data.details.forEach((detail: { field: string; message: string }) => {
                    if (detail.field === 'email') backendErrors.email = detail.message;
                    if (detail.field === 'password') backendErrors.password = detail.message;
                });
                setErrors((prev) => ({ ...prev, ...backendErrors }));
            }
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
            message: errorMessage || 'Registration failed. Please try again.',
            type: 'validation',
        };
    };

    const getErrorIcon = () => {
        switch (generalError?.type) {
            case 'network':
                return <FiWifi className="w-5 h-5" />;
            case 'duplicate':
                return <FiAlertCircle className="w-5 h-5" />;
            default:
                return <FiAlertCircle className="w-5 h-5" />;
        }
    };

    const getErrorStyles = () => {
        switch (generalError?.type) {
            case 'network':
                return 'bg-orange-500/20 border-orange-500/50 text-orange-100';
            case 'duplicate':
                return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-100';
            case 'server':
                return 'bg-purple-500/20 border-purple-500/50 text-purple-100';
            default:
                return 'bg-red-500/20 border-red-500/50 text-red-100';
        }
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);

        // Clear errors when user starts typing
        if (errors.email) {
            setErrors((prev) => ({ ...prev, email: undefined }));
        }
        if (generalError) {
            setGeneralError(null);
        }

        // Validate on change if field was touched
        if (touched.email) {
            const error = validateEmail(value);
            if (error) {
                setErrors((prev) => ({ ...prev, email: error }));
            }
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPassword(value);

        if (errors.password) {
            setErrors((prev) => ({ ...prev, password: undefined }));
        }
        if (generalError) {
            setGeneralError(null);
        }

        // Also revalidate confirm password if it was filled
        if (confirmPassword && touched.confirmPassword) {
            const confirmError = validateConfirmPassword(confirmPassword, value);
            setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
        }
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setConfirmPassword(value);

        if (errors.confirmPassword) {
            setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
        }
        if (generalError) {
            setGeneralError(null);
        }

        // Validate on change if field was touched
        if (touched.confirmPassword) {
            const error = validateConfirmPassword(value, password);
            if (error) {
                setErrors((prev) => ({ ...prev, confirmPassword: error }));
            }
        }
    };

    const handleBlur = (field: 'email' | 'password' | 'confirmPassword') => {
        setTouched((prev) => ({ ...prev, [field]: true }));

        // Validate on blur
        let error: string | undefined;
        switch (field) {
            case 'email':
                error = validateEmail(email);
                break;
            case 'password':
                error = validatePassword(password);
                break;
            case 'confirmPassword':
                error = validateConfirmPassword(confirmPassword, password);
                break;
        }

        if (error) {
            setErrors((prev) => ({ ...prev, [field]: error }));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Mark all fields as touched
        setTouched({ email: true, password: true, confirmPassword: true });

        // Clear previous errors
        setErrors({});
        setGeneralError(null);

        // Validate form
        if (!validateForm()) {
            triggerShake();
            return;
        }

        setIsLoading(true);

        try {
            await register({ email: email.trim().toLowerCase(), password });
            // Success - navigation is handled in AuthContext
        } catch (err: any) {
            const errorInfo = parseError(err);
            setGeneralError(errorInfo);
            triggerShake();
        } finally {
            setIsLoading(false);
        }
    };

    const clearGeneralError = () => {
        setGeneralError(null);
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
                    <h1 className="text-3xl font-bold text-white drop-shadow-md">Create an account</h1>
                    <p className="text-white/70 mt-2">Start tracking your loans today</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* General Error Alert */}
                    {generalError && (
                        <div
                            className={`p-4 border rounded-xl animate-fadeIn ${getErrorStyles()}`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                    {getErrorIcon()}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{generalError.message}</p>
                                    {generalError.type === 'duplicate' && (
                                        <p className="text-xs mt-2 opacity-80">
                                            Already have an account?{' '}
                                            <Link
                                                to="/login"
                                                className="underline hover:opacity-100 font-semibold"
                                            >
                                                Sign in here
                                            </Link>
                                        </p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={clearGeneralError}
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
                        <div className="relative">
                            <Input
                                type="email"
                                value={email}
                                onChange={handleEmailChange}
                                onBlur={() => handleBlur('email')}
                                placeholder="Enter your email"
                                required
                                disabled={isLoading}
                                showErrorIcon={false}
                                className={`bg-white/20 text-white placeholder-white/50 transition-all ${errors.email
                                    ? 'border-red-400 focus:border-red-400 focus:ring-red-400/50'
                                    : 'border-white/30 focus:ring-indigo-400 focus:border-indigo-400'
                                    }`}
                            />
                            {errors.email && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <FiAlertCircle className="w-5 h-5 text-red-400" />
                                </div>
                            )}
                        </div>
                        {errors.email && (
                            <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1 animate-fadeIn">
                                <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Password Input */}
                    <div className="flex flex-col">
                        <label className="mb-1 text-white text-sm font-medium">Password</label>
                        <div className="relative">
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={handlePasswordChange}
                                onBlur={() => handleBlur('password')}
                                placeholder="Create a password"
                                required
                                disabled={isLoading}
                                showErrorIcon={false}
                                className={`bg-white/20 text-white placeholder-white/50 transition-all pr-10 ${errors.password
                                    ? 'border-red-400 focus:border-red-400 focus:ring-red-400/50'
                                    : 'border-white/30 focus:ring-indigo-400 focus:border-indigo-400'
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                            >
                                {showPassword ? (
                                    <FiEyeOff className="w-5 h-5" />
                                ) : (
                                    <FiEye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1 animate-fadeIn">
                                <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                {errors.password}
                            </p>
                        )}

                        {/* Password Strength Indicator */}
                        {password && (
                            <div className="mt-2 space-y-2 animate-fadeIn">
                                {/* Strength Bar */}
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${passwordStrength.bgColor} transition-all duration-300`}
                                            style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                                        />
                                    </div>
                                    <span className={`text-xs font-medium ${passwordStrength.color}`}>
                                        {passwordStrength.label}
                                    </span>
                                </div>

                                {/* Requirements */}
                                <div className="grid grid-cols-2 gap-1">
                                    {passwordRequirements.slice(0, 4).map((req, index) => (
                                        <div
                                            key={index}
                                            className={`flex items-center gap-1 text-xs ${req.met ? 'text-green-400' : 'text-white/50'
                                                }`}
                                        >
                                            {req.met ? (
                                                <FiCheck className="w-3 h-3" />
                                            ) : (
                                                <div className="w-3 h-3 rounded-full border border-current" />
                                            )}
                                            {req.text}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password Input */}
                    <div className="flex flex-col">
                        <label className="mb-1 text-white text-sm font-medium">Confirm Password</label>
                        <div className="relative">
                            <Input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                                onBlur={() => handleBlur('confirmPassword')}
                                placeholder="Confirm your password"
                                required
                                disabled={isLoading}
                                showErrorIcon={false}
                                className={`bg-white/20 text-white placeholder-white/50 transition-all pr-10 ${errors.confirmPassword
                                    ? 'border-red-400 focus:border-red-400 focus:ring-red-400/50'
                                    : confirmPassword && confirmPassword === password
                                        ? 'border-green-400 focus:border-green-400 focus:ring-green-400/50'
                                        : 'border-white/30 focus:ring-indigo-400 focus:border-indigo-400'
                                    }`}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                {confirmPassword && confirmPassword === password && !errors.confirmPassword && (
                                    <FiCheck className="w-5 h-5 text-green-400" />
                                )}
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="text-white/70 hover:text-white transition-colors"
                                >
                                    {showConfirmPassword ? (
                                        <FiEyeOff className="w-5 h-5" />
                                    ) : (
                                        <FiEye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                        {errors.confirmPassword && (
                            <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1 animate-fadeIn">
                                <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                {errors.confirmPassword}
                            </p>
                        )}
                        {confirmPassword && confirmPassword === password && !errors.confirmPassword && (
                            <p className="mt-1.5 text-sm text-green-400 flex items-center gap-1 animate-fadeIn">
                                <FiCheck className="w-3.5 h-3.5 flex-shrink-0" />
                                Passwords match
                            </p>
                        )}
                    </div>

                    {/* Terms and Conditions */}
                    <p className="text-xs text-white/60 text-center">
                        By creating an account, you agree to our{' '}
                        <Link to="/terms" className="underline hover:text-white/80">
                            Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy" className="underline hover:text-white/80">
                            Privacy Policy
                        </Link>
                    </p>

                    <Button
                        type="submit"
                        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        isLoading={isLoading}
                        disabled={isLoading}
                        leftIcon={!isLoading ? <FiUserPlus className="w-5 h-5" /> : undefined}
                    >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-white/70">
                    <span>Already have an account? </span>
                    <Link
                        to="/login"
                        className="text-indigo-800 hover:text-indigo-200 font-bold transition-colors underline"
                    >
                        Sign in
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
