import api from './index';

/**
 * Submit a new formal report
 * @param {object} data - { project, title, content }
 * @returns {Promise<any>} Response data from the API
 */
export const createReport = async (data) => {
  return api.post('/reports', data);
};

/**
 * Fetch prior reports for a specific project
 * @param {string} projectId 
 */
export const fetchReports = async (projectId) => {
  return api.get(`/reports/${projectId}`);
};
