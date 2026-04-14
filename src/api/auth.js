import api from './index';

/**
 * Register a new user
 * @param {object} data - { name, email, password }
 * @returns {Promise<any>}
 */
export const registerUser = async (data) => {
  return api.post('/auth/register', data);
};

/**
 * Login an existing user
 * @param {object} data - { email, password }
 * @returns {Promise<any>}
 */
export const loginUser = async (data) => {
  return api.post('/auth/login', data);
};

export const requestOtp = async (email) => {
  return api.post('/auth/request-otp', { email });
};

export const verifyOtp = async (data) => {
  return api.post('/auth/verify-otp', data);
};

export const resetPasswordWithOtp = async (data) => {
  return api.post('/auth/reset-password-otp', data);
};
