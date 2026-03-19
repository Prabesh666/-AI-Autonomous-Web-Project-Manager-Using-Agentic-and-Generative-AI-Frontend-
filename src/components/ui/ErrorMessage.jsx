/**
 * Reusable ErrorMessage component.
 * Props:
 *  - message (string): the error text to display
 *  - title (string): optional heading, defaults to "Error"
 *  - onRetry (fn): optional retry callback — shows a "Try again" button
 *  - onDismiss (fn): optional dismiss callback — shows an X button
 *  - className: extra tailwind classes
 */
const ErrorMessage = ({ message, title = 'Something went wrong', onRetry, onDismiss, className = '' }) => {
  if (!message) return null;

  return (
    <div className={`flex gap-3 p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800/50 ${className}`} role="alert">
      {/* Icon */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-red-100 dark:bg-red-800/40">
          <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-red-800 dark:text-red-300">{title}</p>
        <p className="text-sm text-red-700 dark:text-red-400 mt-0.5">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-sm font-medium text-red-700 dark:text-red-400 underline hover:no-underline"
          >
            Try again
          </button>
        )}
      </div>

      {/* Dismiss */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200 rounded transition-colors"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
