import React, { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  glass = false,
  hover = false,
  className,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'rounded-apple-lg border',
        glass ? 'glass' : 'bg-white',
        hover && 'hover:shadow-apple-lg cursor-pointer',
        'shadow-apple transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={clsx('px-6 py-4 border-b border-apple-gray-200', className)} {...props}>
      {children}
    </div>
  );
};

export const CardBody: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={clsx('px-6 py-4', className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={clsx('px-6 py-4 border-t border-apple-gray-200 bg-apple-gray-50', className)} {...props}>
      {children}
    </div>
  );
};
