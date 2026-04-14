import api from './index';

/**
 * Fetch all projects
 * @returns {Promise<any[]>}
 */
export const fetchProjects = async () => {
  return api.get('/projects');
};

/**
 * Fetch a single project by ID
 * @param {string|number} id 
 * @returns {Promise<any>}
 */
export const fetchProjectById = async (id) => {
  return api.get(`/projects/${id}`);
};

/**
 * Create a new project
 * @param {object} data - Project data
 * @returns {Promise<any>}
 */
export const createProject = async (data) => {
  return api.post('/projects', data);
};

/**
 * Update an existing project
 * @param {string|number} id 
 * @param {object} data - Updated project data
 * @returns {Promise<any>}
 */
export const updateProject = async (id, data) => {
  return api.put(`/projects/${id}`, data);
};

/**
 * Delete a project
 * @param {string|number} id 
 * @returns {Promise<any>}
 */
export const deleteProject = async (id) => {
  return api.delete(`/projects/${id}`);
};

