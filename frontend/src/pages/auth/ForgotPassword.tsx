import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setIsSubmitted(true);
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-2xl">LT</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Forgot password?</h1>
                    <p className="text-gray-500 mt-1">
                        {isSubmitted
                            ? 'Check your email for reset instructions'
                            : "We'll send you reset instructions"}
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    {isSubmitted ? (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiMail className="w-8 h-8 text-green-600" />
                            </div>
                            <p className="text-gray-600 mb-6">
                                If an account exists for <strong>{email}</strong>, you will receive
                                password reset instructions shortly.
                            </p>
                            <p className="text-sm text-gray-500 mb-6">
                                Note: Email functionality is not yet configured. Please contact your
                                administrator for password reset.
                            </p>
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                            >
                                <FiArrowLeft className="w-4 h-4" />
                                Back to login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Input
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                            />

                            <Button type="submit" className="w-full" isLoading={isLoading}>
                                Send Reset Instructions
                            </Button>

                            <div className="text-center">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
                                >
                                    <FiArrowLeft className="w-4 h-4" />
                                    Back to login
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}