// import React, { forwardRef } from 'react';

// interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
//     label?: string;
//     error?: string;
//     helperText?: string;
// }

// const Input = forwardRef<HTMLInputElement, InputProps>(
//     ({ label, error, helperText, className = '', ...props }, ref) => {
//         return (
//             <div className="w-full">
//                 {label && (
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                         {label}
//                         {props.required && <span className="text-red-500 ml-1">*</span>}
//                     </label>
//                 )}
//                 <input
//                     ref={ref}
//                     className={`block w-full px-3 py-2 border rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${error
//                             ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
//                             : 'border-gray-300'
//                         } ${className}`}
//                     {...props}
//                 />
//                 {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
//                 {helperText && !error && (
//                     <p className="mt-1 text-sm text-gray-500">{helperText}</p>
//                 )}
//             </div>
//         );
//     }
// );

// Input.displayName = 'Input';

// export default Input;












// frontend/src/components/common/Input.tsx

import React, { forwardRef } from 'react';
import { FiAlertCircle } from 'react-icons/fi';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    showErrorIcon?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, showErrorIcon = true, className = '', ...props }, ref) => {
        const hasError = !!error;

        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <div className="relative">
                    <input
                        ref={ref}
                        className={`
                            block w-full px-3 py-2 border rounded-lg shadow-sm text-sm 
                            focus:outline-none focus:ring-2 
                            transition-colors duration-200
                            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100
                            ${hasError
                                ? 'border-red-500 focus:ring-red-500 focus:border-red-500 pr-10'
                                : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                            } 
                            ${className}
                        `}
                        {...props}
                    />
                    {hasError && showErrorIcon && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <FiAlertCircle className="w-5 h-5 text-red-500" />
                        </div>
                    )}
                </div>
                {error && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p className="mt-1 text-sm text-gray-500">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;