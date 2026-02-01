import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    FiArrowLeft,
    FiMail,
    FiUser,
    FiCalendar,
    FiDollarSign,
    FiClock,
    FiAlertCircle,
    FiCheckCircle,
    FiKey,
    FiUserCheck,
} from 'react-icons/fi';
import { adminApi } from '../../api/admin.api';
import { useAuth } from '../../hooks/useAuth';
import { UserWithStats } from '../../types';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { PageLoader } from '../../components/common/Loader';
import toast from 'react-hot-toast';

export default function UserDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { impersonate, user: currentUser } = useAuth();

    const [userData, setUserData] = useState<UserWithStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Reset password modal
    const [showResetModal, setShowResetModal] = useState(false);
    const [tempPassword, setTempPassword] = useState('');
    const [isResetting, setIsResetting] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            if (!id) return;

            try {
                const data = await adminApi.getUserById(id);
                setUserData(data);
            } catch (error) {
                toast.error('Failed to load user');
                navigate('/admin/users');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, [id, navigate]);

    const handleImpersonate = async () => {
        if (!id) return;
        try {
            await impersonate(id);
        } catch (error) {
            toast.error('Failed to impersonate user');
        }
    };

    const handleResetPassword = async () => {
        if (!id || !tempPassword) return;

        if (tempPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setIsResetting(true);
        try {
            await adminApi.resetPassword(id, tempPassword);
            toast.success('Password reset successfully');
            setShowResetModal(false);
            setTempPassword('');

            // Refresh user data
            const data = await adminApi.getUserById(id);
            setUserData(data);
        } catch (error) {
            toast.error('Failed to reset password');
        } finally {
            setIsResetting(false);
        }
    };

    const generateTempPassword = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
        let password = '';
        for (let i = 0; i < 8; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setTempPassword(password);
    };

    if (isLoading) {
        return <PageLoader />;
    }

    if (!userData) {
        return null;
    }

    const { user, loanStats } = userData;
    const userId = user._id || user.id;
    const isCurrentUser = userId === currentUser?.id;
    const isAdmin = user.role === 'ADMIN';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/admin/users')}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                >
                    <FiArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="page-title">{user.email}</h1>
                        <Badge variant={user.role === 'ADMIN' ? 'info' : 'default'}>
                            {user.role}
                        </Badge>
                        {user.forcePasswordReset && (
                            <Badge variant="warning">Password Reset Required</Badge>
                        )}
                    </div>
                    <p className="page-subtitle">User Details</p>
                </div>

                {!isCurrentUser && !isAdmin && (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowResetModal(true)}
                            leftIcon={<FiKey className="w-4 h-4" />}
                        >
                            Reset Password
                        </Button>
                        <Button
                            onClick={handleImpersonate}
                            leftIcon={<FiUserCheck className="w-4 h-4" />}
                        >
                            Impersonate
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User Info */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Account Information
                        </h3>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <FiMail className="w-4 h-4 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <FiUser className="w-4 h-4 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Role</p>
                                    <p className="font-medium capitalize">{user.role.toLowerCase()}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <FiCalendar className="w-4 h-4 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Joined</p>
                                    <p className="font-medium">
                                        {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Loan Stats */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <FiDollarSign className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Total Loans</p>
                                    <p className="text-xl font-bold">{loanStats.totalLoans}</p>
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <FiClock className="w-4 h-4 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Active</p>
                                    <p className="text-xl font-bold">{loanStats.activeLoans}</p>
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <FiAlertCircle className="w-4 h-4 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Overdue</p>
                                    <p className="text-xl font-bold">{loanStats.overdueLoans}</p>
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <FiCheckCircle className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Completed</p>
                                    <p className="text-xl font-bold">{loanStats.completedLoans}</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <Card>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Amount Lent</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {formatCurrency(loanStats.totalAmount)}
                                </p>
                            </div>
                            <Link to={`/admin/loans?userId=${userId}`}>
                                <Button variant="outline">View Loans</Button>
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Reset Password Modal */}
            <Modal
                isOpen={showResetModal}
                onClose={() => {
                    setShowResetModal(false);
                    setTempPassword('');
                }}
                title="Reset User Password"
                footer={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowResetModal(false);
                                setTempPassword('');
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleResetPassword}
                            isLoading={isResetting}
                            disabled={!tempPassword || tempPassword.length < 6}
                        >
                            Reset Password
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Set a temporary password for <strong>{user.email}</strong>.
                        The user will be required to change their password on next login.
                    </p>

                    <div className="flex gap-2">
                        <Input
                            label="Temporary Password"
                            type="text"
                            value={tempPassword}
                            onChange={(e) => setTempPassword(e.target.value)}
                            placeholder="Enter temporary password"
                            helperText="Must be at least 6 characters"
                            className="flex-1"
                        />
                        <div className="pt-6">
                            <Button variant="outline" onClick={generateTempPassword}>
                                Generate
                            </Button>
                        </div>
                    </div>

                    {tempPassword && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                                <strong>Important:</strong> Make sure to securely share this password with the user.
                            </p>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}