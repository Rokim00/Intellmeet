import { useCallback, useMemo, useState } from 'react';
import { getProjects } from '@/api/project/project.api';
import { getProjectId, type Project } from '@/types/project.types';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@/hooks/useApi';
import { queryKeys } from '@/api/queryClient';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Loads the organization-scoped project list once per authenticated session.
 *
 * Only the selected *id* is stored. The project itself is derived from the list
 * during render, so the selection can never drift out of sync with the data and
 * no effect is needed to reconcile them. Signing out clears the whole query
 * cache in AuthContext, so there is nothing to clean up here.
 */
export const useProjects = () => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const { data, loading, error } = useQuery<Project[]>(
    queryKeys.projects.list(),
    () => getProjects(),
    { enabled: isAuthenticated, list: true }
  );

  // Memoized so its identity is stable; the useMemo below depends on it.
  const projects = useMemo(() => data ?? [], [data]);

  const selectedProject = useMemo(() => {
    if (projects.length === 0) return null;
    const match = projects.find((p) => getProjectId(p) === selectedProjectId);
    // Fall back to the first project when nothing is selected, or when the
    // selected project no longer exists in the list.
    return match ?? projects[0];
  }, [projects, selectedProjectId]);

  const setSelectedProject = useCallback((proj: Project | null) => {
    setSelectedProjectId(proj ? getProjectId(proj) : null);
  }, []);

  const addProject = useCallback(
    (proj: Project) => {
      // Seed the cache so the new project appears immediately, and keep the
      // server as the source of truth for everything else.
      queryClient.setQueryData<Project[]>(queryKeys.projects.list(), (prev) =>
        prev ? [proj, ...prev] : [proj]
      );
      setSelectedProjectId(getProjectId(proj));
    },
    [queryClient]
  );

  return {
    projects,
    selectedProject,
    setSelectedProject,
    loading: loading && !data,
    error,
    addProject,
  };
};

