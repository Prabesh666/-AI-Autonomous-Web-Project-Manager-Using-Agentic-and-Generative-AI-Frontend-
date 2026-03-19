import { useState, useCallback } from 'react';
import { runAllTests, testCredentials } from '../api/services/test.service';
import TestResultCard from '../components/TestResultCard';

const moduleOrder = ['system', 'auth', 'project', 'task', 'agent', 'engine', 'report'];

const moduleMeta = {
  system: { label: 'Health Check', emoji: '🏥' },
  auth: { label: 'Auth', emoji: '🔐' },
  project: { label: 'Projects', emoji: '📁' },
  task: { label: 'Tasks', emoji: '📋' },
  agent: { label: 'Agents', emoji: '🤖' },
  engine: { label: 'Engines', emoji: '⚙️' },
  report: { label: 'Reports', emoji: '📄' },
};

const TestDashboard = () => {
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(false);
  const [stopOnFailure, setStopOnFailure] = useState(false);
  const [creds, setCreds] = useState({ ...testCredentials });
  const [done, setDone] = useState(false);

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  const grouped = moduleOrder.reduce((acc, mod) => {
    const items = results.filter(r => r.module === mod);
    if (items.length) acc[mod] = items;
    return acc;
  }, {});

  const handleRun = useCallback(async () => {
    setResults([]);
    setDone(false);
    setRunning(true);
    testCredentials.email = creds.email;
    testCredentials.password = creds.password;
    testCredentials.name = creds.name;

    await runAllTests({
      stopOnFailure,
      onResult: (r) => setResults(prev => [...prev, r]),
    });
    setRunning(false);
    setDone(true);
  }, [creds, stopOnFailure]);

  const handleClear = () => {
    setResults([]);
    setDone(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              🧪 API Test Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Validate all backend modules in one click.
              Base URL: <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs">{import.meta.env.VITE_BACKEND_URL}/api</code>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {results.length > 0 && !running && (
              <button
                onClick={handleClear}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Clear
              </button>
            )}
            <button
              onClick={handleRun}
              disabled={running}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition shadow-sm"
            >
              {running ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Running Tests…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Run All Tests
                </>
              )}
            </button>
          </div>
        </div>

        {/* Config Panel */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Test Configuration</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Test Email</label>
              <input
                type="email"
                value={creds.email}
                onChange={e => setCreds(p => ({ ...p, email: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Password</label>
              <input
                type="password"
                value={creds.password}
                onChange={e => setCreds(p => ({ ...p, password: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => setStopOnFailure(p => !p)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${stopOnFailure ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${stopOnFailure ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Stop on failure</span>
              </label>
            </div>
          </div>
        </div>

        {/* Summary Bar */}
        {results.length > 0 && (
          <div className="flex items-center gap-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{results.length}</div>
            <div className="text-sm text-gray-500">Total</div>
            <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
            <div className="text-2xl font-bold text-green-600">{passed}</div>
            <div className="text-sm text-gray-500">Passed</div>
            <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
            <div className="text-2xl font-bold text-red-500">{failed}</div>
            <div className="text-sm text-gray-500">Failed</div>
            {done && (
              <div className={`ml-auto text-sm font-semibold px-3 py-1 rounded-full ${failed === 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                {failed === 0 ? '✅ All Passed' : `⚠️ ${failed} Failed`}
              </div>
            )}
          </div>
        )}

        {/* Live Results by Module */}
        {moduleOrder.map(mod => {
          const items = grouped[mod];
          if (!items) return null;
          const { label, emoji } = moduleMeta[mod] || { label: mod, emoji: '🔹' };
          const modPassed = items.filter(r => r.success).length;
          return (
            <div key={mod}>
              <div className="flex items-center gap-2 mb-2">
                <span>{emoji}</span>
                <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{label}</h2>
                <span className="text-xs text-gray-400">{modPassed}/{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((r, i) => (
                  <TestResultCard key={`${r.module}-${r.action}-${i}`} result={r} />
                ))}
              </div>
            </div>
          );
        })}

        {/* Empty / Idle State */}
        {results.length === 0 && !running && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">🧪</div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">No tests run yet</h3>
            <p className="text-sm text-gray-500 mt-1">Click "Run All Tests" to validate all 7 backend modules.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestDashboard;
