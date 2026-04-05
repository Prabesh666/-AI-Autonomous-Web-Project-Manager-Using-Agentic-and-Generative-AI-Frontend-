import React from 'react';

/**
 * Reusable Input component with standardized spacing and Glassmorphism focus states.
 * 
 * Props:
 * - label: string (optional floating label)
 * - error: string (optional error message)
 * - icon: ReactNode (optional left-side icon)
 * - type: string (default 'text')
 * - className: string (extra input classes)
 * - containerClassName: string (extra container classes)
 * - ...props (standard input attributes)
 */
const Input = ({
  label,
  error,
  icon,
  type = 'text',
  className = '',
  containerClassName = '',
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
          {label}
        </label>
      )}
      
      <div className="relative group">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200">
            {icon}
          </div>
        )}
        
        <input
          type={type}
          className={`
            w-full transition-all duration-200
            bg-white dark:bg-gray-900/50 
            border ${error ? 'border-red-500 dark:border-red-500/50' : 'border-gray-200 dark:border-gray-700'}
            rounded-xl py-2.5 
            ${icon ? 'pl-11' : 'pl-4'} pr-4
            text-sm text-gray-900 dark:text-white placeholder-gray-400
            focus:ring-4 ${error ? 'focus:ring-red-500/10' : 'focus:ring-blue-500/10'} 
            focus:border-blue-500/50 dark:focus:border-blue-400/50
            outline-none
            ${className}
          `}
          {...props}
        />
      </div>
      
      {error && (
        <p className="text-xs font-medium text-red-500 ml-1 mt-0.5 animate-fadeIn">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
