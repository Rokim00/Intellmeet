import React, { useState } from 'react';
import { CheckSquare, Plus, Clock, AlertCircle, CheckCircle2, User, Filter, X } from 'lucide-react';
import { useProject } from '@/context/ProjectContext';
import { getProjectName, getProjectCode } from '@/types/project.types';
import { EmptyState } from '@/components/ui/EmptyState';

interface TaskItem {
  id: string;
  title: string;
  projectName: string;
  status: 'To Do' | 'In Progress' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  assignee: string;
  createdAt: string;
}

export const Tasks: React.FC = () => {
  const { selectedProject, projects } = useProject();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [filterActiveProjectOnly, setFilterActiveProjectOnly] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [newStatus, setNewStatus] = useState<'To Do' | 'In Progress' | 'Done'>('To Do');
  const [newAssignee, setNewAssignee] = useState('arlo');

  const activeProjectName = getProjectName(selectedProject);
  const activeProjectCode = getProjectCode(selectedProject);

  const displayedTasks = filterActiveProjectOnly && selectedProject
    ? tasks.filter((t) => t.projectName === activeProjectName)
    : tasks;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: TaskItem = {
      id: `TASK-${Date.now().toString().slice(-4)}`,
      title: newTitle.trim(),
      projectName: activeProjectName,
      status: newStatus,
      priority: newPriority,
      assignee: newAssignee,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTitle('');
    setCreateModalOpen(false);
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'High':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Medium':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Done':
        return <CheckCircle2 size={14} className="text-emerald-400" />;
      case 'In Progress':
        return <Clock size={14} className="text-amber-400" />;
      default:
        return <AlertCircle size={14} className="text-zinc-500" />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0c0c0e] text-white p-6 lg:p-8 space-y-6 font-['Plus_Jakarta_Sans']">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <CheckSquare className="text-emerald-400" size={24} />
          <span>Tasks</span>
        </h1>
      </div>

      {/* Content Area */}
      {tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks created yet"
          description={
            selectedProject
              ? `There are no active sprint tasks for '${activeProjectName}'. Click below to create your first task.`
              : 'There are no active tasks created in your workspace yet. Click below to add a new task ticket.'
          }
          actionLabel="Create First Task"
          onAction={() => setCreateModalOpen(true)}
          accentColor="emerald"
        />
      ) : (
        <div className="rounded-lg border border-zinc-800/80 bg-[#121214] overflow-hidden shadow-xl">
          <div className="p-4 border-b border-zinc-800/80 font-bold text-xs uppercase tracking-wider text-zinc-400 flex items-center justify-between">
            <span>Sprint Backlog & Deliverables</span>
            <span className="text-emerald-400 font-mono text-[11px]">{displayedTasks.length} Tickets</span>
          </div>

          <div className="divide-y divide-zinc-800/60">
            {displayedTasks.map((t) => (
              <div
                key={t.id}
                className="p-4 hover:bg-zinc-800/30 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-zinc-500">{t.id}</span>
                    <span className="text-[11px] font-mono font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-sm border border-purple-500/20">
                      {t.projectName}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white">{t.title}</h3>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-medium border ${getPriorityStyle(
                      t.priority
                    )}`}
                  >
                    {t.priority}
                  </span>

                  <span className="flex items-center gap-1.5 text-xs text-zinc-300 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-sm">
                    {getStatusIcon(t.status)}
                    <span>{t.status}</span>
                  </span>

                  <div className="flex items-center gap-1 text-xs text-zinc-400 bg-zinc-900 px-2 py-1 rounded-sm border border-zinc-800">
                    <User size={12} className="text-emerald-400" />
                    <span>{t.assignee}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-[#121214] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <CheckSquare size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">Create New Task</h3>
                  <p className="text-xs text-zinc-400">Add a ticket or deliverable for your team.</p>
                </div>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="rounded-sm p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-400 font-medium block mb-1.5">Task Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Implement WebSocket speech stream"
                  className="h-10 w-full rounded-sm border border-zinc-800 bg-[#161618] px-3 text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500/80 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 font-medium block mb-1.5">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="h-10 w-full rounded-sm border border-zinc-800 bg-[#161618] px-3 text-zinc-300 focus:border-emerald-500/80 transition-colors"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 font-medium block mb-1.5">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="h-10 w-full rounded-sm border border-zinc-800 bg-[#161618] px-3 text-zinc-300 focus:border-emerald-500/80 transition-colors"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-400 font-medium block mb-1.5">Assignee</label>
                <input
                  type="text"
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  placeholder="Team member name"
                  className="h-10 w-full rounded-sm border border-zinc-800 bg-[#161618] px-3 text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500/80 transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-3.5 py-2 rounded-sm text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-sm bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
