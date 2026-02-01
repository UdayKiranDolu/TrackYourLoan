import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/common/Loader';

interface AdminRouteProps {
    children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
    const { isAuthenticated, isLoading, user, isImpersonating } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader size="lg" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If impersonating, redirect to user dashboard
    if (isImpersonating) {
        return <Navigate to="/dashboard" replace />;
    }

    // Check if user is admin
    if (user?.role !== 'ADMIN') {
        return <Navigate to="/dashboard" replace />;
    }

    // Check if admin needs to change password
    if (
        user?.forcePasswordReset &&
        location.pathname !== '/change-password-required'
    ) {
        return <Navigate to="/change-password-required" replace />;
    }

    return <>{children}</>;
}