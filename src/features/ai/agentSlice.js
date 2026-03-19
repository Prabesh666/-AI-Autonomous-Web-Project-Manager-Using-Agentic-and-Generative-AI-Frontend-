import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk: calls the AI pipeline endpoint for a given project
export const runPipeline = createAsyncThunk(
  'agent/runPipeline',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/projects/${projectId}/run-pipeline/`
      );
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
