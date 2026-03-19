import { useState, useCallback } from 'react';
import { fetchProjects, createProject, updateProject, deleteProject } from '../api/projects';

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProjects();
      // Normalize: API may return { projects: [] }, { results: [] }, or a plain array
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.projects)
          ? data.projects
          : Array.isArray(data?.results)
            ? data.results
            : [];
      setProjects(list);
    } catch (err) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  const addProject = async (projectData) => {
    try {
      const newProject = await createProject(projectData);
      setProjects((prev) => [...prev, newProject]);
      return newProject;
    } catch (err) {
      setError(err.message || 'Failed to create project');
      throw err;
    }
  };

  const editProject = async (id, projectData) => {
    try {
      const updatedProject = await updateProject(id, projectData);
      setProjects((prev) => 
        prev.map(p => p._id === id || p.id === id ? updatedProject : p)
      );
      return updatedProject;
    } catch (err) {
      setError(err.message || 'Failed to update project');
      throw err;
    }
  };

  const removeProject = async (id) => {
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter(p => p._id !== id && p.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete project');
      throw err;
    }
  };

  return {
    projects,
    loading,
    error,
    loadProjects,
    addProject,
    editProject,
    removeProject
  };
};
