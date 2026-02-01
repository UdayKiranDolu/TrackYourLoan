import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { loanApi } from '../../api/loan.api';
import { Loan, LoanFormData } from '../../types';
import LoanForm from '../../components/loans/LoanForm';
import { PageLoader } from '../../components/common/Loader';
import toast from 'react-hot-toast';

export default function EditLoan() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loan, setLoan] = useState<Loan | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchLoan = async () => {
            if (!id) return;

            try {
                const data = await loanApi.getById(id);
                setLoan(data.loan);
            } catch (error) {
                toast.error('Failed to load loan');
                navigate('/loans');
            } finally {
                setIsLoading(false);
            }
        };

        fetchLoan();
    }, [id, navigate]);

    const handleSubmit = async (data: LoanFormData) => {
        if (!id) return;

        setIsSaving(true);
        try {
            await loanApi.update(id, data);
            toast.success('Loan updated successfully');
            navigate(`/loans/${id}`);
        } catch (error) {
            toast.error('Failed to update loan');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <PageLoader />;
    }

    if (!loan) {
        return null;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                >
                    <FiArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="page-title">Edit Loan</h1>
                    <p className="page-subtitle">Update loan for {loan.borrowerName}</p>
                </div>
            </div>

            {/* Form */}
            <div className="max-w-2xl">
                <LoanForm
                    initialData={loan}
                    onSubmit={handleSubmit}
                    isLoading={isSaving}
                    isEdit
                />
            </div>
        </div>
    );
}