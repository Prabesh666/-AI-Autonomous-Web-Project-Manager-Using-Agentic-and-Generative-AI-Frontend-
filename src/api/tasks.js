import api from './index';

/**
 * Fetch all tasks for a given project
 * @param {string|number} projectId 
 * @returns {Promise<any[]>}
 */
export const fetchTasksByProject = async (projectId) => {
  const response = await api.get(`/tasks/project/${projectId}`);
  return response.data;
};

/**
 * Create a new task
 * @param {object} data - Task data
 * @returns {Promise<any>}
 */
export const createTask = async (data) => {
  const response = await api.post('/tasks', data);
  return response.data;
};

/**
 * Update an existing task
 * @param {string|number} id 
 * @param {object} data - Updated task data
 * @returns {Promise<any>}
 */
export const updateTask = async (id, data) => {
  const response = await api.put(`/tasks/${id}`, data);
  return response.data;
};

/**
 * Delete a task
 * @param {string|number} id 
 * @returns {Promise<any>}
 */
export const deleteTask = async (id) => {
  const response = await api.delete(`/tasks/${id}`);
  return response.data;
};

