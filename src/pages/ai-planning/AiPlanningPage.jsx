import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useProjects } from '../../hooks/useProjects';
import { useAgents } from '../../hooks/useAgents';
import { useToast } from '../../context/ToastContext';
import './AiPlanningPage.css';

const AiPlanningPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const toast = useToast();
  const { projects, loadProjects } = useProjects();
  const { executeAgent, pollJobStatus } = useAgents();

  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState('idle'); // idle, running, complete, error
  const logsEndRef = useRef(null);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const addLog = (msg, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev, { msg, type, timestamp }]);
  };

  const handleStartPlanning = async () => {
    if (!selectedProjectId) {
      toast.error('Please select a project first');
      return;
    }

    const project = projects.find(p => p._id === selectedProjectId || p.id === selectedProjectId);
    setStatus('running');
    setLogs([]);
    addLog(`🚀 Initializing Strategic Planning for: ${project?.name}...`);
    addLog('[i] Loading neural weights and context parameters...');

    try {
      await new Promise(r => setTimeout(r, 1000));
      addLog('[⟳] Analyzing current task backlog and risk vectors...');
      
      const queuedData = await executeAgent('planner', selectedProjectId, {
        prompt: `Run a full planning sequence for ${project?.name}. Current description: ${project?.description}`
      });

      const jobId = queuedData?.data?.jobId || queuedData?.jobId;
      addLog(`[✔] AI Job Enqueued. Tracking ID: ${jobId.substring(0, 8)}...`);

      const result = await pollJobStatus('planner', jobId, 3000, 20, (statusData) => {
        if (statusData?.progress) {
          const step = statusData.progress;
          if (step < 30) addLog(`[⟳] Mapping Project Architecture: ${step}%...`);
          else if (step < 60) addLog(`[⟳] Provisioning AI Workers (Task & Risk Agents): ${step}%...`);
          else if (step < 90) addLog(`[⟳] Finalizing Strategic Roadmap: ${step}%...`);
          else addLog(`[⟳] Synchronizing with Kanban Database: ${step}%...`);
        }
      });

      // 📝 Summarize the results in the terminal
      addLog('--------------------------------------------------');
      addLog(`[✔] ARCHITECTURE COMPLETE.`, 'success');
      addLog(`[✔] Tasks: ${result?.result?.taskCount || 0} work items generated.`, 'success');
      addLog(`[✔] Risks: ${result?.result?.riskCount || 0} mitigations established.`, 'success');
      addLog(`[★] DEPLOYMENT SUCCESSFUL: Roadmap live on Kanban.`, 'success');
      
      setStatus('complete');
      toast.success('Strategic Plan Generated!');

    } catch (err) {
      addLog(`[✖] FATAL ERROR: ${err.message}`, 'error');
      setStatus('error');
      toast.error('Planning failed');
    }
  };

  return (
    <div className="planning-page">
      <div className="planning-header">
        <div className="planning-title-area">
          <h1>Neural Planning Dashboard</h1>
          <p>Orchestrate autonomous agent workflows and monitor real-time project architecting.</p>
        </div>
        
        <div className="planning-controls">
          <select 
            value={selectedProjectId} 
            onChange={(e) => setSelectedProjectId(e.target.value)}
            disabled={status === 'running'}
            className="project-select"
          >
            <option value="">Select Project to Architect...</option>
            {projects.map(p => (
              <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>
            ))}
          </select>
          
          <button 
            onClick={handleStartPlanning}
            disabled={status === 'running' || !selectedProjectId}
            className={`btn-execute ${status === 'running' ? 'loading' : ''}`}
          >
            {status === 'running' ? 'Architecting...' : 'Start Planning Sequence'}
          </button>
        </div>
      </div>

      <div className="terminal-wrapper">
        <div className="terminal-header">
          <div className="terminal-dots">
            <span></span><span></span><span></span>
          </div>
          <div className="terminal-tab">agent_output.log</div>
          <div className="terminal-meta">
            <span className={`status-pill ${status}`}>{status.toUpperCase()}</span>
          </div>
        </div>
        
        <div className="terminal-body">
          {logs.length === 0 ? (
            <div className="terminal-placeholder">
              <div className="placeholder-icon">🤖</div>
              <p>Select a project and click "Start Planning Sequence" to initiate the AI architecting process.</p>
            </div>
          ) : (
            <div className="log-container">
              {logs.map((log, i) => (
                <div key={i} className={`log-line ${log.type}`}>
                  <span className="log-time">[{log.timestamp}]</span>
                  <span className="log-msg">{log.msg}</span>
                </div>
              ))}
              {status === 'running' && <div className="terminal-cursor">_</div>}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>

        {status === 'complete' && (
          <div className="terminal-footer">
            <button className="btn-view-board" onClick={() => navigate(`/projects/${selectedProjectId}`)}>
              View Kanban Board &rarr;
            </button>
            <button className="btn-reset" onClick={() => { setLogs([]); setStatus('idle'); }}>
              Clear Terminal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiPlanningPage;
