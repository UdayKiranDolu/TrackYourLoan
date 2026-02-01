import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import ImpersonationBanner from './ImpersonationBanner';

interface LayoutProps {
    isAdmin?: boolean;
}

export default function Layout({ isAdmin = false }: LayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            <ImpersonationBanner />
            <Header onMenuClick={() => setSidebarOpen(true)} isAdmin={isAdmin} />

            <div className="flex">
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    isAdmin={isAdmin}
                />

                <main className="flex-1 p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}