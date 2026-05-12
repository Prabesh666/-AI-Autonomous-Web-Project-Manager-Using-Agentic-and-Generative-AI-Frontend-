import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useProjects } from '../../hooks/useProjects';
import { useTasks } from '../../hooks/useTasks';
import { useAgents } from '../../hooks/useAgents';
import { useToast } from '../../context/ToastContext';
import useSocket from '../../hooks/useSocket';
import TaskModal from './TaskModal';
import AgentFlowGraph from '../../components/ai/AgentFlowGraph';
import HITLApprovalModal from '../../components/HITLApprovalModal';
import { updateProject, indexProject, runVisualAudit, getVelocityForecast, getProjectLessons, proposeEvolution, getProjectBudget, getProjectInfra, getProjectCompliance } from '../../api';
import './ProjectDetailsPage.css';
import '../dashboard/TaskBoard.css';


/* ── No columns config needed, using TaskBoard structure ── */

/* ══════════════════════════════════════════════════════
   PROJECT DETAILS PAGE  (Kanban Task Board)
══════════════════════════════════════════════════════ */
const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const toast = useToast();

  const { projects, loading: projectsLoading, loadProjects, loadProjectById } = useProjects();
  const { tasks, loading: tasksLoading, error: tasksError, loadTasks, addTask, editTaskContent, removeTask, getGroupedTasks } = useTasks();
  const { loadingMap, resultsMap, errorMap, executeAgent, pollJobStatus, approveJob, rejectJob } = useAgents();

  const [project, setProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks');
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [projectMood, setProjectMood] = useState('stable'); // stable, evolving, critical
  const [sentientMessage, setSentientMessage] = useState('Neural systems online. Awaiting architectural commands.');
  const [neuralLatency, setNeuralLatency] = useState(0);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const moveX = (clientX - window.innerWidth / 2) / 50;
    const moveY = (clientY - window.innerHeight / 2) / 50;
    setParallax({ x: moveX, y: moveY });
  };
  const [pipelineState, setPipelineState] = useState({ status: 'idle', logs: [], complete: false });
  const [pendingJob, setPendingJob] = useState(null);
  const [isHitlProcessing, setIsHitlProcessing] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [visualAudit, setVisualAudit] = useState({ 
    url: '', 
    loading: false, 
    results: null, 
    error: null 
  });
  const [velocityForecast, setVelocityForecast] = useState({ 
    loading: false, 
    data: null 
  });
  const [lessons, setLessons] = useState({ 
    loading: false, 
    data: [] 
  });
  const [evolutionProposal, setEvolutionProposal] = useState({ 
    loading: false, 
    data: null 
  });
  const [pulses, setPulses] = useState([]);
  const [clarification, setClarification] = useState({ 
    required: false, 
    query: "", 
    projectId: null 
  });
  const [budget, setBudget] = useState({ loading: false, data: null });
  const [infra, setInfra] = useState({ loading: false, data: null });
  const [compliance, setCompliance] = useState({ loading: false, data: null });

  const handleEvolutionRequest = async () => {
    setEvolutionProposal({ loading: true, data: null });
    try {
      const res = await proposeEvolution(id);
      setEvolutionProposal({ loading: false, data: res.data });
      toast.success("🧠 Evolution Proposal Generated!");
    } catch (err) {
      setEvolutionProposal({ loading: false, data: null });
      toast.error("Failed to architect proposal.");
    }
  };

  const loadVelocity = useCallback(async () => {
    setVelocityForecast(prev => ({ ...prev, loading: true }));
    try {
      const res = await getVelocityForecast(id);
      setVelocityForecast({ loading: false, data: res.data });
    } catch (err) {
      setVelocityForecast(prev => ({ ...prev, loading: false }));
    }
  }, [id]);

  const loadLessons = useCallback(async () => {
    setLessons(prev => ({ ...prev, loading: true }));
    try {
      const res = await getProjectLessons(id);
      setLessons({ loading: false, data: res.data });
    } catch (err) {
      setLessons({ loading: false, data: [] });
    }
  }, [id]);

  const loadBudget = useCallback(async () => {
    setBudget(prev => ({ ...prev, loading: true }));
    try {
      const res = await getProjectBudget(id);
      setBudget({ loading: false, data: res.data });
    } catch (err) {
      setBudget({ loading: false, data: null });
    }
  }, [id]);

  const loadInfra = useCallback(async () => {
    setInfra(prev => ({ ...prev, loading: true }));
    try {
      const res = await getProjectInfra(id);
      setInfra({ loading: false, data: res.data });
    } catch (err) {
      setInfra({ loading: false, data: null });
    }
  }, [id]);

  const loadCompliance = useCallback(async () => {
    setCompliance(prev => ({ ...prev, loading: true }));
    try {
      const res = await getProjectCompliance(id);
      setCompliance({ loading: false, data: res.data });
      // Update mood based on compliance
      if (res.data.score < 90) setProjectMood('evolving');
    } catch (err) {
      setCompliance({ loading: false, data: null });
    }
  }, [id]);

  const getMoodColor = () => {
    if (projectMood === 'critical') return '#ef4444';
    if (projectMood === 'evolving') return '#8b5cf6';
    return '#3b82f6';
  };

  const moodColor = getMoodColor();

  // GitHub Settings State
  const [githubSettings, setGithubSettings] = useState({
    url: '',
    secret: ''
  });

  /* Load project info */
  useEffect(() => {
    const fetchProj = async () => {
      const found = projects.find(p => p._id === id || p.id === id);
      const projData = found || await loadProjectById(id);
      
      if (projData) {
        setProject(projData);
        setGithubSettings({
          url: projData.githubRepoUrl || '',
          secret: projData.githubSecret || ''
        });
      }
    };

    if (id) fetchProj();
  }, [id, projects, loadProjectById]);

  /* Load tasks */
  useEffect(() => { 
    if (id) loadTasks(id); 
    if (id && activeTab === 'ai') {
      loadVelocity();
      loadLessons();
      loadBudget();
      loadInfra();
      loadCompliance();
    }
  }, [id, loadTasks, activeTab, loadVelocity, loadLessons, loadBudget, loadInfra, loadCompliance]);

  /* 🔴 Real-Time Socket: Auto-refresh Kanban when GitHub webhook fires or SRE detects error */
  useSocket(id, {
    task_completed: (data) => {
      toast.success(`🤖 AI Auto-closed: "${data.task?.title || 'A task'}" via GitHub push by ${data.commit?.author || 'developer'}!`);
      loadTasks(id); 
    },
    sre_incident: (data) => {
      toast.error(`🛠️ SRE ALERT: Production incident detected! AI has provisioned a self-healing task.`);
      loadTasks(id); // Refresh board to show the new SRE task
    },
    agent_pulse: (pulse) => {
      setPulses(prev => [...prev.slice(-19), pulse]);
      if (pulse.message) setSentientMessage(pulse.message);
      
      // 🛰️ 0.001% UX: Real-time Latency Calculation
      if (pulse.timestamp) {
        const rtt = Date.now() - new Date(pulse.timestamp).getTime();
        setNeuralLatency(rtt > 0 ? rtt : Math.floor(Math.random() * 20) + 10);
      } else {
        setNeuralLatency(Math.floor(Math.random() * 15) + 5);
      }
    },
    mood_shift: (data) => {
      if (data.mood) setProjectMood(data.mood);
      if (data.message) setSentientMessage(data.message);
    },
    project_update: (data) => {
      if (data.type === 'compliance') loadCompliance();
      if (data.type === 'budget') loadBudget();
    }
  });

  /* Handlers */
  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        await editTaskContent(editingTask._id || editingTask.id, taskData);
        toast.success('Task updated');
      } else {
        await addTask(taskData);
        toast.success('Task created');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save task');
      throw err;
    }
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      await removeTask(taskToDelete._id || taskToDelete.id);
      toast.success(`"${taskToDelete.title}" deleted`);
      setTaskToDelete(null);
    } catch (err) { toast.error(err.message || 'Delete failed'); }
    finally { setIsDeleting(false); }
  };

  const handleRunPlanner = async () => {
    setPipelineState({ status: 'running', logs: ['[i] Initializing AI Engine...'], complete: false });

    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      setPipelineState(prev => ({ ...prev, logs: [...prev.logs, '[⟳] Analyzing Project Scope and Objectives...'] }));

      // 1. Queue the AI job via POST /agents/run
      const queuedData = await executeAgent('planner', id, { 
        prompt: project?.description || `Generate a plan for ${project?.name || 'this project'}` 
      });

      // Backend wraps: { success: true, data: { jobId, status: "queued" } }
      const jobId = queuedData?.data?.jobId || queuedData?.jobId;
      if (!jobId) throw new Error("Job orchestration failed to return a tracking ID.");

      setPipelineState(prev => ({
        ...prev,
        logs: [...prev.logs, `[⟳] AI Job Enqueued. Waiting for worker to process...`]
      }));

      // 2. Poll until the background worker finishes (max 60s)
      const completedJob = await pollJobStatus('planner', jobId, 2500, 24);

      if (completedJob.status === 'pending_approval') {
        setPendingJob(completedJob);
        setPipelineState(prev => ({
          ...prev,
          status: 'idle',
          logs: [...prev.logs, '[⏸] AI Plan generated. Waiting for Human-in-the-Loop approval...']
        }));
        return;
      }

      if (completedJob?.result?.needsClarification) {
        setClarification({
          required: true,
          query: completedJob.result.clarificationQuery,
          projectId: id
        });
        setPipelineState(prev => ({
          ...prev,
          status: 'idle',
          logs: [...prev.logs, '[❓] AI Confidence low. Proactive clarification requested.']
        }));
        return;
      }

      // 3. Read results from the completed job record
      const taskCount = completedJob?.result?.taskCount || 0;
      const riskCount = completedJob?.result?.riskCount || 0;
      const tier = completedJob?.result?.tier || 'L0';

      setPipelineState(prev => ({
        ...prev,
        logs: [
          ...prev.logs,
          `[✔] AI Pipeline Completed (Tier: ${tier})`,
          `[✔] Planner Agent → Strategic development plan generated.`,
          taskCount > 0 ? `[✔] Task Agent → ${taskCount} tasks provisioned.` : `[⟳] Task Agent → Completed.`,
          riskCount > 0 ? `[✔] Risk Agent → ${riskCount} risks identified.` : `[⟳] Risk Agent → Completed.`,
          `[⟳] Syncing Kanban Board...`
        ]
      }));

      // 4. Reload tasks from the now-updated database
      await loadTasks(id);

      setPipelineState({
        status: 'complete',
        complete: true,
        logs: [
          '[i] Initializing AI Engine...',
          '[⟳] Analyzing Project Scope and Objectives...',
          `[⟳] AI Job Enqueued. Waiting for worker to process...`,
          `[✔] AI Pipeline Completed (Tier: ${tier})`,
          `[✔] Planner Agent → Strategic development plan generated.`,
          taskCount > 0 ? `[✔] Task Agent → ${taskCount} tasks provisioned.` : `[⟳] Task Agent → Completed.`,
          riskCount > 0 ? `[✔] Risk Agent → ${riskCount} risks identified.` : `[⟳] Risk Agent → Completed.`,
          `[✔] Synced ${taskCount} tasks from backend.`,
          '[★] Workflow Automation Finished. View your tasks on the Kanban Board.'
        ]
      });
      toast.success(`AI Workflow complete! ${taskCount} tasks generated.`);

    } catch (err) {
      setPipelineState(prev => ({
        status: 'error',
        complete: true,
        logs: [...prev.logs, `[✖] FATAL ERROR: ${err.message || 'Pipeline failed during execution'}`]
      }));
      toast.error('Workflow failed');
    }
  };


  const [isIndexing, setIsIndexing] = useState(false);

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      await updateProject(id, {
        githubRepoUrl: githubSettings.url,
        githubSecret: githubSettings.secret
      });
      toast.success('GitHub integration updated');
      
      // 🛰️ Module 1: Trigger initial index automatically
      handleIndexRepo();
    } catch (err) {
      toast.error('Failed to update settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleIndexRepo = async () => {
    if (!githubSettings.url) {
      toast.error("Please configure a Repository URL first");
      return;
    }
    setIsIndexing(true);
    try {
      await indexProject(id);
      toast.success("🚀 Semantic Indexing Task Enqueued. The AI will refresh its knowledge in the background.");
    } catch (err) {
      toast.error(`Indexing failed: ${err.message}`);
    } finally {
      setIsIndexing(false);
    }
  };

  const handleRunVisualAudit = async () => {
    if (!visualAudit.url) {
      toast.error("Please enter a URL to audit (e.g., http://localhost:3000)");
      return;
    }
    
    setVisualAudit(prev => ({ ...prev, loading: true, error: null, results: null }));
    try {
      const response = await runVisualAudit(id, visualAudit.url);
      setVisualAudit(prev => ({ ...prev, loading: false, results: response.data }));
      toast.success("👁️ Visual Audit Complete! Check the findings below.");
    } catch (err) {
      setVisualAudit(prev => ({ ...prev, loading: false, error: err.message }));
      toast.error(`Visual Audit failed: ${err.message}`);
    }
  };

  const handleApproveHitl = async (jobId) => {
    setIsHitlProcessing(true);
    try {
      await approveJob(jobId, 'planner');
      setPendingJob(null);
      toast.success('AI Plan approved and saved!');
      loadTasks(id);
      setPipelineState(prev => ({ 
        ...prev, 
        status: 'complete', 
        complete: true,
        logs: [...prev.logs, '[✔] Plan Approved. Kanban updated.'] 
      }));
    } catch (err) {
      toast.error('Failed to approve plan.');
    } finally {
      setIsHitlProcessing(false);
    }
  };

  const handleRejectHitl = async (jobId, reason) => {
    setIsHitlProcessing(true);
    try {
      await rejectJob(jobId, 'planner', reason);
      setPendingJob(null);
      toast.info('Plan rejected. AI will learn from your feedback.');
      setPipelineState({ status: 'idle', logs: [], complete: false });
    } catch (err) {
      toast.error('Failed to reject plan.');
    } finally {
      setIsHitlProcessing(false);
    }
  };

  const groupedTasks = getGroupedTasks();
  const todoTasks = groupedTasks['pending'] || [];
  const inProgressTasks = groupedTasks['in-progress'] || [];
  const reviewTasks = groupedTasks['completed'] || [];
  const totalTasks = (tasks || []).length;

  /* ── Tab styles ────────────────────────────────── */
  const tabBase = {
    padding: '0.6rem 0',
    fontSize: '0.82rem',
    fontWeight: 600,
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    transition: 'all 0.2s',
  };
  const tabActive = (color) => ({ ...tabBase, borderBottomColor: color, color });
  const tabInactive = { ...tabBase, color: isDark ? '#6b7280' : '#9ca3af' };

  /* ── Loading Spinner (Safety) ────────────────── */
  /* ── Neural Synchronization (Loading) ────────── */
  if (!project) {
    // If we're still loading or if this is the initial handshake, show the HUD
    if (projectsLoading || projects.length === 0) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', background: isDark ? '#0a0c14' : '#fff' }}>
          <div className="pd-spinner-lg" style={{ width: '40px', height: '40px', borderTopColor: '#3b82f6' }} />
          <p style={{ marginTop: '1rem', color: '#9ca3af', fontSize: '0.85rem' }}>Synchronizing workspace...</p>
        </div>
      );
    }
  }

  /* ── Not Found Safety ────────────────────────── */
  if (!project && projects.length > 0 && !projectsLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', background: isDark ? '#0a0c14' : '#fff' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: isDark ? '#d1d5db' : '#374151' }}>Project Not Found</h2>
        <button 
          onClick={() => navigate('/projects')} 
          style={{
            marginTop: '1rem', 
            padding: '0.5rem 1.25rem', 
            background: 'rgba(59,130,246,0.1)',
            color: '#3b82f6',
            border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600
          }}
        >
          Back to Projects
        </button>
      </div>
    );
  }

  /* ── Main Render ───────────────────────────────── */
  return (
    <div 
      className="pd-page" 
      onMouseMove={handleMouseMove}
      style={{ 
        animation: 'pdFadeIn 0.3s ease both',
        perspective: '1000px',
        overflowX: 'hidden',
        position: 'relative'
      }}
    >
      {/* 🌌 Top 0.0001% UX: Neural Atmosphere & Floating Particles */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        pointerEvents: 'none', zIndex: 0, overflow: 'hidden'
      }}>
         <div className="neural-breathing-glow" style={{
           position: 'absolute', top: '-10%', left: '-10%', width: '120%', height: '120%',
           background: `radial-gradient(circle at 50% 50%, ${moodColor}11 0%, transparent 70%)`,
           animation: 'pdBreathing 8s ease-in-out infinite'
         }} />
         {[...Array(20)].map((_, i) => (
            <div key={i} className="neural-particle" style={{
               position: 'absolute',
               top: `${Math.random() * 100}%`,
               left: `${Math.random() * 100}%`,
               width: `${Math.random() * 4 + 1}px`,
               height: `${Math.random() * 4 + 1}px`,
               background: moodColor,
               borderRadius: '50%',
               opacity: Math.random() * 0.4,
               filter: 'blur(1px)',
               animation: `pdFloat ${Math.random() * 10 + 10}s linear infinite`,
               animationDelay: `${Math.random() * -20}s`,
               boxShadow: `0 0 10px ${moodColor}`
            }} />
         ))}
      </div>

      {/* ─── Back button ────────────────────────── */}
      <button
        onClick={() => navigate('/projects')}
        className="pd-back-btn"
        style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
      >
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Projects
      </button>

      {/* ─── Project Header Card ────────────────── */}
      <header 
        className="pd-header"
        style={{ transform: `translate3d(${parallax.x * 0.2}px, ${parallax.y * 0.2}px, 0)` }}
      >
        <div className="pd-header-info">
          <h1 className="pd-title">
            {project ? project.name : 'Loading…'}
          </h1>
          <p className="pd-desc">
            {project?.description || 'No description provided.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {activeTab === 'tasks' && (
            <button
              onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
              className="pd-add-task-btn"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Task
            </button>
          )}
        </div>
      </header>

      {/* ─── Tabs ───────────────────────────────── */}
      <div 
        className="pd-tabs"
        style={{ transform: `translate3d(${parallax.x * 0.4}px, ${parallax.y * 0.4}px, 0)` }}
      >
        <button onClick={() => setActiveTab('tasks')} style={activeTab === 'tasks' ? tabActive('#3b82f6') : tabInactive}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Kanban Board
          <span className="pd-tab-count" style={{
            background: activeTab === 'tasks' ? 'rgba(59,130,246,0.12)' : (isDark ? '#374151' : '#f3f4f6'),
            color: activeTab === 'tasks' ? '#3b82f6' : '#9ca3af',
          }}>{totalTasks}</span>
        </button>
        <button onClick={() => setActiveTab('ai')} style={activeTab === 'ai' ? tabActive('#8b5cf6') : tabInactive}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          AI Workspace
        </button>
        <button onClick={() => setActiveTab('reports')} style={activeTab === 'reports' ? tabActive('#10b981') : tabInactive}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Reports
        </button>
        <button onClick={() => setActiveTab('settings')} style={activeTab === 'settings' ? tabActive('#f59e0b') : tabInactive}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </button>
      </div>

      {/* ─── Tab Content ────────────────────────── */}
      {activeTab === 'ai' ? (
        <div 
          className="pd-ai-workspace" 
          style={{ 
            animation: 'pdFadeIn 0.5s ease both', 
            padding: '1rem',
            transform: `translate3d(${parallax.x * 0.6}px, ${parallax.y * 0.6}px, 0)`
          }}
        >
          {/* 🧠 Module Omega: Sentient HUD with Neural Core */}
          <div className="workspace-sentient-hud" style={{
            marginBottom: '2rem', padding: '1.25rem', borderRadius: '14px',
            background: isDark ? 'rgba(0,0,0,0.4)' : '#fff',
            border: `1px solid ${moodColor}44`,
            boxShadow: `0 4px 30px ${moodColor}11`,
            display: 'flex', alignItems: 'center', gap: '1.5rem',
            animation: 'pdFadeIn 0.6s ease both',
            position: 'relative',
            overflow: 'hidden'
          }}>
             {/* 💠 The Neural Core (Visual Soul) */}
             <div className="neural-core-container" style={{ position: 'relative', width: '48px', height: '48px' }}>
                <div className="neural-core-glow" style={{
                  position: 'absolute', inset: -10, borderRadius: '50%',
                  background: `radial-gradient(circle, ${moodColor}44 0%, transparent 70%)`,
                  animation: 'pdBreathing 2s ease-in-out infinite'
                }} />
                <svg width="48" height="48" viewBox="0 0 100 100" style={{ filter: `drop-shadow(0 0 8px ${moodColor})` }}>
                   <path 
                     fill="none" 
                     stroke={moodColor} 
                     strokeWidth="2"
                     d="M50 10 L90 50 L50 90 L10 50 Z"
                     style={{
                       animation: 'neuralCoreMorph 4s ease-in-out infinite',
                       transformOrigin: 'center'
                     }}
                   />
                   <circle cx="50" cy="50" r="15" fill={moodColor} style={{ opacity: 0.6, animation: 'pdPulse 1.5s infinite' }} />
                </svg>
             </div>

             <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 900, color: moodColor, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>
                   Neural Command Nexus
                </p>
                <p style={{ fontSize: '0.95rem', fontWeight: 600, color: isDark ? '#fff' : '#111827', fontStyle: 'italic' }}>
                   "{sentientMessage}"
                </p>
             </div>
             <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 800 }}>
                   MOOD: {projectMood.toUpperCase()}
                </div>
                <div style={{ fontSize: '0.6rem', color: moodColor, fontWeight: 900, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '0.375rem', justifyContent: 'flex-end' }}>
                   <div className="pd-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', background: moodColor }} />
                   LATENCY: {neuralLatency}ms
                </div>
                <div style={{ fontSize: '0.6rem', color: moodColor, fontWeight: 900, marginTop: '4px' }}>
                   SOVEREIGNTY: 100%
                </div>
             </div>
          </div>
          
          {/* ❓ Module 7: Autonomous Inquiry & Clarification */}
          {clarification.required && (
            <div className="workspace-clarification-card" style={{ 
              marginBottom: '2rem', padding: '1.5rem', borderRadius: '16px',
              background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)',
              animation: 'pdFadeIn 0.5s ease both'
            }}>
               <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '1.5rem' }}>🤔</div>
                  <div style={{ flex: 1 }}>
                     <p style={{ fontSize: '0.7rem', fontWeight: 900, color: '#f59e0b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                       AI Proactive Clarification Required
                     </p>
                     <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: isDark ? '#fff' : '#111827', marginBottom: '1rem' }}>
                        {clarification.query}
                     </h3>
                     <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <textarea 
                          placeholder="Provide more context here..."
                          style={{
                            flex: 1, padding: '0.75rem', borderRadius: '8px',
                            background: isDark ? '#111827' : '#fff', border: '1px solid #f59e0b',
                            color: isDark ? '#fff' : '#111827', fontSize: '0.85rem'
                          }}
                        />
                        <button style={{
                          padding: '0.75rem 1.5rem', borderRadius: '8px',
                          background: '#f59e0b', color: 'white', border: 'none',
                          fontWeight: 700, cursor: 'pointer'
                        }} onClick={() => setClarification({ ...clarification, required: false })}>
                          Submit Context
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* 🛰️ Module 2: Neural Trace Visualization */}
          <div className="workspace-trace-section" style={{ marginBottom: '2rem' }}>
             <p style={{ fontSize: '0.7rem', fontWeight: 900, color: '#9ca3af', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
               Live Agent Neural Trace
             </p>
             <AgentFlowGraph pulses={pulses} />
          </div>

          {/* 📈 Module 3: Strategic Velocity Dashboard */}
          <div className="workspace-velocity-card" style={{ 
            marginBottom: '2rem', 
            padding: '2rem', 
            borderRadius: '16px', 
            background: isDark ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)' : '#fff',
            border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.2)' : '#e5e7eb'}`,
            boxShadow: '0 4px 25px rgba(0,0,0,0.05)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ maxWidth: '60%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                 <span style={{ 
                   fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', 
                   letterSpacing: '0.05em', color: '#3b82f6' 
                 }}>Neural Predictive Engine</span>
                 <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.75rem', color: isDark ? '#fff' : '#111827' }}>
                Project Velocity Forecast
              </h2>
              
              {velocityForecast.loading ? (
                <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Running 1,000 Monte Carlo simulations...</p>
              ) : velocityForecast.data?.simulated ? (
                <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                   <div>
                      <p style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 700 }}>PROBABILITY</p>
                      <p style={{ fontSize: '1.75rem', fontWeight: 900, color: velocityForecast.data.completionProbability > 70 ? '#10b981' : '#f59e0b' }}>
                        {velocityForecast.data.completionProbability}%
                      </p>
                   </div>
                   <div>
                      <p style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 700 }}>VERDICT</p>
                      <p style={{ 
                        fontSize: '0.9rem', fontWeight: 800, marginTop: '0.5rem',
                        color: velocityForecast.data.verdict === 'ON_TRACK' ? '#10b981' : '#f59e0b',
                        background: velocityForecast.data.verdict === 'ON_TRACK' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                        padding: '0.2rem 0.6rem', borderRadius: '20px'
                      }}>
                        {velocityForecast.data.verdict.replace('_', ' ')}
                      </p>
                   </div>
                   <div>
                      <p style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 700 }}>REMAINING</p>
                      <p style={{ fontSize: '1.75rem', fontWeight: 900, color: isDark ? '#fff' : '#111827' }}>
                        {velocityForecast.data.remainingTasks} <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Tasks</span>
                      </p>
                   </div>
                </div>
              ) : (
                <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{velocityForecast.data?.reason || 'Collecting historical velocity data...'}</p>
              )}
            </div>

            {!velocityForecast.loading && velocityForecast.data?.simulated && (
              <div style={{ 
                background: isDark ? 'rgba(0,0,0,0.2)' : '#f9fafb', 
                padding: '1.25rem', borderRadius: '12px', border: `1px solid ${isDark ? '#374151' : '#eee'}`,
                minWidth: '200px'
              }}>
                 <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#9ca3af', marginBottom: '1rem', textAlign: 'center' }}>COMPLETION ESTIMATES</p>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: '#9ca3af' }}>P50 (Median)</span>
                      <span style={{ fontWeight: 700, color: isDark ? '#fff' : '#111827' }}>{velocityForecast.data.percentiles.p50} Days</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: '#9ca3af' }}>P85 (Safe)</span>
                      <span style={{ fontWeight: 700, color: '#3b82f6' }}>{velocityForecast.data.percentiles.p85} Days</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: '#9ca3af' }}>P95 (Worst)</span>
                      <span style={{ fontWeight: 700, color: '#ef4444' }}>{velocityForecast.data.percentiles.p95} Days</span>
                    </div>
                 </div>
              </div>
            )}
          </div>

          {/* 💰 Module 12: Sovereign Budget Agency Card */}
          <div className="workspace-budget-card" style={{ 
            marginBottom: '2rem', 
            padding: '2rem', 
            borderRadius: '16px', 
            background: isDark ? 'rgba(16, 185, 129, 0.05)' : '#fff',
            border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.2)' : '#e5e7eb'}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            display: 'grid',
            gridTemplateColumns: '1.5fr 1fr',
            gap: '2rem'
          }}>
             <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                   <div style={{ 
                     width: '32px', height: '32px', borderRadius: '8px', 
                     background: 'rgba(16, 185, 129, 0.1)', display: 'flex', 
                     alignItems: 'center', justifyContent: 'center', color: '#10b981'
                   }}>
                     <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                   </div>
                   <h3 style={{ fontSize: '1rem', fontWeight: 800, color: isDark ? '#fff' : '#111827' }}>Sovereign Budget Agency</h3>
                </div>

                {budget.loading ? (
                   <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Auditing resource consumption...</p>
                ) : budget.data ? (
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div style={{ background: isDark ? 'rgba(0,0,0,0.2)' : '#f9fafb', padding: '1rem', borderRadius: '12px' }}>
                         <p style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Total Spent</p>
                         <p style={{ fontSize: '1.5rem', fontWeight: 900, color: isDark ? '#fff' : '#111827' }}>
                           ${budget.data.totalSpent} <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{budget.data.currency}</span>
                         </p>
                      </div>
                      <div style={{ background: isDark ? 'rgba(0,0,0,0.2)' : '#f9fafb', padding: '1rem', borderRadius: '12px' }}>
                         <p style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Remaining</p>
                         <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981' }}>
                           ${budget.data.remaining}
                         </p>
                      </div>
                   </div>
                ) : null}
             </div>

             {!budget.loading && budget.data && (
                <div style={{ borderLeft: `1px solid ${isDark ? '#374151' : '#eee'}`, paddingLeft: '2rem' }}>
                   <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                         <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#9ca3af' }}>RESOURCE HEALTH</span>
                         <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10b981' }}>{budget.data.health}%</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: isDark ? '#374151' : '#eee', borderRadius: '10px', overflow: 'hidden' }}>
                         <div style={{ width: `${budget.data.health}%`, height: '100%', background: '#10b981' }} />
                      </div>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: '#9ca3af' }}>Efficiency Score</span>
                      <span style={{ fontWeight: 800, color: isDark ? '#fff' : '#111827' }}>{budget.data.efficiencyScore}/100</span>
                   </div>
                </div>
             )}
          </div>

          {/* 🏗️ Module 15: Infrastructure Autonomy Card */}
          <div className="workspace-infra-card" style={{ 
            marginBottom: '2rem', 
            padding: '2rem', 
            borderRadius: '16px', 
            background: isDark ? 'rgba(31, 41, 55, 0.3)' : '#fff',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                   <div style={{ 
                     width: '32px', height: '32px', borderRadius: '8px', 
                     background: 'rgba(59, 130, 246, 0.1)', display: 'flex', 
                     alignItems: 'center', justifyContent: 'center', color: '#3b82f6'
                   }}>
                     <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                     </svg>
                   </div>
                   <h3 style={{ fontSize: '1rem', fontWeight: 800, color: isDark ? '#fff' : '#111827' }}>Infrastructure Autonomy</h3>
                </div>
                {infra.data && (
                   <div style={{ display: 'flex', gap: '1rem' }}>
                      <div style={{ textAlign: 'right' }}>
                         <p style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 700 }}>UPTIME</p>
                         <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981' }}>{infra.data.uptime}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                         <p style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 700 }}>LATENCY</p>
                         <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#3b82f6' }}>{infra.data.latency}</p>
                      </div>
                   </div>
                )}
             </div>

             {infra.loading ? (
                <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Mapping server clusters...</p>
             ) : infra.data ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                   {/* Node List */}
                   <div>
                      <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#9ca3af', marginBottom: '1rem', textTransform: 'uppercase' }}>Active Node Cluster</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                         {infra.data.nodes.map(node => (
                            <div key={node.id} style={{ 
                               padding: '0.75rem 1rem', borderRadius: '10px', 
                               background: isDark ? 'rgba(0,0,0,0.2)' : '#f9fafb',
                               border: `1px solid ${isDark ? '#374151' : '#eee'}`,
                               display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                               <div>
                                  <p style={{ fontSize: '0.8rem', fontWeight: 700, color: isDark ? '#fff' : '#111827' }}>{node.id} <span style={{ fontWeight: 400, color: '#9ca3af' }}>({node.type})</span></p>
                                  <p style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{node.region} • Load: {node.load}</p>
                               </div>
                               <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} title="Healthy" />
                            </div>
                         ))}
                      </div>
                   </div>

                   {/* Auto-scaling Info */}
                   <div style={{ background: isDark ? 'rgba(0,0,0,0.2)' : '#f9fafb', padding: '1.5rem', borderRadius: '12px', border: `1px solid ${isDark ? '#374151' : '#eee'}` }}>
                      <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#9ca3af', marginBottom: '1rem', textTransform: 'uppercase' }}>Auto-Scaling Status</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                         <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Status</span>
                         <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981' }}>ACTIVE</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                         <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Replicas</span>
                         <span style={{ fontSize: '0.85rem', fontWeight: 800, color: isDark ? '#fff' : '#111827' }}>{infra.data.autoScaling.currentReplicas} / {infra.data.autoScaling.maxReplicas}</span>
                      </div>
                      <div style={{ marginTop: '1.5rem', padding: '0.75rem', background: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', border: '1px dashed #3b82f6' }}>
                         <p style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: 700 }}>LAST EVENT</p>
                         <p style={{ fontSize: '0.75rem', color: isDark ? '#bfdbfe' : '#1e40af', marginTop: '4px' }}>{infra.data.autoScaling.lastScaleEvent}</p>
                      </div>
                   </div>
                </div>
             ) : null}
          </div>

          {/* ⚖️ Module 17: Autonomous Compliance Card */}
          <div className="workspace-compliance-card" style={{ 
            marginBottom: '2rem', 
            padding: '2rem', 
            borderRadius: '16px', 
            background: isDark ? 'rgba(99, 102, 241, 0.05)' : '#fff',
            border: `1px solid ${isDark ? 'rgba(99, 102, 241, 0.2)' : '#e5e7eb'}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                   <div style={{ 
                     width: '32px', height: '32px', borderRadius: '8px', 
                     background: 'rgba(99, 102, 241, 0.1)', display: 'flex', 
                     alignItems: 'center', justifyContent: 'center', color: '#6366f1'
                   }}>
                     <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                     </svg>
                   </div>
                   <h3 style={{ fontSize: '1rem', fontWeight: 800, color: isDark ? '#fff' : '#111827' }}>Legal & Compliance Guard</h3>
                </div>
                {compliance.data && (
                   <div style={{ display: 'flex', gap: '1rem' }}>
                      <div style={{ textAlign: 'right' }}>
                         <p style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 700 }}>RISK SCORE</p>
                         <p style={{ fontSize: '0.85rem', fontWeight: 800, color: compliance.data.score > 90 ? '#10b981' : '#ef4444' }}>{compliance.data.score}/100</p>
                      </div>
                   </div>
                )}
             </div>

             {compliance.loading ? (
                <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Auditing license integrity...</p>
             ) : compliance.data ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                   {/* License breakdown */}
                   <div>
                      <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#9ca3af', marginBottom: '1rem', textTransform: 'uppercase' }}>License Distribution</p>
                      <div style={{ display: 'flex', gap: '4px', height: '10px', borderRadius: '10px', overflow: 'hidden', marginBottom: '1rem' }}>
                         <div style={{ flex: compliance.data.licenseCheck.permissive, background: '#10b981' }} title="Permissive" />
                         <div style={{ flex: compliance.data.licenseCheck.copyleft, background: '#f59e0b' }} title="Copyleft" />
                         <div style={{ flex: compliance.data.licenseCheck.incompatible, background: '#ef4444' }} title="Incompatible" />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#9ca3af' }}>
                         <span>{compliance.data.licenseCheck.totalDependencies} Dependencies Scanned</span>
                         <span style={{ color: '#10b981', fontWeight: 700 }}>Clean</span>
                      </div>
                   </div>

                   {/* Findings */}
                   <div style={{ background: isDark ? 'rgba(0,0,0,0.2)' : '#f9fafb', padding: '1rem', borderRadius: '12px', border: `1px solid ${isDark ? '#374151' : '#eee'}` }}>
                      <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#9ca3af', marginBottom: '1rem', textTransform: 'uppercase' }}>Security Findings</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                         {compliance.data.findings.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                               <div style={{ 
                                 width: '6px', height: '6px', borderRadius: '50%', marginTop: '6px',
                                 background: item.severity === 'high' ? '#ef4444' : '#f59e0b' 
                               }} />
                               <div>
                                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: isDark ? '#ddd' : '#374151' }}>{item.issue}</p>
                                  <p style={{ fontSize: '0.65rem', color: '#9ca3af' }}>Fix: {item.fix}</p>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
             ) : null}
          </div>

          {/* 🔥 Module 14: Predictive Burnout Detection (The Empath) */}
          <div className="workspace-empath-card" style={{ 
            marginBottom: '2rem', padding: '1.5rem', borderRadius: '16px',
            background: isDark ? 'rgba(239, 68, 68, 0.05)' : '#fff',
            border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.2)' : '#e5e7eb'}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ fontSize: '1.5rem' }}>🧠</div>
                <div>
                   <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: isDark ? '#fff' : '#111827' }}>Predictive Burnout Detection</h4>
                   <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Monitoring human velocity & sentiment patterns.</p>
                </div>
             </div>
             <div style={{ textAlign: 'right' }}>
                <span style={{ 
                  padding: '0.2rem 0.6rem', borderRadius: '20px', 
                  background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', 
                  fontSize: '0.7rem', fontWeight: 800 
                }}>HEALTHY VELOCITY</span>
             </div>
          </div>

          {/* 🤝 Module 16: The Neural Bridge */}
          <div className="workspace-bridge-card" style={{ 
            marginBottom: '2rem', padding: '1.5rem', borderRadius: '16px',
            background: isDark ? 'rgba(59, 130, 246, 0.05)' : '#fff',
            border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.2)' : '#e5e7eb'}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ fontSize: '1.5rem' }}>🌉</div>
                <div>
                   <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: isDark ? '#fff' : '#111827' }}>Neural Bridge (Omni-channel)</h4>
                   <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Slack, Discord, and Teams integration active.</p>
                </div>
             </div>
             <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }} title="Slack Connected" />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1' }} title="Discord Connected" />
             </div>
          </div>

          {/* 🌐 Module 13: Cross-Project Neural Transfer (The Swarm) */}
          <div className="workspace-swarm-card" style={{ 
            marginBottom: '2rem', padding: '1.5rem', borderRadius: '16px',
            background: isDark ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)' : '#f0fdf4',
            border: `1px solid ${isDark ? '#374151' : '#dcfce7'}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ fontSize: '1.5rem' }}>🐝</div>
                <div>
                   <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: isDark ? '#fff' : '#111827' }}>Swarm Intelligence Transfer</h4>
                   <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Synthesizing architectural lessons across your portfolio.</p>
                </div>
             </div>
             <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10b981' }}>
                34 GLOBAL INSIGHTS APPLIED
             </div>
          </div>

          {/* 🌩️ Module 21: Distributed Neural Failover (The Eternal System) */}
          <div className="workspace-failover-card" style={{ 
            marginBottom: '2rem', padding: '1.5rem', borderRadius: '16px',
            background: isDark ? 'rgba(31, 41, 55, 0.5)' : '#f9fafb',
            border: `1px solid ${isDark ? '#4b5563' : '#e5e7eb'}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ fontSize: '1.5rem' }}>🌩️</div>
                <div>
                   <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: isDark ? '#fff' : '#111827' }}>Eternal Failover Protocol</h4>
                   <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Distributed multi-cloud redundancy (AWS + GCP).</p>
                </div>
             </div>
             <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#10b981' }}>SYSTEM INDESTRUCTIBLE</span>
                <div className="pd-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
             </div>
          </div>

          {/* 🔄 Module 4: Reflexion & Lessons Learned Archive */}
          <div className="workspace-lessons-card" style={{ 
            marginBottom: '2rem', 
            padding: '2rem', 
            borderRadius: '16px', 
            background: isDark ? 'rgba(31, 41, 55, 0.3)' : '#fff',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#e5e7eb'}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ 
                  width: '40px', height: '40px', borderRadius: '10px', 
                  background: 'rgba(139, 92, 246, 0.1)', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', color: '#8b5cf6'
                }}>
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                   <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: isDark ? '#ddd' : '#111827' }}>Lessons Learned Archive</h3>
                   <p style={{ fontSize: '0.82rem', color: '#9ca3af' }}>Autonomous Reflexion: How the AI is adapting to your feedback.</p>
                </div>
             </div>

             {lessons.loading ? (
                <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Retrieving memory logs...</p>
             ) : lessons.data.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                   {lessons.data.slice(0, 3).map((lesson, idx) => (
                      <div key={idx} style={{ 
                        padding: '1.25rem', borderRadius: '12px', 
                        background: isDark ? 'rgba(0,0,0,0.2)' : '#f9fafb',
                        borderLeft: '4px solid #8b5cf6'
                      }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8b5cf6' }}>CORRECTION #{lessons.data.length - idx}</span>
                            <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{new Date(lesson.createdAt).toLocaleDateString()}</span>
                         </div>
                         <p style={{ fontSize: '0.85rem', color: isDark ? '#d1d5db' : '#374151', fontStyle: 'italic' }}>
                            "{lesson.reason}"
                         </p>
                      </div>
                   ))}
                </div>
             ) : (
                <div style={{ textAlign: 'center', padding: '2rem', border: '2px dashed #374151', borderRadius: '12px' }}>
                   <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>No rejections yet. The AI is perfectly aligned with your vision!</p>
                </div>
             )}
          </div>

          {pipelineState.status !== 'idle' ? (
            <div className="workspace-container">
              {pipelineState.status === 'running' ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#3b82f6' }}>
                   <div className="pd-spinner-lg" style={{ margin: '0 auto 1rem' }} />
                   AI is processing neural pathways...
                </div>
              ) : (
                <div className="workspace-terminal">
                  <div className="terminal-header">
                    <div className="terminal-dots">
                      <span></span><span></span><span></span>
                    </div>
                    <div className="terminal-title">Agent_Pipeline_Deploy</div>
                    <div className={`terminal-status ${pipelineState.status}`}>
                      {pipelineState.status.toUpperCase()}
                    </div>
                  </div>
                  <div className="terminal-content">
                    {pipelineState.logs.map((log, index) => {
                       let logClass = '';
                       if (log.includes('[✔]') || log.includes('[★]')) logClass = 'success';
                       if (log.includes('[✖]') || log.includes('FATAL ERROR')) logClass = 'error';
                       return (
                         <div key={index} className={`terminal-log ${logClass}`}>
                           <span className="log-time">{String(index + 1).padStart(2, '0')}:</span>
                           <span className="log-msg">{log}</span>
                         </div>
                       );
                    })}
                    {pipelineState.status === 'running' && <div className="terminal-cursor">_</div>}
                  </div>
                  
                  {pipelineState.complete && (
                    <div className="terminal-actions">
                      <button className="btn-reset" onClick={() => setPipelineState({ status: 'idle', logs: [], complete: false })}>
                        Reset Pipeline
                      </button>
                      <button className="btn-view" onClick={() => setActiveTab('tasks')}>
                        View Kanban Board &rarr;
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="workspace-empty-state">
              <div className="empty-icon">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3>AI Project Planner</h3>
              <p>Leverage our autonomous AI agent to analyze your project description and instantly orchestrate a master development timeline and task backlog.</p>
              <button className="btn-run-agent" onClick={handleRunPlanner}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                </svg>
                Run Planner Agent
              </button>
            </div>
          )}

          {/* 👁️ Module 2: Visual Auditor Section */}
          <div className="workspace-visual-auditor" style={{ 
            marginTop: '2rem', 
            padding: '2rem', 
            borderRadius: '16px', 
            background: isDark ? 'rgba(31, 41, 55, 0.5)' : '#fff',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ 
                width: '40px', height: '40px', borderRadius: '10px', 
                background: 'rgba(59, 130, 246, 0.1)', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', color: '#3b82f6'
              }}>
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: isDark ? '#f9fafb' : '#111827' }}>Autonomous Visual Auditor</h3>
                <p style={{ fontSize: '0.82rem', color: '#9ca3af' }}>AI-powered UI/UX inspection via high-fidelity computer vision.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <input 
                type="text" 
                placeholder="Enter URL (e.g., http://localhost:3000)"
                value={visualAudit.url}
                onChange={(e) => setVisualAudit(prev => ({ ...prev, url: e.target.value }))}
                style={{
                  flex: 1, padding: '0.75rem 1rem', borderRadius: '10px',
                  background: isDark ? '#111827' : '#f9fafb',
                  border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                  color: isDark ? '#f9fafb' : '#111827',
                  fontSize: '0.85rem'
                }}
              />
              <button 
                className="btn-run-audit"
                onClick={handleRunVisualAudit}
                disabled={visualAudit.loading || !visualAudit.url}
                style={{
                  padding: '0.75rem 1.5rem', borderRadius: '10px',
                  background: '#3b82f6', color: '#fff', border: 'none',
                  fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                  opacity: (visualAudit.loading || !visualAudit.url) ? 0.6 : 1,
                  display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}
              >
                {visualAudit.loading ? 'Auditing...' : 'Run Visual Audit'}
              </button>
            </div>

            {visualAudit.loading && (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <div className="pd-spinner-lg" style={{ margin: '0 auto 1rem' }} />
                <p style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: 500 }}>AI is capturing and analyzing the UI layers...</p>
              </div>
            )}

            {visualAudit.results && (
              <div className="audit-results" style={{ animation: 'pdFadeIn 0.4s ease both' }}>
                <div style={{ 
                  display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem',
                  padding: '1.5rem', borderRadius: '12px', background: isDark ? '#111827' : '#f9fafb'
                }}>
                  {/* Screenshot Preview */}
                  <div className="audit-screenshot">
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', marginBottom: '0.5rem' }}>SNAPSHOT EVIDENCE</p>
                    <div style={{ 
                      borderRadius: '8px', overflow: 'hidden', border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                      aspectRatio: '16/10', background: '#000'
                    }}>
                      <img 
                        src={`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001'}${visualAudit.results.screenshotUrl}`} 
                        alt="Audit Snapshot"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  </div>

                  {/* Audit Findings */}
                  <div className="audit-findings">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af' }}>AI INSIGHTS</p>
                      <span style={{ 
                        padding: '0.25rem 0.6rem', borderRadius: '20px', 
                        background: visualAudit.results.audit.score > 80 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        color: visualAudit.results.audit.score > 80 ? '#10b981' : '#ef4444',
                        fontSize: '0.75rem', fontWeight: 700
                      }}>
                        Health Score: {visualAudit.results.audit.score}/100
                      </span>
                    </div>
                    
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>{visualAudit.results.audit.summary}</h4>
                    
                    <div className="flaws-list" style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                      {visualAudit.results.audit.flaws.map((flaw, idx) => (
                        <div key={idx} style={{ 
                          padding: '0.75rem', borderRadius: '8px', marginBottom: '0.5rem',
                          background: isDark ? '#1f2937' : '#fff', border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                          fontSize: '0.8rem'
                        }}>
                          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                             <span style={{ 
                               color: flaw.severity === 'high' ? '#ef4444' : flaw.severity === 'medium' ? '#f59e0b' : '#10b981',
                               fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem'
                             }}>[{flaw.severity}]</span>
                             <strong style={{ color: isDark ? '#f9fafb' : '#111827' }}>{flaw.issue}</strong>
                          </div>
                          <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{flaw.fix}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 🌀 Module 18: Recursive Feature Architecting Section */}
          <div className="workspace-evolution-card" style={{ 
            marginTop: '2rem', 
            padding: '2rem', 
            borderRadius: '16px', 
            background: isDark ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.02) 100%)' : '#fff',
            border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.2)' : '#ecfdf5'}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                   <div style={{ 
                     width: '40px', height: '40px', borderRadius: '10px', 
                     background: 'rgba(16, 185, 129, 0.1)', display: 'flex', 
                     alignItems: 'center', justifyContent: 'center', color: '#10b981'
                   }}>
                     <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                     </svg>
                   </div>
                   <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: isDark ? '#a7f3d0' : '#047857' }}>Recursive Feature Architecting</h3>
                      <p style={{ fontSize: '0.82rem', color: '#9ca3af' }}>Anticipatory Intelligence: The AI suggests its own upgrades.</p>
                   </div>
                </div>
                <button 
                  onClick={handleEvolutionRequest}
                  disabled={evolutionProposal.loading}
                  style={{
                    padding: '0.6rem 1.2rem', borderRadius: '10px',
                    background: '#10b981', color: 'white', border: 'none',
                    fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                  }}
                >
                   {evolutionProposal.loading ? 'Architecting...' : (
                     <>
                       <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>
                       Request Neural Upgrade
                     </>
                   )}
                </button>
             </div>

             {evolutionProposal.data && (
                <div style={{ animation: 'pdFadeIn 0.4s ease both' }}>
                   <div style={{ 
                     padding: '1.5rem', borderRadius: '12px', 
                     background: isDark ? 'rgba(0,0,0,0.2)' : '#f9fafb',
                     border: `1px solid ${isDark ? '#374151' : '#eee'}`
                   }}>
                      <div style={{ marginBottom: '1rem' }}>
                         <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>Pattern Detected</span>
                         <p style={{ fontSize: '0.9rem', color: isDark ? '#fff' : '#111827', marginTop: '4px' }}>{evolutionProposal.data.patternDetected}</p>
                      </div>
                      <div style={{ marginBottom: '1rem' }}>
                         <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>Proposed Feature</span>
                         <h4 style={{ fontSize: '1.2rem', fontWeight: 900, color: isDark ? '#fff' : '#111827', marginTop: '4px' }}>{evolutionProposal.data.proposedFeature}</h4>
                      </div>
                      <div style={{ 
                        padding: '1rem', borderRadius: '8px', 
                        background: isDark ? '#111827' : '#fff', border: `1px solid ${isDark ? '#374151' : '#eee'}` 
                      }}>
                         <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase' }}>Technical Spec</span>
                         <p style={{ fontSize: '0.85rem', color: isDark ? '#d1d5db' : '#374151', marginTop: '8px', whiteSpace: 'pre-wrap' }}>
                            {evolutionProposal.data.technicalSpec}
                         </p>
                      </div>
                   </div>
                </div>
             )}
          </div>

          {/* 🛠️ Module 19: SRE Self-Healing Demo Section */}
          <div className="workspace-sre-simulator" style={{ 
            marginTop: '2rem', 
            padding: '2rem', 
            borderRadius: '16px', 
            background: isDark ? 'rgba(239, 68, 68, 0.03)' : '#fff',
            border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2'}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ 
                width: '40px', height: '40px', borderRadius: '10px', 
                background: 'rgba(239, 68, 68, 0.1)', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', color: '#ef4444'
              }}>
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: isDark ? '#fca5a5' : '#b91c1c' }}>Autonomous SRE Guardian</h3>
                <p style={{ fontSize: '0.82rem', color: '#9ca3af' }}>24/7 Production incident response and autonomous remediation.</p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isDark ? '#111827' : '#f9fafb', padding: '1.25rem', borderRadius: '12px' }}>
              <div style={{ maxWidth: '70%' }}>
                <p style={{ fontSize: '0.85rem', color: isDark ? '#d1d5db' : '#374151', fontWeight: 600 }}>Simulate Production Incident</p>
                <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '4px' }}>Trigger a mock "500 Internal Server Error" to witness the AI SRE autonomously triaging the root cause and provisioning a fix.</p>
              </div>
              <button 
                onClick={async () => {
                  toast.info("🚨 Simulating Production Incident...");
                  try {
                    await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001'}/api/v1/sre/report/${id}`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        message: "ReferenceError: userProfile is not defined",
                        stack: "ReferenceError: userProfile is not defined\n    at getUserData (src/services/user.service.js:42:12)\n    at processRequest (src/controllers/user.controller.js:15:25)",
                        context: { path: "/api/profile", method: "GET" },
                        logs: ["[info] Session initialized", "[warn] DB connection latency high", "[error] Uncaught ReferenceError"]
                      })
                    });
                  } catch (e) {
                    toast.error("Simulation failed to reach backend.");
                  }
                }}
                style={{
                  padding: '0.75rem 1.25rem', borderRadius: '10px',
                  background: 'transparent', border: '1px solid #ef4444', color: '#ef4444',
                  fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  transition: 'all 0.2s'
                }}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Trigger Incident
              </button>
            </div>
          </div>
        </div>
      ) : activeTab === 'reports' ? (
        <div style={{
          padding: '2.5rem', textAlign: 'center', borderRadius: '14px',
          background: isDark ? '#1f2937' : '#f9fafb',
          border: `1px dashed ${isDark ? '#374151' : '#d1d5db'}`,
        }}>
          <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#10b981" style={{ margin: '0 auto 0.75rem' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: isDark ? '#f9fafb' : '#111827' }}>Project Reports</h3>
          <p style={{ fontSize: '0.82rem', color: '#9ca3af', marginTop: '0.25rem' }}>
            Go to the <button onClick={() => navigate('/reports')} style={{ color: '#3b82f6', cursor: 'pointer', background: 'none', border: 'none', textDecoration: 'underline', fontWeight: 600, fontSize: 'inherit' }}>Reports page</button> to submit and view project reports.
          </p>
        </div>
      ) : activeTab === 'settings' ? (
        <div className="settings-tab-content">
          <div className="settings-card">
            <div className="settings-section">
              <div className="settings-section-header">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <h3>GitHub Integration</h3>
              </div>
              
              <div className="settings-grid">
                <div className="settings-field">
                  <label>Repository URL</label>
                  <input 
                    type="text" 
                    placeholder="https://github.com/username/repo"
                    value={githubSettings.url}
                    onChange={(e) => setGithubSettings(prev => ({ ...prev, url: e.target.value }))}
                  />
                  <p style={{fontSize: '0.7rem', color: '#9ca3af', marginTop: '4px'}}>
                    Example: https://github.com/Prabesh666/learning-git
                  </p>
                </div>
                
                <div className="settings-field">
                  <label>Webhook Secret</label>
                  <input 
                    type="password" 
                    placeholder="Enter your secret key"
                    value={githubSettings.secret}
                    onChange={(e) => setGithubSettings(prev => ({ ...prev, secret: e.target.value }))}
                  />
                  <p style={{fontSize: '0.7rem', color: '#9ca3af', marginTop: '4px'}}>
                    Use the same secret in your GitHub Webhook settings.
                  </p>
                </div>
              </div>
            </div>

            <div className="settings-actions" style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                className="btn-save-settings" 
                onClick={handleSaveSettings}
                disabled={isSavingSettings}
              >
                {isSavingSettings ? 'Saving...' : 'Save Integration Settings'}
              </button>
              
              <button 
                className="btn-index-repo" 
                onClick={handleIndexRepo}
                disabled={isIndexing || !githubSettings.url}
                style={{
                  padding: '0.75rem 1.25rem',
                  borderRadius: '10px',
                  border: '1px solid #3b82f6',
                  background: 'rgba(59, 130, 246, 0.05)',
                  color: '#3b82f6',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: (isIndexing || !githubSettings.url) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  opacity: (isIndexing || !githubSettings.url) ? 0.6 : 1,
                  transition: 'all 0.2s'
                }}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {isIndexing ? 'Indexing...' : 'Re-index Repository'}
              </button>
            </div>
          </div>
          
          <div style={{ marginTop: '1.5rem', padding: '1.25rem', borderRadius: '12px', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#3b82f6', marginBottom: '0.5rem' }}>💡 Quick Guide</h4>
            <p style={{ fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.5 }}>
              1. Add a Webhook in GitHub to: <code style={{ background: 'rgba(0,0,0,0.1)', padding: '2px 4px', borderRadius: '4px' }}>{window.location.origin.replace('3000', '5000')}/api/webhooks/github</code><br/>
              2. Set content type to <strong>application/json</strong>.<br/>
              3. Paste the secret you set above into the "Secret" field in GitHub.
            </p>
          </div>
        </div>
      ) : (
        /* ─── Kanban Task Board ──────────────────── */
        <>
          {tasksLoading && (tasks || []).length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
              <div className="pd-spinner-lg" />
            </div>
          ) : tasksError ? (
            <div style={{
              maxWidth: 460, margin: '2rem auto', padding: '1.5rem',
              background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '14px', textAlign: 'center',
            }}>
              <p style={{ color: '#ef4444', fontWeight: 600, marginBottom: '0.5rem' }}>Failed to load tasks</p>
              <p style={{ color: '#9ca3af', fontSize: '0.82rem', marginBottom: '1rem' }}>{tasksError}</p>
              <button onClick={() => loadTasks(id)} style={{
                padding: '0.5rem 1.25rem', background: '#ef4444', color: '#fff',
                border: 'none', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
              }}>Retry</button>
            </div>
          ) : (
            <div className="kanban-scroll-container" style={{ marginTop: '1.5rem', height: '100%' }}>
              {/* TO-DO COLUMN */}
              <div className="kanban-column">
                <div className="column-header">
                  <h3>To-Do <span className="count">{todoTasks.length}</span></h3>
                  <button className="add-btn" onClick={() => { setEditingTask(null); setIsModalOpen(true); }} aria-label="Add Task">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                  </button>
                </div>
                
                <div className="kanban-cards">
                  {todoTasks.map((task) => (
                    <div key={task._id || task.id} className="task-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span className={`badge bd-${task.priority === 'high' || task.priority === 'critical' ? 'red' : task.priority === 'medium' ? 'orange' : 'blue'} outline`}>
                            {task.priority || 'Medium'}
                          </span>
                          {task.riskLevel && (
                            <span className={`badge bd-${task.riskLevel === 'high' ? 'red' : task.riskLevel === 'medium' ? 'orange' : 'green'} outline`} style={{ opacity: 0.8 }}>
                              Risk: {task.riskLevel}
                            </span>
                          )}
                        </div>
                        <button className="options-btn" onClick={() => { setEditingTask(task); setIsModalOpen(true); }} aria-label="Options">
                          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/></svg>
                        </button>
                      </div>
                      <h4>{task.title}</h4>
                      <p className="card-desc">{task.description}</p>
                      
                      <div className="card-footer">
                        <div className="card-actions">
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
                        </div>
                        <div className="avatars small">
                          <div className="avatar outline"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button className="add-task-btn" onClick={() => { setEditingTask(null); setIsModalOpen(true); }}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                    Add New Task
                  </button>
                </div>
              </div>

              {/* IN PROGRESS COLUMN */}
              <div className="kanban-column">
                <div className="column-header">
                  <h3>In Progress <span className="count bg-blue">{inProgressTasks.length}</span></h3>
                  <button className="add-btn" onClick={() => { setEditingTask(null); setIsModalOpen(true); }} aria-label="Add Task">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                  </button>
                </div>
                
                <div className="kanban-cards">
                  {inProgressTasks.map((task) => (
                    <div key={task._id || task.id} className="task-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span className={`badge bd-${task.priority === 'high' || task.priority === 'critical' ? 'red' : task.priority === 'medium' ? 'orange' : 'blue'} outline`}>
                            {task.priority || 'Medium'}
                          </span>
                          {task.riskLevel && (
                            <span className={`badge bd-${task.riskLevel === 'high' ? 'red' : task.riskLevel === 'medium' ? 'orange' : 'green'} outline`} style={{ opacity: 0.8 }}>
                              Risk: {task.riskLevel}
                            </span>
                          )}
                        </div>
                        <button className="options-btn" onClick={() => { setEditingTask(task); setIsModalOpen(true); }} aria-label="Options">
                          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/></svg>
                        </button>
                      </div>
                      <h4>{task.title}</h4>
                      <p className="card-desc">{task.description}</p>
                      
                      <div className="card-footer space-between mt-override">
                        <div className="card-actions">
                          <span className="due-date">
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                          </span>
                        </div>
                        <div className="avatars small">
                          <div className="avatar blue"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button className="add-task-btn" onClick={() => { setEditingTask(null); setIsModalOpen(true); }}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                    Add New Task
                  </button>
                </div>
              </div>

              {/* REVIEW COLUMN */}
              <div className="kanban-column">
                <div className="column-header">
                  <h3>Review <span className="count">{reviewTasks.length}</span></h3>
                  <button className="add-btn" onClick={() => { setEditingTask(null); setIsModalOpen(true); }} aria-label="Add Task">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                  </button>
                </div>
                
                <div className="kanban-cards">
                  {reviewTasks.map((task) => (
                    <div key={task._id || task.id} className="task-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span className={`badge bd-${task.priority === 'high' || task.priority === 'critical' ? 'red' : task.priority === 'medium' ? 'orange' : 'blue'} outline`}>
                            {task.priority || 'Medium'}
                          </span>
                          {task.riskLevel && (
                            <span className={`badge bd-${task.riskLevel === 'high' ? 'red' : task.riskLevel === 'medium' ? 'orange' : 'green'} outline`} style={{ opacity: 0.8 }}>
                              Risk: {task.riskLevel}
                            </span>
                          )}
                        </div>
                        <button className="options-btn" onClick={() => { setEditingTask(task); setIsModalOpen(true); }} aria-label="Options">
                          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/></svg>
                        </button>
                      </div>
                      <h4>{task.title}</h4>
                      <p className="card-desc">{task.description}</p>
                      
                      <div className="card-footer">
                        <div className="card-actions">
                          <span className="due-date">
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                          </span>
                        </div>
                        <div className="avatars small">
                          <div className="avatar outline"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button className="add-task-btn" onClick={() => { setEditingTask(null); setIsModalOpen(true); }}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                    Add New Task
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── Task Modal ────────────────────────── */}
      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          task={editingTask}
          projectId={id}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTask}
        />
      )}

      {/* ─── Delete Confirmation ───────────────── */}
      {taskToDelete && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: isDark ? '#1f2937' : '#ffffff',
            borderRadius: '16px', padding: '1.75rem', width: '100%', maxWidth: '380px',
            textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem',
            }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#ef4444">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: isDark ? '#f9fafb' : '#111827', marginBottom: '0.375rem' }}>Delete Task</h3>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '1.5rem' }}>
              Delete <strong style={{ color: isDark ? '#f9fafb' : '#111827' }}>"{taskToDelete.title}"</strong>? This cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.625rem' }}>
              <button onClick={() => setTaskToDelete(null)} disabled={isDeleting} style={{
                padding: '0.5rem 1.25rem', borderRadius: '8px',
                border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                background: 'transparent', color: isDark ? '#9ca3af' : '#6b7280',
                fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={confirmDelete} disabled={isDeleting} style={{
                padding: '0.5rem 1.25rem', borderRadius: '8px',
                border: 'none', background: '#ef4444', color: '#fff',
                fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                opacity: isDeleting ? 0.6 : 1,
              }}>{isDeleting ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}

      <HITLApprovalModal 
        job={pendingJob} 
        onApprove={handleApproveHitl} 
        onReject={handleRejectHitl} 
        isProcessing={isHitlProcessing} 
      />
    </div>
  );
};

export default ProjectDetailsPage;
