import React from 'react';
import Button from './Button';

/**
 * Reusable Empty State component for when lists or views have no data.
 * 
 * Props:
 * - title: string (main heading)
 * - description: string (sub-text)
 * - icon: ReactNode (optional illustration/svg)
 * - actionText: string (optional button text)
 * - onAction: fn (optional button click handler)
 * - className: string (extra container classes)
 */
const EmptyState = ({
  title = 'No data found',
  description = 'There is currently nothing to show in this view.',
  icon,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center bg-gray-50/50 dark:bg-gray-800/20 border-2 border-dashed border-gray-200 dark:border-gray-700/60 rounded-3xl animate-fadeIn ${className}`}>
      {/* Icon Wrapper */}
      <div className="flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 transition-transform duration-300 hover:scale-110">
        {icon ? icon : (
          <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        )}
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
        {title}
      </h3>
      <p className="max-w-[320px] text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8">
        {description}
      </p>

      {/* Optional Action */}
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
