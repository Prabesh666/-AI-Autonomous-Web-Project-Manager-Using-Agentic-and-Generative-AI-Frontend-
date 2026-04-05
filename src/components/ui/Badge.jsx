import React from 'react';

/**
 * Reusable Badge component for statuses and tags.
 * 
 * Props:
 * - variant: 'neutral' | 'info' | 'success' | 'warning' | 'error' | 'indigo' | 'purple'
 * - glow: boolean (adds a subtle outer glow based on the variant color)
 * - outline: boolean (renders with a border and transparent background)
 * - size: 'sm' | 'md'
 * - children: string | ReactNode
 */
const Badge = ({
  children,
  variant = 'neutral',
  glow = false,
  outline = false,
  size = 'sm',
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-bold px-2.5 py-0.5 rounded-full letter-spacing-wide uppercase select-none';
  
  const sizeClasses = {
    sm: 'text-[0.62rem]',
    md: 'text-[0.72rem] px-3 py-1',
  };

  const variants = {
    neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700',
    info: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50',
    success: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50',
    warning: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-100 dark:border-amber-800/50',
    error: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-100 dark:border-red-800/50',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-100 dark:border-purple-800/50',
  };

  const glowStyles = {
    neutral: 'shadow-[0_0_10px_rgba(156,163,175,0.25)]',
    info: 'shadow-[0_0_12px_rgba(59,130,246,0.3)]',
    success: 'shadow-[0_0_12px_rgba(16,185,129,0.3)]',
    warning: 'shadow-[0_0_12px_rgba(245,158,11,0.3)]',
    error: 'shadow-[0_0_12px_rgba(239,68,68,0.3)]',
    indigo: 'shadow-[0_0_12px_rgba(79,70,229,0.3)]',
    purple: 'shadow-[0_0_12px_rgba(139,92,246,0.3)]',
  };

  const variantClass = variants[variant] || variants.neutral;
  const glowClass = glow ? glowStyles[variant] : '';
  const outlineClass = outline ? '!bg-transparent' : '';

  return (
    <span
      className={`${baseStyles} ${sizeClasses[size]} ${variantClass} ${glowClass} ${outlineClass} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
