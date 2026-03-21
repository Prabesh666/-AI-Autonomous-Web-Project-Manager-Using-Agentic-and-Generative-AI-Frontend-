import { useState, useEffect } from 'react';
import './TaskModal.css';

const TaskModal = ({ isOpen, onClose, onSave, task, projectId }) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState(task?.status || 'pending');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status || 'pending');
    } else {
      setTitle('');
      setDescription('');
      setStatus('pending');
    }
    setError('');
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      setSubmitting(true);
      await onSave({ 
        title, 
        description, 
        status, 
        project: projectId 
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="tm-overlay">
      <div className="tm-modal">
        <div className="tm-header">
          <h2 className="tm-title">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button 
            onClick={onClose}
            className="tm-close-btn"
            aria-label="Close"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="tm-form">
          {error && (
            <div className="tm-error">
              {error}
            </div>
          )}

          <div className="tm-form-group">
            <label className="tm-label">
              Task Title <span className="tm-required">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="tm-input"
              placeholder="e.g. Design Homepage"
              autoFocus
            />
          </div>

          <div className="tm-form-group">
            <label className="tm-label">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="tm-textarea"
              placeholder="Brief details about the task..."
            />
          </div>

          <div className="tm-form-group">
            <label className="tm-label">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="tm-select"
            >
              <option value="pending">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="tm-actions">
            <button
              type="button"
              onClick={onClose}
              className="tm-btn-cancel"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="tm-btn-submit"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : (task ? 'Save Changes' : 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
