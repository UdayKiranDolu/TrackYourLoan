import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiEye, FiKey, FiUserCheck, FiUsers } from 'react-icons/fi';
import { adminApi } from '../../api/admin.api';
import { useAuth } from '../../hooks/useAuth';
import { User, Pagination as PaginationType } from '../../types';
import { formatDate } from '../../utils/formatDate';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { PageLoader } from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

export default function UsersManagement() {
    const { impersonate, user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [pagination, setPagination] = useState<PaginationType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    // Reset password modal
    const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
    const [tempPassword, setTempPassword] = useState('');
    const [isResetting, setIsResetting] = useState(false);

    const fetchUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await adminApi.getUsers({ search, page, limit: 10 });
            setUsers(response.data);
            setPagination(response.pagination);
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    }, [search, page]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleImpersonate = async (userId: string) => {
        try {
            await impersonate(userId);
        } catch (error) {
            toast.error('Failed to impersonate user');
        }
    };

    const handleResetPassword = async () => {
        if (!resetPasswordUser || !tempPassword) return;

        if (tempPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setIsResetting(true);
        try {
            await adminApi.resetPassword(resetPasswordUser._id || resetPasswordUser.id, tempPassword);
            toast.success('Password reset successfully. User must change password on next login.');
            setResetPasswordUser(null);
            setTempPassword('');
            fetchUsers();
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="page-title">Users Management</h1>
                <p className="page-subtitle">View and manage all registered users</p>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search by email..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
            </div>

            {/* Content */}
            {isLoading ? (
                <PageLoader />
            ) : users.length === 0 ? (
                <EmptyState
                    icon={<FiUsers className="w-8 h-8 text-gray-400" />}
                    title="No users found"
                    description={search ? 'Try adjusting your search' : 'No users registered yet'}
                />
            ) : (
                <>
                    <Card className="overflow-hidden p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Joined
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user) => {
                                        const userId = user._id || user.id;
                                        const isCurrentUser = userId === currentUser?.id;

                                        return (
                                            <tr key={userId} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                            <span className="text-sm font-medium text-gray-600">
                                                                {user.email.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div className="ml-3">
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {user.email}
                                                            </p>
                                                            {isCurrentUser && (
                                                                <p className="text-xs text-gray-500">(You)</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge
                                                        variant={user.role === 'ADMIN' ? 'info' : 'default'}
                                                    >
                                                        {user.role}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {user.forcePasswordReset ? (
                                                        <Badge variant="warning">Password Reset Required</Badge>
                                                    ) : (
                                                        <Badge variant="success">Active</Badge>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link to={`/admin/users/${userId}`}>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                leftIcon={<FiEye className="w-3 h-3" />}
                                                            >
                                                                View
                                                            </Button>
                                                        </Link>
                                                        {!isCurrentUser && user.role !== 'ADMIN' && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => setResetPasswordUser(user)}
                                                                    leftIcon={<FiKey className="w-3 h-3" />}
                                                                >
                                                                    Reset PW
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleImpersonate(userId)}
                                                                    leftIcon={<FiUserCheck className="w-3 h-3" />}
                                                                >
                                                                    Impersonate
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {pagination && (
                            <Pagination pagination={pagination} onPageChange={setPage} />
                        )}
                    </Card>
                </>
            )}

            {/* Reset Password Modal */}
            <Modal
                isOpen={!!resetPasswordUser}
                onClose={() => {
                    setResetPasswordUser(null);
                    setTempPassword('');
                }}
                title="Reset User Password"
                footer={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setResetPasswordUser(null);
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
                        Set a temporary password for <strong>{resetPasswordUser?.email}</strong>.
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