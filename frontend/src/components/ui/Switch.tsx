import React from 'react';
import { clsx } from 'clsx';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  disabled = false
}) => {
  return (
    <label className={clsx(
      'inline-flex items-center gap-3 cursor-pointer',
      disabled && 'opacity-50 cursor-not-allowed'
    )}>
      <div
        className={clsx(
          'relative w-12 h-7 rounded-full transition-all duration-200',
          checked ? 'bg-apple-green-500' : 'bg-apple-gray-300',
          !disabled && 'hover:opacity-90'
        )}
        onClick={() => !disabled && onChange(!checked)}
      >
        <div
          className={clsx(
            'absolute top-1 w-5 h-5 bg-white rounded-full shadow-apple transition-all duration-200',
            checked ? 'left-6' : 'left-1'
          )}
        />
      </div>
      {label && (
        <span className="text-sm font-medium text-apple-gray-700">{label}</span>
      )}
    </label>
  );
};
