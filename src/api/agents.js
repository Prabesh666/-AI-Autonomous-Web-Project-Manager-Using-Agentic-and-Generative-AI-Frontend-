import api from './index';

/**
 * Run a specific agent type with a payload
 * @param {string} type - Agent type (e.g., 'planner', 'coder')
 * @param {object} payload - Input for the agent
 * @returns {Promise<any>}
 */
export const runAgent = async (type, payload) => {
  const response = await api.post('/agents/run', { type, payload });
  return response.data;
};

