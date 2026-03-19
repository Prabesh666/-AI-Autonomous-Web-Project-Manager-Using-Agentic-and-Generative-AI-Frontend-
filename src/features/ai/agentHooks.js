import { useDispatch, useSelector } from 'react-redux';
import { runPipeline } from './agentSlice';

/**
 * useAiAgent — custom Redux hook for the AI pipeline.
 *
 * Returns:
 *  - runPipeline(projectId): dispatches the AI pipeline thunk
 *  - isProcessing: boolean — true while the API call is in-flight
 *  - result: the successful pipeline response payload (or null)
 *  - error: error message string (or null)
 */
const useAiAgent = () => {
  const dispatch = useDispatch();
  const { isProcessing, result, error } = useSelector((state) => state.agent);

  const handleRunPipeline = (projectId) => {
    dispatch(runPipeline(projectId));
  };

  return {
    runPipeline: handleRunPipeline,
    isProcessing,
    result,
    error,
  };
};

export default useAiAgent;
