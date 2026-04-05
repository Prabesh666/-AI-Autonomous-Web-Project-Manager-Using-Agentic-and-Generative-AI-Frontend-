import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/index';

/**
 * Redux async thunk — runs any agent type via the centralized endpoint.
 * Payload: { projectId, type }
 */
export const runPipeline = createAsyncThunk(
  'agent/runPipeline',
  async ({ projectId, type = 'planner' }, { rejectWithValue }) => {
    try {
      const response = await api.post('/agents/run', { projectId, type });
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to run AI pipeline.'
      );
    }
  }
);

const agentSlice = createSlice({
  name: 'agent',
  initialState: {
    isProcessing: false,
    result: null,
    error: null,
  },
  reducers: {
    clearAgentState: (state) => {
      state.isProcessing = false;
      state.result = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(runPipeline.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(runPipeline.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.result = action.payload;
      })
      .addCase(runPipeline.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload;
      });
  },
});

export const { clearAgentState } = agentSlice.actions;
export default agentSlice.reducer;
