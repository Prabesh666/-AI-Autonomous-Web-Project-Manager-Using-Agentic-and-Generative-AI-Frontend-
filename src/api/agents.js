import api from './index';

/**
 * Centralized agent runner — always POST to /api/agents/run
 * with a standard { projectId, type } body.
 *
 * @param {string} type      - Agent/engine type key (e.g. 'planner', 'task', 'risk')
 * @param {string} projectId - MongoDB project _id
 * @param {object} extra     - Optional extra fields merged into the body
 * @returns {Promise<any>}
 */
export const runAgent = async (type, projectId, extra = {}) => {
  return api.post('/agents/run', {
    projectId,
    type,
    ...extra,
  });
};

/**
 * Get results/status of a specific AI job.
 * @param {string} jobId 
 * @returns {Promise<any>}
 */
export const getAgentJobStatus = async (jobId) => {
  return api.get(`/agents/status/${jobId}`);
};

/**
 * Approve a pending AI job.
 */
export const approveAgentJob = async (jobId) => {
  return api.post(`/agents/${jobId}/approve`);
};

/**
 * Reject a pending AI job.
 */
export const rejectAgentJob = async (jobId, reason = '') => {
  return api.post(`/agents/${jobId}/reject`, { reason });
};
