const statusConfig = {
  true: {
    icon: '✅',
    badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    border: 'border-l-green-500',
    label: 'PASSED',
  },
  false: {
    icon: '❌',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    border: 'border-l-red-500',
    label: 'FAILED',
  },
};

const moduleColors = {
  system: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  auth: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  project: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  task: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  agent: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  engine: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  report: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

const TestResultCard = ({ result }) => {
  const { module, action, success, data, error, duration } = result;
  const cfg = statusConfig[success];
  const moduleCls = moduleColors[module] || moduleColors.system;

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-l-4 ${cfg.border} rounded-xl p-4 shadow-sm`}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-lg">{cfg.icon}</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${moduleCls}`}>
          {module}
        </span>
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{action}</span>
        <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
        {duration > 0 && (
          <span className="text-xs text-gray-400 dark:text-gray-500">{duration}ms</span>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {data && (
        <pre className="mt-2 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg px-3 py-2 overflow-x-auto whitespace-pre-wrap break-words">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default TestResultCard;
