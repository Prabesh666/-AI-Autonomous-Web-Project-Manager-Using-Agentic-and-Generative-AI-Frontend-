import { useState, useCallback } from 'react';
import { runAgent, getAgentJobStatus, approveAgentJob, rejectAgentJob } from '../api/agents';

/**
 * Centralized AI state hook.
 * All agent/engine calls must go through executeAgent(type, projectId, extra).
 * Loading, results, and errors are stored per-type to allow concurrent runs.
 */
export const useAgents = () => {
  const [loadingMap, setLoadingMap] = useState({});
  const [resultsMap, setResultsMap] = useState({});
  const [errorMap, setErrorMap] = useState({});

  /**
   * Status Polling logic.
   * Continues until status is 'completed' or 'failed'.
   */
  const pollJobStatus = useCallback(async (type, jobId, interval = 3000, maxAttempts = 100) => {
    let attempts = 0;
    
    return new Promise((resolve, reject) => {
      const check = async () => {
        attempts++;
        try {
          const res = await getAgentJobStatus(jobId);
          const job = res?.data || res;
          
          if (job.status === 'completed') {
            setResultsMap(prev => ({ ...prev, [type]: job.result }));
            resolve(job);
          } else if (job.status === 'pending_approval') {
            resolve(job);
          } else if (job.status === 'failed' || job.status === 'rejected') {
            const msg = job.error?.message || `Agent job ${job.status}`;
            setErrorMap(prev => ({ ...prev, [type]: msg }));
            reject(new Error(msg));
          } else if (attempts >= maxAttempts) {
            reject(new Error('Job polling timed out. Results may still be processing in background.'));
          } else {
            setTimeout(check, interval);
          }
        } catch (err) {
          reject(err);
        }
      };
      
      check();
    });
  }, []);

  /**
   * Run an agent/engine via the centralized /agents/run endpoint.
   * @param {string} type       - Agent type (e.g. 'planner', 'task', 'risk', 'rule')
   * @param {string} projectId  - The target project ID
   * @param {object} extra      - Optional extra fields to include in the body
   */
  const executeAgent = useCallback(async (type, projectId, extra = {}) => {
    if (!projectId) {
      const msg = 'A project must be selected before running an agent.';
      setErrorMap(prev => ({ ...prev, [type]: msg }));
      throw new Error(msg);
    }

    setLoadingMap(prev => ({ ...prev, [type]: true }));
    setErrorMap(prev => ({ ...prev, [type]: null }));

    try {
      const data = await runAgent(type, projectId, extra);
      setResultsMap(prev => ({ ...prev, [type]: data }));
      return data;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to execute agent';
      setErrorMap(prev => ({ ...prev, [type]: msg }));
      throw err;
    } finally {
      // We don't set loading false yet if it's queued, 
      // but usually the caller handles the next steps.
      setLoadingMap(prev => ({ ...prev, [type]: false }));
    }
  }, []);

  /**
   * Approve a pending HITL job.
   */
  const approveJob = useCallback(async (jobId, type) => {
    setLoadingMap(prev => ({ ...prev, [type]: true }));
    try {
      const { data } = await approveAgentJob(jobId);
      setResultsMap(prev => ({ ...prev, [type]: data.result }));
      return data;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to approve job';
      setErrorMap(prev => ({ ...prev, [type]: msg }));
      throw err;
    } finally {
      setLoadingMap(prev => ({ ...prev, [type]: false }));
    }
  }, []);

  /**
   * Reject a pending HITL job.
   */
  const rejectJob = useCallback(async (jobId, type, reason = '') => {
    setLoadingMap(prev => ({ ...prev, [type]: true }));
    try {
      const { data } = await rejectAgentJob(jobId, reason);
      setErrorMap(prev => ({ ...prev, [type]: 'Job was rejected by user' }));
      return data;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to reject job';
      setErrorMap(prev => ({ ...prev, [type]: msg }));
      throw err;
    } finally {
      setLoadingMap(prev => ({ ...prev, [type]: false }));
    }
  }, []);

  /** Remove a specific result/error from memory */
  const clearResult = useCallback((type) => {
    setResultsMap(prev => { const m = { ...prev }; delete m[type]; return m; });
    setErrorMap(prev => { const m = { ...prev }; delete m[type]; return m; });
  }, []);

  /** Clear all results */
  const clearAll = useCallback(() => {
    setResultsMap({});
    setErrorMap({});
  }, []);

  return {
    loadingMap,
    resultsMap,
    errorMap,
    executeAgent,
    pollJobStatus,
    approveJob,
    rejectJob,
    clearResult,
    clearAll,
  };
};
