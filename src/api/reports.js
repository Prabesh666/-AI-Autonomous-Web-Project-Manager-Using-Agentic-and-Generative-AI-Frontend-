import api from './index';

/**
 * Submit a new formal report
 * @param {object} data - { project, title, content }
 * @returns {Promise<any>} Response data from the API
 */
export const createReport = async (data) => {
  const response = await api.post('/api/reports', data);
  return response.data;
};

/**
 * Fetch prior reports for a specific project
 * @param {string} projectId 
 */
export const fetchReports = async (projectId) => {
  const response = await api.get(`/api/reports/project/${projectId}`);
  return response.data;
};
