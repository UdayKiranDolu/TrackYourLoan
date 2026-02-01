import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoanFormData, LoanStatus } from '../../types';
import { formatDateForInput } from '../../utils/formatDate';
import { LOAN_STATUS_OPTIONS } from '../../utils/constants';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import Card from '../common/Card';

interface LoanFormProps {
    initialData?: Partial<LoanFormData>;
    onSubmit: (data: LoanFormData) => Promise<void>;
    isLoading?: boolean;
    isEdit?: boolean;
}

export default function LoanForm({
    initialData,
    onSubmit,
    isLoading = false,
    isEdit = false,
}: LoanFormProps) {
    const navigate = useNavigate();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState<LoanFormData>({
        borrowerName: initialData?.borrowerName || '',
        actualAmount: initialData?.actualAmount || 0,
        interestAmount: initialData?.interestAmount || 0,
        givenDate: initialData?.givenDate
            ? formatDateForInput(initialData.givenDate)
            : formatDateForInput(new Date()),
        dueDate: initialData?.dueDate ? formatDateForInput(initialData.dueDate) : '',
        notes: initialData?.notes || '',
        status: initialData?.status || 'ACTIVE',
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                borrowerName: initialData.borrowerName || '',
                actualAmount: initialData.actualAmount || 0,
                interestAmount: initialData.interestAmount || 0,
                givenDate: initialData.givenDate
                    ? formatDateForInput(initialData.givenDate)
                    : formatDateForInput(new Date()),
                dueDate: initialData.dueDate ? formatDateForInput(initialData.dueDate) : '',
                notes: initialData.notes || '',
                status: initialData.status || 'ACTIVE',
            });
        }
    }, [initialData]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
        }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.borrowerName.trim()) {
            newErrors.borrowerName = 'Borrower name is required';
        }

        if (formData.actualAmount <= 0) {
            newErrors.actualAmount = 'Amount must be greater than 0';
        }

        if (formData.interestAmount < 0) {
            newErrors.interestAmount = 'Interest cannot be negative';
        }

        if (!formData.givenDate) {
            newErrors.givenDate = 'Given date is required';
        }

        if (!formData.dueDate) {
            newErrors.dueDate = 'Due date is required';
        }

        if (formData.givenDate && formData.dueDate) {
            if (new Date(formData.dueDate) < new Date(formData.givenDate)) {
                newErrors.dueDate = 'Due date must be after given date';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        await onSubmit(formData);
    };

    return (
        <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                    label="Borrower Name"
                    name="borrowerName"
                    value={formData.borrowerName}
                    onChange={handleChange}
                    error={errors.borrowerName}
                    placeholder="Enter borrower's name"
                    required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Principal Amount (₹)"
                        name="actualAmount"
                        type="number"
                        value={formData.actualAmount}
                        onChange={handleChange}
                        error={errors.actualAmount}
                        placeholder="0"
                        min="0"
                        required
                    />

                    <Input
                        label="Interest Amount (₹)"
                        name="interestAmount"
                        type="number"
                        value={formData.interestAmount}
                        onChange={handleChange}
                        error={errors.interestAmount}
                        placeholder="0"
                        min="0"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Given Date"
                        name="givenDate"
                        type="date"
                        value={formData.givenDate}
                        onChange={handleChange}
                        error={errors.givenDate}
                        required
                    />

                    <Input
                        label="Due Date"
                        name="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={handleChange}
                        error={errors.dueDate}
                        required
                    />
                </div>

                {isEdit && (
                    <Select
                        label="Status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        options={LOAN_STATUS_OPTIONS as unknown as { value: string; label: string }[]}
                    />
                )}

                <Textarea
                    label="Notes (Optional)"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Add any additional notes, penalties, or remarks..."
                />

                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Summary</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500">Principal</p>
                            <p className="font-semibold">₹{formData.actualAmount.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Interest</p>
                            <p className="font-semibold">₹{formData.interestAmount.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Total</p>
                            <p className="font-semibold text-primary-600">
                                ₹{(formData.actualAmount + formData.interestAmount).toLocaleString('en-IN')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isLoading}>
                        {isEdit ? 'Update Loan' : 'Create Loan'}
                    </Button>
                </div>
            </form>
        </Card>
    );
}