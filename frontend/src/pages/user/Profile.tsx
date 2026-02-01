import React, { useState } from 'react';
import { FiUser, FiLock, FiMail, FiCalendar } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/formatDate';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function Profile() {
    const { user, changePassword } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        try {
            await changePassword(currentPassword, newPassword);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            toast.success('Password changed successfully');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to change password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="page-title">Profile</h1>
                <p className="page-subtitle">Manage your account settings</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Account Info */}
                <Card>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                        Account Information
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                <FiMail className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium text-gray-900">{user?.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                <FiUser className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Role</p>
                                <p className="font-medium text-gray-900 capitalize">
                                    {user?.role?.toLowerCase()}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                <FiCalendar className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Member Since</p>
                                <p className="font-medium text-gray-900">
                                    {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Change Password */}
                <Card>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                        Change Password
                    </h3>

                    <form onSubmit={handleChangePassword} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <Input
                            label="Current Password"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                            required
                        />

                        <Input
                            label="New Password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            helperText="Must be at least 6 characters"
                            required
                        />

                        <Input
                            label="Confirm New Password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            required
                        />

                        <Button
                            type="submit"
                            isLoading={isLoading}
                            leftIcon={<FiLock className="w-4 h-4" />}
                        >
                            Update Password
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
}