import React from 'react';
import { clsx } from 'clsx';

interface TagProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
}

export const Tag: React.FC<TagProps> = ({
  children,
  variant = 'default',
  size = 'md'
}) => {
  const variants = {
    default: 'bg-apple-gray-200 text-apple-gray-700',
    primary: 'bg-apple-blue-100 text-apple-blue-600',
    success: 'bg-green-100 text-apple-green-600',
    warning: 'bg-orange-100 text-apple-orange-600',
    danger: 'bg-red-100 text-apple-red-600',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size]
      )}
    >
      {children}
    </span>
  );
};
