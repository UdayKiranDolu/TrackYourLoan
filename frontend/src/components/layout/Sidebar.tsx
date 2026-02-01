import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    FiHome,
    FiDollarSign,
    FiBell,
    FiUser,
    FiUsers,
    FiFileText,
    FiX,
} from 'react-icons/fi';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    isAdmin?: boolean;
}

interface NavItem {
    label: string;
    path: string;
    icon: React.ReactNode;
}

const userNavItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: <FiHome /> },
    { label: 'Loans', path: '/loans', icon: <FiDollarSign /> },
    { label: 'Notifications', path: '/notifications', icon: <FiBell /> },
    { label: 'Profile', path: '/profile', icon: <FiUser /> },
];

const adminNavItems: NavItem[] = [
    { label: 'Dashboard', path: '/admin', icon: <FiHome /> },
    { label: 'Users', path: '/admin/users', icon: <FiUsers /> },
    { label: 'All Loans', path: '/admin/loans', icon: <FiFileText /> },
];

export default function Sidebar({ isOpen, onClose, isAdmin = false }: SidebarProps) {
    const location = useLocation();
    const navItems = isAdmin ? adminNavItems : userNavItems;

    const isActive = (path: string) => {
        if (path === '/admin' || path === '/dashboard') {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                {/* Mobile close button */}
                <div className="flex items-center justify-between p-4 border-b lg:hidden">
                    <span className="font-semibold text-gray-900">Menu</span>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive(item.path)
                                    ? 'bg-primary-50 text-primary-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <span className="w-5 h-5">{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Admin badge */}
                {isAdmin && (
                    <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-purple-50 rounded-lg p-3">
                            <p className="text-xs font-medium text-purple-800">Admin Mode</p>
                            <p className="text-xs text-purple-600">Managing all users</p>
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
}