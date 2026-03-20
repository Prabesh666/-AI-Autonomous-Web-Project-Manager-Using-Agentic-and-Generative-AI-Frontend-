import api from './index';

/**
 * Register a new user
 * @param {object} data - { name, email, password }
 * @returns {Promise<any>}
 */
export const registerUser = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

/**
 * Login an existing user
 * @param {object} data - { email, password }
 * @returns {Promise<any>}
 */
export const loginUser = async (data) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

