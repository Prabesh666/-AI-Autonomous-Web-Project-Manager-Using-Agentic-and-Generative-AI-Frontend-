import { useState, useCallback } from 'react';
import { fetchTasksByProject, createTask, updateTask, deleteTask } from '../api/tasks';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTasks = useCallback(async (projectId) => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await fetchTasksByProject(projectId);
      // Normalize: API may return { success: true, data: { tasks: [] } } or { tasks: [] } or a plain array
      const data = resp?.data || resp;
      const list = Array.isArray(data) ? data
        : Array.isArray(data?.tasks) ? data.tasks
        : Array.isArray(data?.results) ? data.results : [];
      setTasks(list);
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const addTask = async (taskData) => {
    try {
      const data = await createTask(taskData);
      const newTask = data?.task || data?.data || data;
      setTasks((prev) => [...prev, newTask]);
      return newTask;
    } catch (err) {
      setError(err.message || 'Failed to create task');
      throw err;
    }
  };

  const editTaskStatus = async (id, newStatus) => {
    try {
      const updatedTask = await updateTask(id, { status: newStatus });
      setTasks((prev) => 
        prev.map(t => t._id === id || t.id === id ? { ...t, status: newStatus } : t)
      );
      return updatedTask;
    } catch (err) {
      setError(err.message || 'Failed to update task status');
      throw err;
    }
  };
  
  const editTaskContent = async (id, data) => {
    try {
      const respData = await updateTask(id, data);
      const updatedTask = respData?.task || respData?.data || respData;
      setTasks((prev) => 
        prev.map(t => t._id === id || t.id === id ? { ...t, ...updatedTask } : t)
      );
      return updatedTask;
    } catch (err) {
      setError(err.message || 'Failed to update task');
      throw err;
    }
  };

  const removeTask = async (id) => {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter(t => t._id !== id && t.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete task');
      throw err;
    }
  };

  // Helper function to get grouped tasks
  const getGroupedTasks = () => {
    return tasks.reduce((grouped, task) => {
      const status = task.status || 'pending';
      const normalizedStatus = (status.toLowerCase() === 'in-progress' || status.toLowerCase() === 'doing') ? 'in-progress' : 
                               (status.toLowerCase() === 'completed' || status.toLowerCase() === 'done') ? 'completed' : 'pending';
      
      if (!grouped[normalizedStatus]) {
        grouped[normalizedStatus] = [];
      }
      grouped[normalizedStatus].push(task);
      return grouped;
    }, { 'pending': [], 'in-progress': [], 'completed': [] });
  };

  return {
    tasks,
    loading,
    error,
    loadTasks,
    addTask,
    editTaskStatus,
    editTaskContent,
    removeTask,
    getGroupedTasks
  };
};
