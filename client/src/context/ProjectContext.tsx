import React, { createContext, useContext, useMemo } from 'react';
import type { Project } from '@/types/project.types';
import { useProjects } from '@/hooks/useProjects';

interface ProjectContextValue {
  projects: Project[];
  selectedProject: Project | null;
  setSelectedProject: (proj: Project | null) => void;
  loading: boolean;
  addProject: (proj: Project) => void;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    projects,
    selectedProject,
    setSelectedProject,
    loading,
    addProject,
  } = useProjects();

  const value = useMemo(
    () => ({ projects, selectedProject, setSelectedProject, loading, addProject }),
    [projects, selectedProject, setSelectedProject, loading, addProject]
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

