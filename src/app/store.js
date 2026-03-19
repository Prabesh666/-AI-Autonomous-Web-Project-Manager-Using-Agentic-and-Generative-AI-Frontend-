import { configureStore } from '@reduxjs/toolkit';
import agentReducer from '../features/ai/agentSlice';

const store = configureStore({
  reducer: {
    agent: agentReducer,
  },
});

export default store;
