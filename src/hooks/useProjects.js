import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

export const useProjects = () => {
  const {
    projects,
    projectsLoading,
    projectsError,
    loadProjects,
    addProject,
    editProject,
    removeProject
  } = useContext(AppContext);

  return {
    projects,
    loading: projectsLoading,
    error: projectsError,
    loadProjects,
    addProject,
    editProject,
    removeProject
  };
};
