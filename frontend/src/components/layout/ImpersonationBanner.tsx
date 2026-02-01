import React from 'react';
import { FiAlertCircle, FiX } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';

export default function ImpersonationBanner() {
    const { user, isImpersonating, stopImpersonation } = useAuth();

    if (!isImpersonating) return null;

    return (
        <div className="bg-yellow-500 text-yellow-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-medium">
                            You are viewing as <strong>{user?.email}</strong>
                        </p>
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={stopImpersonation}
                        className="bg-white hover:bg-yellow-50 text-yellow-900 border-yellow-600"
                        rightIcon={<FiX className="w-4 h-4" />}
                    >
                        Exit
                    </Button>
                </div>
            </div>
        </div>
    );
}