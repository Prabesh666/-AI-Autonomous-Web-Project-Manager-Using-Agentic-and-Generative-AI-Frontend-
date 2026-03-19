import api from './index';

export const runAgent = async (type, payload) => {
  const response = await api.post('/agents/run', { type, payload });
  return response.data;
};

