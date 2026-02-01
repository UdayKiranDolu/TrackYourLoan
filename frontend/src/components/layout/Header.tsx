import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FiBell,
    FiUser,
    FiLogOut,
    FiMenu,
    FiChevronDown,
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useUnreadCount } from '../../hooks/useNotifications';

interface HeaderProps {
    onMenuClick: () => void;
    isAdmin?: boolean;
}

export default function Header({ onMenuClick, isAdmin = false }: HeaderProps) {
    const { user, logout, isImpersonating } = useAuth();
    const { count: unreadCount } = useUnreadCount();
    const [showDropdown, setShowDropdown] = useState(false);

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left side */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onMenuClick}
                            className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
                        >
                            <FiMenu className="w-5 h-5" />
                        </button>

                        <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">LT</span>
                            </div>
                            <span className="font-semibold text-gray-900 hidden sm:block">
                                Loan Tracker
                            </span>
                        </Link>

                        {isImpersonating && (
                            <span className="hidden sm:inline-flex px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                                Impersonating
                            </span>
                        )}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-2">
                        {/* Notifications (only for non-admin view) */}
                        {!isAdmin && (
                            <Link
                                to="/notifications"
                                className="relative p-2 rounded-lg hover:bg-gray-100"
                            >
                                <FiBell className="w-5 h-5 text-gray-600" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </Link>
                        )}

                        {/* User dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
                            >
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                    <FiUser className="w-4 h-4 text-gray-600" />
                                </div>
                                <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[150px] truncate">
                                    {user?.email}
                                </span>
                                <FiChevronDown className="w-4 h-4 text-gray-500" />
                            </button>

                            {showDropdown && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setShowDropdown(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
                                        <div className="px-4 py-2 border-b">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {user?.email}
                                            </p>
                                            <p className="text-xs text-gray-500 capitalize">
                                                {user?.role?.toLowerCase()}
                                            </p>
                                        </div>

                                        <Link
                                            to="/profile"
                                            onClick={() => setShowDropdown(false)}
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            <FiUser className="w-4 h-4" />
                                            Profile
                                        </Link>

                                        <button
                                            onClick={() => {
                                                setShowDropdown(false);
                                                logout();
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                                        >
                                            <FiLogOut className="w-4 h-4" />
                                            Logout
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}