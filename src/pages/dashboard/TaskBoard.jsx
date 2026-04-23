import { useEffect, useState } from 'react';
import { useProjects } from '../../hooks/useProjects';
import { useTasks } from '../../hooks/useTasks';
import { useToast } from '../../context/ToastContext';
import TaskModal from '../projects/TaskModal';
import './TaskBoard.css';

const TaskBoard = () => {
  const { projects, loadProjects } = useProjects();
  const { tasks, loadTasks, getGroupedTasks, addTask, editTaskContent, loading, error } = useTasks();
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const toast = useToast();

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const currentProjectId = selectedProjectId || (projects.length > 0 ? (projects[0]._id || projects[0].id) : '');

  useEffect(() => {
    if (currentProjectId) {
      loadTasks(currentProjectId);
    }
  }, [currentProjectId, loadTasks]);

  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        await editTaskContent(editingTask._id || editingTask.id, taskData);
        toast.success('Task updated successfully');
      } else {
        await addTask(taskData);
        toast.success('Task created successfully');
      }
    } catch (err) {
      console.error('Failed to save task:', err);
      toast.error(err.message || 'Failed to save task');
    }
  };

  const groupedTasks = getGroupedTasks();
  const todoTasks = groupedTasks['pending'] || [];
  const inProgressTasks = groupedTasks['in-progress'] || [];
  const reviewTasks = groupedTasks['completed'] || [];
  return (
    <div className="task-board">
      <div className="board-header">
        <div className="tabs-container">
          <button className="tab active">To-Do</button>
          <button className="tab">In Progress</button>
          <button className="tab">Review</button>
        </div>
        
        <div className="board-actions">
           {projects.length > 0 && (
             <select 
               value={currentProjectId} 
               onChange={(e) => setSelectedProjectId(e.target.value)}
               className="project-selector"
               style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  marginRight: '10px'
               }}
             >
               {projects.map(p => (
                 <option key={p._id || p.id} value={p._id || p.id}>
                   {p.name}
                 </option>
               ))}
             </select>
           )}
        </div>
      </div>

      <div className="kanban-scroll-container">
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
                <span className="badge bd-orange outline">Priority</span>
                <button className="options-btn" onClick={() => { setEditingTask(task); setIsModalOpen(true); }} aria-label="Options">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/></svg>
                </button>
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
                <span className="badge bd-orange outline">Priority</span>
                <button className="options-btn" onClick={() => { setEditingTask(task); setIsModalOpen(true); }} aria-label="Options">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/></svg>
                </button>
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
                <span className="badge bd-orange outline">Priority</span>
                <button className="options-btn" onClick={() => { setEditingTask(task); setIsModalOpen(true); }} aria-label="Options">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/></svg>
                </button>
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
          </div>
        </div>

      </div>

      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
        projectId={currentProjectId}
      />
    </div>
  );
};

export default TaskBoard;
