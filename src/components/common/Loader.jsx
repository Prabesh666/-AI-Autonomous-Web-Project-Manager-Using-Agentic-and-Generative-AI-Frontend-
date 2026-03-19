import Spinner from '../ui/Spinner';

/**
 * Full-screen Loader — used when authenticating or bootstrapping.
 */
const Loader = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-gray-900">
      <div className="relative">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 animate-pulse mb-6">
          <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      </div>
      <Spinner size="lg" color="text-blue-500" className="mb-4" />
      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium tracking-wide">{message}</p>
    </div>
  );
};

export default Loader;
