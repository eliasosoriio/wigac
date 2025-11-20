import React, { Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  footer
}) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Fragment>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9999]"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={clsx(
                'glass dark:bg-dark-card dark:border dark:border-dark-border w-full rounded-apple-xl shadow-apple-xl dark:shadow-2xl pointer-events-auto',
                sizes[size]
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              {title && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-apple-gray-200 dark:border-dark-border">
                  <h2 className="text-xl font-semibold text-apple-gray-900 dark:text-apple-gray-100">{title}</h2>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-full hover:bg-apple-gray-200 dark:hover:bg-dark-hover transition-colors"
                  >
                    <X className="w-5 h-5 text-apple-gray-500 dark:text-apple-gray-400" />
                  </button>
                </div>
              )}

              {/* Body */}
              <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin">
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-apple-gray-200 dark:border-dark-border bg-apple-gray-50/50 dark:bg-dark-hover">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </Fragment>
      )}
    </AnimatePresence>
  );
};
