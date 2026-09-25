import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Project } from '@/types/project.types';
import { getProjects } from '@/api/project/project.api';
import { useAuth } from '@/context/AuthContext';

interface ProjectContextType {
  projects: Project[];
  selectedProject: Project | null;
  setSelectedProject: (proj: Project | null) => void;
  loading: boolean;
  refreshProjects: () => Promise<void>;
  addProject: (proj: Project) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await getProjects();
      if (res.data?.data && Array.isArray(res.data.data)) {
        const fetched = res.data.data;
        setProjects(fetched);
        if (fetched.length > 0) {
          setSelectedProject((prev) => {
            if (prev) {
              const stillExists = fetched.find(
                (p) => (p.projectId || p.id) === (prev.projectId || prev.id)
              );
              if (stillExists) return stillExists;
            }
            return fetched[0];
          });
        } else {
          setSelectedProject(null);
        }
      } else {
        setProjects([]);
        setSelectedProject(null);
      }
    } catch (err) {
      console.warn('Could not fetch projects from backend:', err);
      setProjects([]);
      setSelectedProject(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Fetching projects synchronizes external project data with auth state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProjects();
  }, [isAuthenticated, fetchProjects]);

  const addProject = (proj: Project) => {
    setProjects((prev) => [proj, ...prev]);
    setSelectedProject(proj);
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        selectedProject,
        setSelectedProject,
        loading,
        refreshProjects: fetchProjects,
        addProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
