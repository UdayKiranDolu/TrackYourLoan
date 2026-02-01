import React from 'react';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

interface SummaryCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
};

export default function SummaryCard({
    title,
    value,
    icon,
    color,
    trend,
}: SummaryCardProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>

                    {trend && (
                        <div className="flex items-center gap-1 mt-2">
                            {trend.isPositive ? (
                                <FiTrendingUp className="w-4 h-4 text-green-500" />
                            ) : (
                                <FiTrendingDown className="w-4 h-4 text-red-500" />
                            )}
                            <span
                                className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'
                                    }`}
                            >
                                {trend.value}%
                            </span>
                        </div>
                    )}
                </div>

                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
            </div>
        </div>
    );
}