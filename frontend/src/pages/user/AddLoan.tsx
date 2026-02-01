import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { loanApi } from '../../api/loan.api';
import { LoanFormData } from '../../types';
import LoanForm from '../../components/loans/LoanForm';
import toast from 'react-hot-toast';

export default function AddLoan() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (data: LoanFormData) => {
        setIsLoading(true);
        try {
            await loanApi.create(data);
            toast.success('Loan created successfully');
            navigate('/loans');
        } catch (error) {
            toast.error('Failed to create loan');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/loans')}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                >
                    <FiArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="page-title">Add New Loan</h1>
                    <p className="page-subtitle">Create a new loan record</p>
                </div>
            </div>

            {/* Form */}
            <div className="max-w-2xl">
                <LoanForm onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
        </div>
    );
}