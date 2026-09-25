import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FolderGit2, Users, Video, CheckSquare, FolderPlus } from 'lucide-react';
import { useProject } from '@/context/ProjectContext';
import {
  getProjectName,
  getProjectCode,
  getProjectDesc,
  getProjectStatus,
  getProjectId,
  type Project,
} from '@/types/project.types';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getProjectStatusTone } from '@/lib/status-tone';
import { CreateProjectModal } from '@/components/dashboard/CreateProjectModal';

export const Projects: React.FC = () => {
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('status') || 'ALL';
  const { projects, loading, addProject, refreshProjects } = useProject();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const filteredProjects = projects.filter((p) => {
    if (currentTab === 'ALL') return true;
    const status = getProjectStatus(p);
    return status.toLowerCase() === currentTab.toLowerCase();
  });

  const handleProjectCreated = (newProj: Project) => {
    addProject(newProj);
    refreshProjects();
  };

  const pageTitle =
    currentTab === 'ALL'
      ? 'Projects'
      : `Projects (${currentTab.charAt(0).toUpperCase() + currentTab.slice(1).toLowerCase()})`;

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

      {/* Projects Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-44 w-full rounded-md" />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        /* Empty State Card when no projects exist */
        <EmptyState
          icon={FolderPlus}
          title={currentTab === 'ALL' ? 'No projects created yet' : `No ${currentTab} projects found`}
          description={
            currentTab === 'ALL'
              ? 'Get started by creating your first workspace project to organize sprints, host team meetings, and assign deliverables.'
              : `There are currently no projects marked as '${currentTab}'. Create a new project to get started.`
          }
          actionLabel="Create New Project"
          onAction={() => setCreateModalOpen(true)}
          accentColor="emerald"
        />
      ) : (
        /* Projects Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const pId = getProjectId(project);
            const pName = getProjectName(project);
            const pCode = getProjectCode(project);
            const pDesc = getProjectDesc(project);
            const pStatus = getProjectStatus(project);
            const memberCount = (project.members?.length || project.memberCount || 0) + (project.hosts?.length || 0);

            return (
              <div
                key={pId || pName}
                className="rounded-md border border-border bg-card text-card-foreground p-5 hover:border-emerald-500/40 transition-all shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-sm">
                      {pCode}
                    </span>
                    <Badge tone={getProjectStatusTone(pStatus)}>{pStatus}</Badge>
                  </div>

                  <h3 className="text-base font-bold text-foreground leading-snug">{pName}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {pDesc || 'No description provided for this project.'}
                  </p>
                </div>

                {/* Metrics */}
                <div className="pt-3 border-t border-border grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-secondary rounded-sm p-2">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
                      <Users size={12} />
                      <span className="text-[10px]">Team</span>
                    </div>
                    <div className="font-bold text-foreground">{memberCount}</div>
                  </div>

                  <div className="bg-secondary rounded-sm p-2">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
                      <Video size={12} />
                      <span className="text-[10px]">Meets</span>
                    </div>
                    <div className="font-bold text-foreground">{project.meetingCount || 0}</div>
                  </div>

                  <div className="bg-secondary rounded-sm p-2">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
                      <CheckSquare size={12} />
                      <span className="text-[10px]">Tasks</span>
                    </div>
                    <div className="font-bold text-foreground">{project.taskCount || 0}</div>
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
        onClose={() => setCreateModalOpen(false)}
        onCreated={handleProjectCreated}
      />
    </div>
  );
};
