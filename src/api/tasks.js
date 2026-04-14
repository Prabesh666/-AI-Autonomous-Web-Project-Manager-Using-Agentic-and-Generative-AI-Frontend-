import api from './index';

/**
 * Fetch all tasks for a given project
 * @param {string|number} projectId 
 * @returns {Promise<any[]>}
 */
export const fetchTasksByProject = async (projectId) => {
  return api.get(`/tasks/project/${projectId}`);
};

/**
 * Create a new task
 * @param {object} data - Task data
 * @returns {Promise<any>}
 */
export const createTask = async (data) => {
  return api.post('/tasks', data);
};

/**
 * Update an existing task
 * @param {string|number} id 
 * @param {object} data - Updated task data
 * @returns {Promise<any>}
 */
export const updateTask = async (id, data) => {
  return api.put(`/tasks/${id}`, data);
};

/**
 * Delete a task
 * @param {string|number} id 
 * @returns {Promise<any>}
 */
export const deleteTask = async (id) => {
  return api.delete(`/tasks/${id}`);
};

