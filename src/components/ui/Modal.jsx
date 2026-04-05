import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Reusable Universal Modal/Dialog component.
 * 
 * Props:
 * - isOpen: boolean (control visibility)
 * - onClose: fn (callback for closing)
 * - title: string (header title)
 * - size: 'sm' | 'md' | 'lg' | 'xl' (default 'md')
 * - children: string | ReactNode
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop (Glassmorphism) */}
      <div 
        className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Dialog */}
      <div className={`
        relative w-full ${sizeClasses[size]} 
        bg-white dark:bg-[#111827] 
        rounded-[28px] shadow-2xl border border-gray-100 dark:border-gray-800
        overflow-hidden animate-slideUp
      `}>
        {/* Header */}
        {(title || onClose) && (
          <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 dark:border-gray-800/60">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              {title}
            </h3>
            {onClose && (
              <button 
                onClick={onClose}
                className="p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
