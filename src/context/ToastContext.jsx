import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ message, type = 'info', duration = 4000 }) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type, duration }]);
    // Auto-remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Convenience helpers
  const toast = {
    success: (message, opts) => addToast({ message, type: 'success', ...opts }),
    error: (message, opts) => addToast({ message, type: 'error', duration: 6000, ...opts }),
    info: (message, opts) => addToast({ message, type: 'info', ...opts }),
    warning: (message, opts) => addToast({ message, type: 'warning', ...opts }),
  };

  const toastConfig = {
    success: {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      classes: 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800',
      iconClasses: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/50',
      textClasses: 'text-green-800 dark:text-green-300',
    },
    error: {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      classes: 'bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800',
      iconClasses: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/50',
      textClasses: 'text-red-800 dark:text-red-300',
    },
    warning: {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      classes: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800',
      iconClasses: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/50',
      textClasses: 'text-yellow-800 dark:text-yellow-300',
    },
    info: {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      classes: 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800',
      iconClasses: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/50',
      textClasses: 'text-blue-800 dark:text-blue-300',
    },
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast Portal */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none"
      >
        {toasts.map(({ id, message, type }) => {
          const cfg = toastConfig[type] || toastConfig.info;
          return (
            <div
              key={id}
              className={`
                pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg
                ${cfg.classes}
                animate-in slide-in-from-right-5 fade-in duration-300
              `}
            >
              <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${cfg.iconClasses}`}>
                {cfg.icon}
              </div>
              <p className={`text-sm font-medium flex-1 ${cfg.textClasses}`}>{message}</p>
              <button
                onClick={() => removeToast(id)}
                className={`flex-shrink-0 p-0.5 rounded transition-opacity opacity-60 hover:opacity-100 ${cfg.textClasses}`}
                aria-label="Dismiss"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

/**
 * Hook to trigger toasts anywhere in the app.
 * Usage:
 *   const toast = useToast();
 *   toast.success('Project created!');
 *   toast.error('Failed to fetch data');
 */
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};
