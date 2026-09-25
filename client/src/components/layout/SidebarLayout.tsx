import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderGit2,
  Video,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  LogOut,
  Ticket,
  Settings as SettingsIcon,
  Menu,
  Building2,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight as BreadcrumbSeparator,
} from 'lucide-react';
import { IntellMeetLogo } from '@/components/ui/IntellMeetLogo';
import { useAuth } from '@/context/AuthContext';
import { useProject } from '@/context/ProjectContext';
import { maskEmail } from '@/utils/privacy';
import {
  getProjectName,
  getProjectCode,
  getProjectStatus,
  getProjectId,
  type Project,
} from '@/types/project.types';
import { InviteCodeModal } from '@/components/dashboard/InviteCodeModal';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { projects, selectedProject, setSelectedProject } = useProject();
  const location = useLocation();
  const navigate = useNavigate();

  // State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [projectsMenuOpen, setProjectsMenuOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const orgName = 'Acme Corp';
  const maskedUserEmail = maskEmail(user?.userEmail || 'arlo@solution.com');

  const isActive = (path: string) => location.pathname === path;

  const handleSelectProject = (proj: Project) => {
    setSelectedProject(proj);
    setProjectDropdownOpen(false);
  };

  const handleGenerateNewInviteCode = (newCode: string) => {
    setInviteCode(newCode);
  };

  // Generate Breadcrumbs string based on current location
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
    <div className="min-h-screen flex w-full bg-[#0c0c0e] text-white font-['Plus_Jakarta_Sans']">
      {/* Backdrop overlay for mobile */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-xs"
        />
      )}

      {/* Persistent Collapsible Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-zinc-800/80 bg-[#121214] transition-all duration-200 ${
          sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'
        } ${mobileSidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* TOP BRAND MARK HEADER */}
        <div className="h-14 flex items-center justify-between px-3.5 border-b border-zinc-800/80 shrink-0">
          <Link to="/dashboard" className="flex items-center gap-2.5 min-w-0">
            <IntellMeetLogo size={24} color="#ffffff" />
            {!sidebarCollapsed && (
              <span className="text-base font-bold tracking-tight text-white leading-tight">
                IntellMeet
              </span>
            )}
          </Link>
        </div>

        {/* MAIN NAVIGATION MENU */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-4 space-y-1.5">
          {!sidebarCollapsed && (
            <div className="px-2 pb-1 text-[10px] font-semibold uppercase text-zinc-400 tracking-wider">
              Main Navigation
            </div>
          )}

          {/* 1. Dashboard Page Link */}
          <Link
            to="/dashboard"
            onClick={() => setMobileSidebarOpen(false)}
            title="Dashboard"
            className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-xs font-semibold transition-all ${
              isActive('/dashboard')
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shadow-xs'
                : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-white'
            }`}
          >
            <LayoutDashboard size={16} className="shrink-0" />
            {!sidebarCollapsed && <span>Dashboard</span>}
          </Link>

          {/* 2. Projects Dropdown Menu */}
          <div>
            <button
              onClick={() => setProjectsMenuOpen(!projectsMenuOpen)}
              title="Projects"
              className={`w-full flex items-center justify-between rounded-md px-3 py-2.5 text-xs font-semibold transition-all ${
                isActive('/projects') || location.pathname.startsWith('/projects')
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                  : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <FolderGit2 size={16} className="shrink-0" />
                {!sidebarCollapsed && <span>Projects</span>}
              </div>
              {!sidebarCollapsed &&
                (projectsMenuOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
            </button>

            {/* Sub-menu items for Projects */}
            {projectsMenuOpen && !sidebarCollapsed && (
              <div className="ml-4 mt-1 border-l border-zinc-800/80 pl-3 space-y-1">
                <Link
                  to="/projects"
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`block rounded-sm px-2.5 py-1.5 text-xs transition-colors ${
                    isActive('/projects') && !location.search
                      ? 'text-emerald-400 font-semibold bg-emerald-500/10'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  All Projects
                </Link>
                <Link
                  to="/projects?status=active"
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`block rounded-sm px-2.5 py-1.5 text-xs transition-colors ${
                    location.search.toLowerCase().includes('status=active')
                      ? 'text-emerald-400 font-semibold bg-emerald-500/10'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Active
                </Link>
                <Link
                  to="/projects?status=planning"
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`block rounded-sm px-2.5 py-1.5 text-xs transition-colors ${
                    location.search.toLowerCase().includes('status=planning')
                      ? 'text-emerald-400 font-semibold bg-emerald-500/10'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Planning
                </Link>
                <Link
                  to="/projects?status=archived"
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`block rounded-sm px-2.5 py-1.5 text-xs transition-colors ${
                    location.search.toLowerCase().includes('status=archived')
                      ? 'text-emerald-400 font-semibold bg-emerald-500/10'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Archived
                </Link>
              </div>
            )}
          </div>

          {/* 3. Meetings Page Link */}
          <Link
            to="/meetings"
            onClick={() => setMobileSidebarOpen(false)}
            title="Meetings"
            className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-xs font-semibold transition-all ${
              isActive('/meetings')
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shadow-xs'
                : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-white'
            }`}
          >
            <Video size={16} className="shrink-0" />
            {!sidebarCollapsed && <span>Meetings</span>}
          </Link>

          {/* 4. Tasks Page Link */}
          <Link
            to="/tasks"
            onClick={() => setMobileSidebarOpen(false)}
            title="Tasks"
            className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-xs font-semibold transition-all ${
              isActive('/tasks')
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shadow-xs'
                : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-white'
            }`}
          >
            <CheckSquare size={16} className="shrink-0" />
            {!sidebarCollapsed && <span>Tasks</span>}
          </Link>
        </nav>

        {/* BOTTOM FOOTER: Profile Card & Popover Menu */}
        <div className="p-2.5 border-t border-zinc-800/80 relative bg-[#0e0e10] shrink-0">
          {/* User Account Popover Dropdown Menu */}
          {userMenuOpen && (
            <div
              className={`absolute bottom-full mb-2 rounded-md border border-zinc-800 bg-[#161618] p-1.5 shadow-2xl space-y-1 z-50 ${
                sidebarCollapsed ? 'left-2 w-56' : 'left-2.5 right-2.5'
              }`}
            >
              <div className="px-2 py-1.5 border-b border-zinc-800/80">
                <div className="text-xs font-bold text-white">{user?.userName || 'arlo'}</div>
                <div className="text-[10px] text-zinc-400 font-mono">{maskedUserEmail}</div>
              </div>

              {/* 1. Settings */}
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate('/settings');
                }}
                className="w-full flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-emerald-400 transition-colors cursor-pointer"
              >
                <SettingsIcon size={14} />
                <span>Settings</span>
              </button>

              {/* 2. Invitation Code */}
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  setInviteModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-emerald-400 transition-colors cursor-pointer"
              >
                <Ticket size={14} />
                <span>Invitation Code</span>
              </button>

              {/* 3. Logout */}
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>
          )}

          {/* Profile Card Button */}
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            title={`${user?.userName || 'arlo'} (${orgName})`}
            className={`w-full flex items-center rounded-md hover:bg-zinc-800/50 transition-colors cursor-pointer text-left ${
              sidebarCollapsed ? 'justify-center p-1.5' : 'justify-between p-2'
            }`}
          >
            <div className={`flex items-center min-w-0 ${sidebarCollapsed ? 'justify-center' : 'gap-2'}`}>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30">
                {(user?.userName || 'A').charAt(0).toUpperCase()}
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-white truncate">
                    {user?.userName || 'arlo'}
                  </div>
                  <div className="text-[10px] text-zinc-400 flex items-center gap-1 truncate font-medium">
                    <Building2 size={10} className="text-zinc-500 shrink-0" />
                    <span className="truncate">{orgName}</span>
                  </div>
                </div>
              )}
            </div>
            {!sidebarCollapsed && <ChevronDown size={14} className="text-zinc-400 shrink-0 ml-1" />}
          </button>
        </div>
      </aside>

      {/* Invite Code Dialog Modal */}
      <InviteCodeModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        inviteCode={inviteCode}
        onGenerateNewCode={handleGenerateNewInviteCode}
      />

      {/* Main Container Area with Top Header Bar */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
          sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
        }`}
      >
        {/* TOP NAVIGATION HEADER: Sidebar Toggle Button, Breadcrumbs, & Project Switcher Dropdown */}
        <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-zinc-800/80 bg-[#0c0c0e]/90 backdrop-blur-md px-4 sm:px-6">
          {/* Left: Sidebar Collapse/Expand Toggle + Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Desktop & Laptop Sidebar Toggle Button */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              className="hidden lg:flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all cursor-pointer"
            >
              {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>

            {/* Mobile Sidebar Toggle Button */}
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800/50"
            >
              <Menu size={18} />
            </button>

            {/* Vertical Separator */}
            <div className="h-4 w-px bg-zinc-800 shrink-0" />

            {/* Breadcrumb Navigation Trail */}
            <nav className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium truncate">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.path + idx}>
                  {idx > 0 && <BreadcrumbSeparator size={12} className="text-zinc-600 shrink-0" />}
                  {idx === breadcrumbs.length - 1 ? (
                    <span className="font-semibold text-white truncate">{crumb.name}</span>
                  ) : (
                    <Link
                      to={crumb.path}
                      className="hover:text-zinc-200 transition-colors truncate"
                    >
                      {crumb.name}
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Right: Active Project Switcher Dropdown in Top Navigation Bar */}
          <div className="relative shrink-0">
            {projects.length === 0 ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-zinc-500 font-medium select-none">
                <FolderGit2 size={14} className="text-zinc-600" />
                <span>No active project</span>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
                  className="flex items-center gap-2 rounded-md hover:bg-zinc-800/50 px-2.5 py-1 text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-xs bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    {getProjectCode(selectedProject).substring(0, 3)}
                  </div>
                  <span className="hidden sm:inline font-semibold text-white max-w-[160px] truncate">
                    {getProjectName(selectedProject)}
                  </span>
                  <span className="sm:hidden font-semibold text-white">
                    {getProjectCode(selectedProject)}
                  </span>
                  <ChevronDown size={14} className="text-zinc-400 shrink-0" />
                </button>

                {projectDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-64 z-50 rounded-md border border-zinc-800 bg-[#161618] shadow-2xl p-1.5 space-y-1">
                    <div className="px-2 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-800/80 mb-1">
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
                          className={`w-full flex items-center justify-between rounded-sm px-2.5 py-2 text-xs text-left transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/20'
                              : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                          }`}
                        >
                          <div className="truncate">
                            <div className="font-medium truncate">{pName}</div>
                            <div className="text-[10px] text-zinc-400 font-mono">
                              {pCode} • {getProjectStatus(proj)}
                            </div>
                          </div>
                          {isSelected && (
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
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

        {/* Page Content View Area */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};
