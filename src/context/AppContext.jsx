import { createContext, useState, useEffect, useCallback } from 'react';
import { fetchProjects as apiFetchProjects, fetchProjectById as apiFetchProjectById, createProject as apiCreateProject, updateProject as apiUpdateProject, deleteProject as apiDeleteProject } from '../api/projects';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Auth State
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  
  // App Loading states
  const [loading, setLoading] = useState(false); // Can be used for auth init if needed
  
  // Projects Global State
  const [projects, setProjects] = useState(() => {
    try {
      const stored = localStorage.getItem('projects');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsLoaded, setProjectsLoaded] = useState(false); // Prevents duplicate fetches
  const [projectsError, setProjectsError] = useState(null);

  // --- AUTH ACTIONS ---
  const login = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setProjects([]);
    setProjectsLoaded(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('projects');
  };

  // --- PROJECTS ACTIONS ---
  // Sync projects to storage
  useEffect(() => {
    if (projects.length > 0 || projectsLoaded) {
      localStorage.setItem('projects', JSON.stringify(projects));
    }
  }, [projects, projectsLoaded]);

  const loadProjects = useCallback(async (force = false) => {
    // If not forced and already loaded/loading, return early to prevent duplicate calls
    if (!force && (projectsLoaded || projectsLoading)) return projects;
    
    setProjectsLoading(true);
    setProjectsError(null);
    try {
      const response = await apiFetchProjects();
      const list = Array.isArray(response) ? response
        : Array.isArray(response?.data?.projects) ? response.data.projects
        : Array.isArray(response?.data) ? response.data
        : Array.isArray(response?.projects) ? response.projects
        : Array.isArray(response?.results) ? response.results : [];
      setProjects(list);
      setProjectsLoaded(true);
      return list;
    } catch (err) {
      if (err?.response?.status !== 404) {
        setProjectsError(err.message || 'Failed to load projects');
      }
      return [];
    } finally {
      setProjectsLoading(false);
    }
  }, [projectsLoaded, projectsLoading]);

  const addProject = async (projectData) => {
    try {
      const response = await apiCreateProject(projectData);
      const newProject = response?.data || response?.project || response;
      setProjects((prev) => [...prev, newProject]);
      return newProject;
    } catch (err) {
      setProjectsError(err.message || 'Failed to create project');
      throw err;
    }
  };

  const editProject = async (id, projectData) => {
    try {
      const response = await apiUpdateProject(id, projectData);
      const updatedProject = response?.data || response?.project || response;
      setProjects((prev) => 
        prev.map(p => p._id === id || p.id === id ? updatedProject : p)
      );
      return updatedProject;
    } catch (err) {
      setProjectsError(err.message || 'Failed to update project');
      throw err;
    }
  };

  const removeProject = async (id) => {
    try {
      await apiDeleteProject(id);
      setProjects((prev) => prev.filter((p) => p._id !== id && p.id !== id));
      return true;
    } catch (err) {
      setProjectsError(err.message || 'Failed to delete project');
      throw err;
    }
  };

  const loadProjectById = useCallback(async (id) => {
    try {
      const response = await apiFetchProjectById(id);
      const projectData = response?.data || response;
      if (projectData) {
        setProjects((prev) => {
          const exists = prev.find(p => p._id === id || p.id === id);
          if (exists) return prev.map(p => (p._id === id || p.id === id) ? projectData : p);
          return [...prev, projectData];
        });
      }
      return projectData;
    } catch (err) {
      console.error('Failed to load project by ID:', err);
      throw err;
    }
  }, []);

  return (
    <AppContext.Provider 
      value={{ 
        // Auth
        user, token, loading, login, logout,
        // Projects
        projects, projectsLoading, projectsError,
        loadProjects, loadProjectById, addProject, editProject, removeProject
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
