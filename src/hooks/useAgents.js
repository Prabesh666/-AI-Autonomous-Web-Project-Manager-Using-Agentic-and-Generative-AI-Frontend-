import { useState } from 'react';
import { runAgent } from '../api/agents';

export const useAgents = () => {
  const [loadingMap, setLoadingMap] = useState({});
  const [resultsMap, setResultsMap] = useState({});
  const [errorMap, setErrorMap] = useState({});

  /**
   * Dispatches the runAgent function while tracking state per engine type
   * @param {string} type - The agent type (e.g. 'planner', 'scoring')
   * @param {object} payload - The payload context
   */
  const executeAgent = async (type, payload) => {
    // Set loading for this specific type
    setLoadingMap(prev => ({ ...prev, [type]: true }));
    setErrorMap(prev => ({ ...prev, [type]: null }));
    
    try {
      const data = await runAgent(type, payload);
      setResultsMap(prev => ({ ...prev, [type]: data }));
      return data;
    } catch (err) {
      setErrorMap(prev => ({ 
        ...prev, 
        [type]: err.message || 'Failed to execute agent' 
      }));
      throw err;
    } finally {
      setLoadingMap(prev => ({ ...prev, [type]: false }));
    }
  };

  /**
   * Optional helper to clear specific results from the UI
   */
  const clearResult = (type) => {
    setResultsMap(prev => {
      const newMap = { ...prev };
      delete newMap[type];
      return newMap;
    });
    setErrorMap(prev => {
      const newMap = { ...prev };
      delete newMap[type];
      return newMap;
    });
  };

  return {
    loadingMap,
    resultsMap,
    errorMap,
    executeAgent,
    clearResult
  };
};
