import api from './index';

/** Fetch current user's full profile + live stats */
export const getMyProfile = () => api.get('/auth/me');

/** Update current user's profile fields */
export const updateMyProfile = (data) => api.put('/auth/me', data);
