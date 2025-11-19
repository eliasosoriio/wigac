import React from 'react';
import { clsx } from 'clsx';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className }) => {
  return (
    <div className="w-full overflow-x-auto scrollbar-thin">
      <table className={clsx('w-full', className)}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <thead className="bg-apple-gray-50 border-b border-apple-gray-200">
      {children}
    </thead>
  );
};

export const TableBody: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <tbody className="divide-y divide-apple-gray-200">{children}</tbody>;
};

export const TableRow: React.FC<{ children: React.ReactNode; onClick?: () => void }> = ({
  children,
  onClick
}) => {
  return (
    <tr
      className={clsx(
        'transition-colors',
        onClick && 'cursor-pointer hover:bg-apple-gray-50'
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

export const TableHead: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => {
  return (
    <th className={clsx('px-6 py-3 text-left text-xs font-semibold text-apple-gray-600 uppercase tracking-wider', className)}>
      {children}
    </th>
  );
};

export const TableCell: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => {
  return (
    <td className={clsx('px-6 py-4 text-sm text-apple-gray-900', className)}>
      {children}
    </td>
  );
};
