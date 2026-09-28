import React, { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FolderGit2,
  Users,
  Video,
  CheckSquare,
  FolderPlus,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { getProjects } from '@/api/project/project.api';
import type { Project } from '@/types/project.types';
import {
  getProjectId,
  getProjectName,
  getProjectCode,
  getProjectDesc,
  getProjectStatus,
} from '@/types/project.types';
import type { BadgeTone } from '@/components/ui/badge-variants';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateProjectModal } from '@/components/dashboard/CreateProjectModal';

type ProjectFilterStatus = 'all' | 'active' | 'planning' | 'completed' | 'archived';

const getStatusBadgeTone = (status: string): BadgeTone => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'success';
    case 'planning':
      return 'info';
    case 'completed':
      return 'neutral';
    case 'archived':
      return 'warning';
    default:
      return 'neutral';
  }
};

const isValidFilterStatus = (status: string | null): status is ProjectFilterStatus => {
  if (!status) return false;
  return ['all', 'active', 'planning', 'completed', 'archived'].includes(status.toLowerCase());
};

export const Projects: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);

  const rawStatus = searchParams.get('status');
  const statusFilter: ProjectFilterStatus = isValidFilterStatus(rawStatus)
    ? (rawStatus.toLowerCase() as ProjectFilterStatus)
    : 'all';

  const {
    data: projectsResponse,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await getProjects();
      return response.data;
    },
  });

  const rawProjects = projectsResponse?.data;
  const projectsList: Project[] = Array.isArray(rawProjects) ? rawProjects : [];

  const filteredProjects: Project[] = projectsList.filter((project) => {
    if (statusFilter === 'all') return true;
    const status = getProjectStatus(project);
    return status.toLowerCase() === statusFilter;
  });

  const handleFilterChange = (filter: ProjectFilterStatus) => {
    const nextParams = new URLSearchParams(searchParams);
    if (filter === 'all') {
      nextParams.delete('status');
    } else {
      nextParams.set('status', filter);
    }
    setSearchParams(nextParams);
  };

  const handleProjectCreated = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['projects'] });
  }, [queryClient]);

  const handleCloseModal = useCallback(() => {
    setCreateModalOpen(false);
  }, []);

  const handleCardClick = (projectId: string) => {
    if (projectId) {
      navigate(`/projects/${projectId}`);
    }
  };

  const errorMessage =
    error instanceof Error ? error.message : 'Failed to load projects. Please try again.';

  const pageTitle =
    statusFilter === 'all'
      ? 'Projects'
      : `Projects (${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)})`;

  return (
    <div className="w-full bg-background text-foreground p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <FolderGit2 className="text-emerald-500 dark:text-emerald-400" size={24} />
            <span>{pageTitle}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your workspace projects, team members, and linked meetings.
          </p>
        </div>

        <Button
          onClick={() => setCreateModalOpen(true)}
          className="shadow-xs shrink-0 gap-2"
        >
          <FolderPlus size={15} />
          <span>Create Project</span>
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        {(['all', 'active', 'planning', 'completed', 'archived'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => handleFilterChange(tab)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              statusFilter === tab
                ? 'bg-secondary text-foreground font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* State 1: Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-44 w-full rounded-md border border-border" />
          ))}
        </div>
      )}

      {/* State 2: Error Banner */}
      {!isLoading && isError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-destructive space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <AlertCircle size={18} />
            <span>Unable to load projects</span>
          </div>
          <p className="text-xs text-muted-foreground">{errorMessage}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
            <span>Retry</span>
          </Button>
        </div>
      )}

      {/* State 3: Empty State */}
      {!isLoading && !isError && filteredProjects.length === 0 && (
        <EmptyState
          icon={FolderPlus}
          title={statusFilter === 'all' ? 'No projects created yet' : `No ${statusFilter} projects found`}
          description={
            statusFilter === 'all'
              ? 'Get started by creating your first workspace project to organize sprints, host team meetings, and assign deliverables.'
              : `There are currently no projects marked as '${statusFilter}'. Create a new project to get started.`
          }
          actionLabel="Create Project"
          onAction={() => setCreateModalOpen(true)}
        />
      )}

      {/* State 4: Success Grid */}
      {!isLoading && !isError && filteredProjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const projectId = getProjectId(project);
            const projectName = getProjectName(project);
            const projectCode = getProjectCode(project).toUpperCase();
            const projectDesc = getProjectDesc(project);
            const projectStatus = getProjectStatus(project);
            const badgeTone = getStatusBadgeTone(projectStatus);

            const teamCount = project.memberCount ?? project.members?.length ?? 0;
            const meetingsCount = project.meetingCount ?? 0;
            const tasksCount = project.taskCount ?? 0;

            return (
              <div
                key={projectId || projectName}
                onClick={() => handleCardClick(projectId)}
                className="cursor-pointer rounded-md border border-border bg-card text-card-foreground p-5 hover:border-emerald-500/40 transition-all shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-foreground bg-secondary border border-border px-2 py-0.5 rounded-sm">
                      {projectCode}
                    </span>
                    <Badge tone={badgeTone}>
                      {projectStatus.charAt(0).toUpperCase() + projectStatus.slice(1)}
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold text-foreground leading-snug">
                    {projectName}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
                    {projectDesc || 'No description provided for this project.'}
                  </p>
                </div>

                {/* Metric Footer */}
                <div className="pt-3 border-t border-border grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-secondary rounded-sm p-2">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
                      <Users size={12} />
                      <span className="text-[10px]">Team</span>
                    </div>
                    <div className="font-bold text-foreground">{teamCount}</div>
                  </div>

                  <div className="bg-secondary rounded-sm p-2">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
                      <Video size={12} />
                      <span className="text-[10px]">Meets</span>
                    </div>
                    <div className="font-bold text-foreground">{meetingsCount}</div>
                  </div>

                  <div className="bg-secondary rounded-sm p-2">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
                      <CheckSquare size={12} />
                      <span className="text-[10px]">Tasks</span>
                    </div>
                    <div className="font-bold text-foreground">{tasksCount}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={createModalOpen}
        onClose={handleCloseModal}
        onCreated={handleProjectCreated}
      />
    </div>
  );
};
