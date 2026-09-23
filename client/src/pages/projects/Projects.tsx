import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FolderGit2, Plus, Users, Video, CheckSquare, Loader2, FolderPlus } from 'lucide-react';
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
import { CreateProjectModal } from '@/components/dashboard/CreateProjectModal';

export const Projects: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('status') || 'ALL';
  const { projects, loading, addProject, refreshProjects } = useProject();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const filteredProjects = projects.filter((p) => {
    if (currentTab === 'ALL') return true;
    const status = getProjectStatus(p);
    return status.toLowerCase() === currentTab.toLowerCase();
  });

  const getStatusBadgeStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'planning':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'completed':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'archived':
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  const handleProjectCreated = (newProj: Project) => {
    addProject(newProj);
    refreshProjects();
  };

  const pageTitle =
    currentTab === 'ALL'
      ? 'Projects'
      : `Projects (${currentTab.charAt(0).toUpperCase() + currentTab.slice(1).toLowerCase()})`;

  return (
    <div className="min-h-screen w-full bg-[#0c0c0e] text-white p-6 lg:p-8 space-y-6 font-['Plus_Jakarta_Sans']">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <FolderGit2 className="text-emerald-400" size={24} />
          <span>{pageTitle}</span>
        </h1>
      </div>

      {/* Projects Content Area */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-zinc-400 gap-2 text-xs">
          <Loader2 size={18} className="animate-spin text-emerald-400" />
          <span>Loading workspace projects…</span>
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
                className="rounded-lg border border-zinc-800/80 bg-[#121214] p-5 hover:border-zinc-700 transition-all shadow-md space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-sm">
                      {pCode}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-medium capitalize border ${getStatusBadgeStyle(
                        pStatus
                      )}`}
                    >
                      {pStatus}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">{pName}</h3>
                  <p className="text-xs text-zinc-400 line-clamp-2">
                    {pDesc || 'No description provided for this project.'}
                  </p>
                </div>

                {/* Metrics */}
                <div className="pt-3 border-t border-zinc-800/60 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-[#161618] rounded-sm p-2">
                    <div className="flex items-center justify-center gap-1 text-zinc-400 mb-0.5">
                      <Users size={12} />
                      <span className="text-[10px]">Team</span>
                    </div>
                    <div className="font-bold text-white">{memberCount}</div>
                  </div>

                  <div className="bg-[#161618] rounded-sm p-2">
                    <div className="flex items-center justify-center gap-1 text-zinc-400 mb-0.5">
                      <Video size={12} />
                      <span className="text-[10px]">Meets</span>
                    </div>
                    <div className="font-bold text-white">{project.meetingCount || 0}</div>
                  </div>

                  <div className="bg-[#161618] rounded-sm p-2">
                    <div className="flex items-center justify-center gap-1 text-zinc-400 mb-0.5">
                      <CheckSquare size={12} />
                      <span className="text-[10px]">Tasks</span>
                    </div>
                    <div className="font-bold text-white">{project.taskCount || 0}</div>
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
