import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  FolderGit2,
  ChevronDown,
} from 'lucide-react';
import { useProject } from '@/context/ProjectContext';
import { useOrganization } from '@/context/OrganizationContext';
import { useAuth } from '@/context/AuthContext';
import {
  getProjectName,
  getProjectCode,
  getProjectStatus,
  getProjectId,
  type Project,
} from '@/types/project.types';
import { InviteCodeModal } from '@/components/dashboard/InviteCodeModal';
import { CreateProjectModal } from '@/components/dashboard/CreateProjectModal';
import { AppSidebar } from '@/components/app-sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const { projects, selectedProject, setSelectedProject, addProject } = useProject();
  const { org } = useOrganization();
  const { refreshProfile } = useAuth();
  const location = useLocation();

  // Modals state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);

  // Regenerating the invite code changes the organization, which now comes from
  // the auth user rather than a separate fetch, so the profile must be re-read
  // for the new code to appear.
  const handleGenerateNewCode = async () => {
    await refreshProfile();
  };

  const handleSelectProject = (proj: Project) => {
    setSelectedProject(proj);
    setProjectDropdownOpen(false);
  };

  // `useMutation` invalidates the projects query and `addProject` seeds the
  // cache, so calling `refreshProjects()` here would just be a second request.
  const handleProjectCreated = (newProj: Project) => {
    addProject(newProj);
    setCreateModalOpen(false);
  };

  // Generate Breadcrumbs based on current route
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const items = [{ name: 'IntellMeet', path: '/dashboard' }];

    if (path === '/dashboard') {
      items.push({ name: 'Dashboard', path: '/dashboard' });
    } else if (path.startsWith('/projects')) {
      items.push({ name: 'Projects', path: '/projects' });
      const search = location.search.toLowerCase();
      if (search.includes('status=active')) {
        items.push({ name: 'Active', path: '/projects?status=active' });
      } else if (search.includes('status=planning')) {
        items.push({ name: 'Planning', path: '/projects?status=planning' });
      } else if (search.includes('status=archived')) {
        items.push({ name: 'Archived', path: '/projects?status=archived' });
      } else {
        items.push({ name: 'All Projects', path: '/projects' });
      }
    } else if (path === '/meetings') {
      items.push({ name: 'Meetings', path: '/meetings' });
    } else if (path === '/tasks') {
      items.push({ name: 'Tasks', path: '/tasks' });
    } else if (path === '/settings') {
      items.push({ name: 'Settings', path: '/settings' });
    }

    return items;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar
        onOpenInviteModal={() => setInviteModalOpen(true)}
      />

      <SidebarInset>
        {/* Top App Header with Trigger, Vertical Separator, Breadcrumbs & Project Switcher */}
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-border/80 bg-card/85 dark:bg-card/75 backdrop-blur-xl px-4 transition-[width,height] ease-linear">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 size-8 rounded-md text-foreground/70 hover:text-emerald-600 dark:hover:text-emerald-400 bg-transparent hover:bg-transparent border-none shadow-none transition-colors" />
            <Separator orientation="vertical" className="h-4 bg-border" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, idx) => {
                  const isLast = idx === breadcrumbs.length - 1;
                  return (
                    <React.Fragment key={crumb.path + idx}>
                      {idx > 0 && <BreadcrumbSeparator />}
                      <BreadcrumbItem className={idx === 0 ? 'hidden md:inline-flex' : ''}>
                        {isLast ? (
                          <BreadcrumbPage className="font-semibold text-foreground">{crumb.name}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={crumb.path} className="text-muted-foreground hover:text-foreground">{crumb.name}</BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Right: Active Project Switcher Dropdown */}
          <div className="relative shrink-0">
            {projects.length === 0 ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-muted-foreground font-medium select-none">
                <FolderGit2 size={14} className="text-muted-foreground" />
                <span>No active project</span>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
                  className="flex w-[200px] items-center justify-between gap-2 rounded-md hover:bg-secondary/70 px-2.5 py-1.5 text-xs text-foreground transition-all cursor-pointer border border-border/60 hover:border-emerald-500/40 shadow-xs"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                      {getProjectCode(selectedProject).substring(0, 3)}
                    </div>
                    <span className="hidden sm:inline font-semibold text-foreground truncate">
                      {getProjectName(selectedProject)}
                    </span>
                    <span className="sm:hidden font-semibold text-foreground truncate">
                      {getProjectCode(selectedProject)}
                    </span>
                  </div>
                  <ChevronDown size={14} className="text-muted-foreground shrink-0" />
                </button>

                {projectDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-64 z-50 rounded-md border border-border bg-card/95 backdrop-blur-xl shadow-2xl p-1.5 space-y-1 animate-in fade-in-0 zoom-in-95">
                    <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border mb-1">
                      Switch Project
                    </div>
                    {projects.map((proj) => {
                      const pId = getProjectId(proj);
                      const pName = getProjectName(proj);
                      const pCode = getProjectCode(proj);
                      const isSelected = selectedProject && getProjectId(selectedProject) === pId;

                      return (
                        <button
                          key={pId || pName}
                          onClick={() => handleSelectProject(proj)}
                          className={`w-full flex items-center justify-between rounded-md px-2.5 py-2 text-xs text-left transition-colors cursor-pointer border-l-2 ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold'
                              : 'border-transparent text-foreground hover:bg-secondary/70 hover:border-border'
                          }`}
                        >
                          <div className="truncate">
                            <div className="font-medium truncate">{pName}</div>
                            <div className="text-[10px] text-muted-foreground font-mono">
                              {pCode} • {getProjectStatus(proj)}
                            </div>
                          </div>
                          {isSelected && (
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </header>

        {/* Main View Area */}
        <main className="relative flex-1 w-full bg-background text-foreground overflow-hidden">
          <div className="relative z-10">{children}</div>
        </main>
      </SidebarInset>

      {/* Invite Code Modal */}
      <InviteCodeModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        inviteCode={org.inviteCode}
        onGenerateNewCode={handleGenerateNewCode}
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handleProjectCreated}
      />
    </SidebarProvider>
  );
};
