import { useState } from 'react';
import { useAgents } from '../../hooks/useAgents';

const AiPanel = ({ projectId }) => {
  const { loadingMap, resultsMap, errorMap, executeAgent } = useAgents();
  const [activeTab, setActiveTab] = useState('agents'); // 'agents' or 'engines'

  const coreAgents = [
    { id: 'planner', name: 'Run Planner', description: 'Generates a macroscopic project execution plan based on overarching goals.', icon: '🧠' },
    { id: 'task', name: 'Run Task Agent', description: 'Deconstructs the project scope into actionable, granular tasks.', icon: '📝' },
    { id: 'risk', name: 'Run Risk Analysis', description: 'Scans the project ecosystem for potential risks and bottlenecks.', icon: '⚠️' },
    { id: 'ethics', name: 'Run Ethics Check', description: 'Analyzes decisions for ethical compliance and bias reduction.', icon: '⚖️' },
    { id: 'report', name: 'Generate Report', description: 'Synthesizes all current project data into a comprehensive report.', icon: '📊' },
  ];

  const ruleEngines = [
    { id: 'rule', name: 'Run Rule Engine', description: 'Evaluates structural business logic against current project states.', icon: '⚙️' },
    { id: 'scoring', name: 'Run Scoring Engine', description: 'Calculates performance, priority, and risk scoring metrics matrix.', icon: '🎯' },
    { id: 'dependency', name: 'Run Dependency Engine', description: 'Maps out task dependencies and visualizes the critical path.', icon: '🔗' },
    { id: 'replanning', name: 'Run Replanning Engine', description: 'Triggers adaptive workflows based on recent timeline deviations.', icon: '🔄' },
  ];

  const handleRun = (type) => {
    // Standard call: POST /agents/run { projectId, type }
    executeAgent(type, projectId);
  };

  const renderCard = ({ id, name, description, icon }) => {
    const isLoading = loadingMap[id];
    const hasResult = !!resultsMap[id];
    const hasError = !!errorMap[id];

    return (
      <div key={id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 flex-grow">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">{icon}</span>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Console / Output area */}
        {(hasResult || hasError || isLoading) && (
          <div className="bg-gray-900 px-4 py-3 border-t border-gray-800 max-h-60 overflow-y-auto">
            {isLoading && (
              <div className="flex items-center text-blue-400 text-sm font-mono">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Executing {id} process at highly-concurrent runtime...
              </div>
            )}
            {hasError && !isLoading && (
              <div className="text-red-400 text-sm font-mono whitespace-pre-wrap">
                [ERROR] {errorMap[id]}
              </div>
            )}
            {hasResult && !isLoading && !hasError && (
              <pre className="text-green-400 text-xs font-mono whitespace-pre-wrap break-words">
                {JSON.stringify(resultsMap[id], null, 2)}
              </pre>
            )}
          </div>
        )}

        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button
            onClick={() => handleRun(id)}
            disabled={isLoading}
            className="inline-flex items-center text-sm font-medium px-4 py-2 bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Running...' : (hasResult ? 'Re-run Agent' : 'Initialize')}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-6 flex flex-col gap-6 font-sans">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('agents')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'agents'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300'
            }`}
          >
            Core Agents
          </button>
          <button
            onClick={() => setActiveTab('engines')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'engines'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300'
            }`}
          >
            Runtime Engines
          </button>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeTab === 'agents' && coreAgents.map(renderCard)}
        {activeTab === 'engines' && ruleEngines.map(renderCard)}
      </div>
    </div>
  );
};

export default AiPanel;
