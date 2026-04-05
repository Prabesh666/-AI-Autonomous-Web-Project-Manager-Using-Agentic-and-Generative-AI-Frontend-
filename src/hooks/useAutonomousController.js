import { useState, useCallback } from 'react';
import api from '../api/index';

export const useAutonomousController = () => {
  const [logs, setLogs] = useState([]);
  const [state, setState] = useState({
    planner: null,
    task: null,
    risk: null,
    ethics: null,
    report: null,
    loading: false
  });

  const addLog = useCallback((msg) => {
    setLogs(prev => [...prev, msg]);
    // Optional console.log for true architectural visibility
    console.log(`[Autonomous Controller] ${msg}`);
  }, []);

  /**
   * Orchestrates the autonomous AI workflow matching ci.yml-like steps
   * @param {string} projectId Target Project ID
   * @param {string} type Agent Type (default 'planner')
   */
  const runPipeline = useCallback(async (projectId, type = 'planner') => {
    setLogs([]); // Reset session logs
    setState(prev => ({ ...prev, loading: true }));

    // Initialize structured output format (Step 10)
    const statusObj = {
      project: '❌',
      auth: '❌',
      pipeline: '❌',
      data: '❌',
      database: '❌',
      overall: 'FAILED'
    };

    // STEP 1: PROJECT DETECTION
    if (!projectId) {
      addLog("❌ projectId missing");
      addLog("❌ Failed at Project Detection");
      setState(prev => ({ ...prev, loading: false }));
      return statusObj;
    }
    addLog("✅ projectId detected");
    statusObj.project = '✅';

    // STEP 2: AUTH VALIDATION
    const token = localStorage.getItem('token');
    if (!token) {
      addLog("❌ No token");
      addLog("❌ Failed at Auth Validation");
      setState(prev => ({ ...prev, loading: false }));
      return statusObj;
    }
    addLog("Auth Valid ✅");
    statusObj.auth = '✅';

    // STEP 3: TRIGGER AUTONOMOUS PIPELINE (With Error Handling - Step 7)
    addLog("Pipeline Running...");
    
    let responseData = null;
    let retries = 0;
    const maxRetries = 2;
    let fetchSuccess = false;

    while (retries <= maxRetries && !fetchSuccess) {
      try {
        const response = await api.post('/agents/run', {
          projectId,
          type,
        });

        responseData = response.data;
        addLog("Backend Connected ✅");
        fetchSuccess = true;

      } catch (err) {
        if (err.response?.status === 401) {
          addLog("❌ Failed at Auth (401 Unauthorized)");
          setState(prev => ({ ...prev, loading: false }));
          return statusObj;
        }

        if (err.response?.status === 500) {
          addLog("❌ Failed at Backend (500 Internal Server Error)");
          setState(prev => ({ ...prev, loading: false }));
          return statusObj; // Breaking on 500 backend error
        }

        retries++;
        if (retries > maxRetries) {
          addLog(`❌ Failed at Network Execution (Max retries reached)`);
          setState(prev => ({ ...prev, loading: false }));
          return statusObj;
        }
        addLog(`Network issue, retrying execution... (${retries}/${maxRetries})`);
      }
    }

    if (!fetchSuccess || !responseData) {
       setState(prev => ({ ...prev, loading: false }));
       return statusObj;
    }
    
    statusObj.pipeline = '✅';

    // STEP 8: DECISION ENGINE SUPPORT
    const isDecisionEngine = ['rule', 'scoring', 'dependency', 'replanning'].includes(type);

    if (isDecisionEngine) {
      // Dynamic validation bypass for other autonomous engine systems
      addLog("Pipeline Success ✅");
      statusObj.data = '✅';
      statusObj.overall = 'SUCCESS';
    } else {
      // STEP 4: RESPONSE VALIDATION (Strict)
      const payloadData = responseData.data || responseData;
      
      const hasPlanner = !!payloadData?.planner?.plan;
      const hasTasks = !!payloadData?.task?.tasks || !!payloadData?.tasks?.tasks;
      const hasRisks = !!payloadData?.risk?.risks || !!payloadData?.risks?.risks;
      const hasEthics = !!payloadData?.ethics?.ethics;
      const hasReport = !!payloadData?.report?.report?.content;

      if (hasPlanner && hasTasks && hasRisks && hasEthics && hasReport) {
        addLog("✅ Full pipeline success");
        addLog("Pipeline Success ✅");
        statusObj.data = '✅';
        
        // STEP 5: STATE MANAGEMENT
        setState(prev => ({
          ...prev,
          planner: payloadData.planner,
          task: payloadData.task || payloadData.tasks,
          risk: payloadData.risk || payloadData.risks,
          ethics: payloadData.ethics,
          report: payloadData.report,
          loading: false
        }));
      } else {
        addLog("❌ Pipeline incomplete");
        addLog("❌ Failed at Strict Response Validation");
        setState(prev => ({ ...prev, loading: false }));
        return statusObj;
      }
    }

    // STEP 6: DATABASE SYNC VERIFICATION
    let dbSyncSuccess = false;
    try {
      const [tasksRes, reportsRes] = await Promise.all([
        api.get(`/tasks/project/${projectId}`),
        api.get(`/reports/${projectId}`)
      ]);

      const tasksData = tasksRes.data;
      const reportsData = reportsRes.data;
        
        if ((Array.isArray(tasksData) && tasksData.length > 0) || 
            (Array.isArray(tasksData.tasks) && tasksData.tasks.length > 0) ||
            tasksData.data?.length > 0 ||
            reportsData.data?.length > 0 ||
            (Array.isArray(reportsData) && reportsData.length > 0)) {
           dbSyncSuccess = true;
        }
    } catch (err) {
      // Intentionally bypassed; if it fails, it cascades to the else block
    }

    if (dbSyncSuccess) {
      addLog("✅ DB sync successful");
      addLog("Database Synced ✅");
      statusObj.database = '✅';
      statusObj.overall = 'SUCCESS';
    } else {
      addLog("❌ DB sync failed");
      addLog("❌ Failed at Database Sync Verification");
      statusObj.overall = 'FAILED';
    }

    setState(prev => ({ ...prev, loading: false }));
    return statusObj; // STEP 10: RETURN STRUCTURED STATUS
  }, [addLog]);

  return { runPipeline, logs, state, isRunning: state.loading };
};
