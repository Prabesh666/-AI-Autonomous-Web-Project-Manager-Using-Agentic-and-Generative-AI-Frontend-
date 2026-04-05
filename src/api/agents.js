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
  const response = await api.post('/agents/run', {
    projectId,
    type,
    ...extra,
  });
  return response.data;
};
