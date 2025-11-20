import React, { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-apple-gray-400 dark:text-apple-gray-500">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={clsx(
              'w-full px-4 py-2.5 rounded-apple border',
              'bg-white dark:bg-dark-hover text-apple-gray-900 dark:text-apple-gray-100',
              'border-apple-gray-300 dark:border-dark-border',
              'placeholder-apple-gray-400 dark:placeholder-apple-gray-500',
              'focus-apple focus:border-apple-blue-500 dark:focus:border-apple-blue-400',
              'transition-all duration-200',
              error && 'border-apple-red-500 focus:ring-apple-red-500',
              icon && 'pl-10',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-apple-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
