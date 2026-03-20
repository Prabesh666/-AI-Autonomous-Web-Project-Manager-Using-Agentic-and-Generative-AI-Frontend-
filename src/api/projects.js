import api from './index';

/**
 * Fetch all projects
 * @returns {Promise<any[]>}
 */
export const fetchProjects = async () => {
  const response = await api.get('/projects');
  return response.data;
};

/**
 * Fetch a single project by ID
 * @param {string|number} id 
 * @returns {Promise<any>}
 */
export const fetchProjectById = async (id) => {
  const response = await api.get(`/projects/${id}`);
  return response.data;
};

/**
 * Create a new project
 * @param {object} data - Project data
 * @returns {Promise<any>}
 */
export const createProject = async (data) => {
  const response = await api.post('/projects', data);
  return response.data;
};

/**
 * Update an existing project
 * @param {string|number} id 
 * @param {object} data - Updated project data
 * @returns {Promise<any>}
 */
export const updateProject = async (id, data) => {
  const response = await api.put(`/projects/${id}`, data);
  return response.data;
};

/**
 * Delete a project
 * @param {string|number} id 
 * @returns {Promise<any>}
 */
export const deleteProject = async (id) => {
  const response = await api.delete(`/projects/${id}`);
  return response.data;
};

