import React, { useState } from 'react';
import { CheckSquare, Clock, AlertCircle, CheckCircle2, User, X, ChevronDown } from 'lucide-react';
import { useProject } from '@/context/ProjectContext';
import { getProjectName } from '@/types/project.types';
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
  const { selectedProject } = useProject();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [newStatus, setNewStatus] = useState<'To Do' | 'In Progress' | 'Done'>('To Do');
  const [newAssignee, setNewAssignee] = useState('arlo');

  const activeProjectName = getProjectName(selectedProject);

  const displayedTasks = tasks;

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
    <div className="w-full bg-background text-foreground p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          <CheckSquare className="text-emerald-500 dark:text-emerald-400" size={24} />
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
        <div className="rounded-md border border-border bg-card text-card-foreground overflow-hidden shadow-xs">
          <div className="p-4 border-b border-border font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span>Sprint Backlog & Deliverables</span>
            <span className="text-emerald-500 dark:text-emerald-400 font-mono text-[11px]">{displayedTasks.length} Tickets</span>
          </div>

          <div className="divide-y divide-border">
            {displayedTasks.map((t) => (
              <div
                key={t.id}
                className="p-4 hover:bg-secondary/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-muted-foreground">{t.id}</span>
                    <span className="text-[11px] font-mono font-semibold text-purple-700 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-sm border border-purple-500/20">
                      {t.projectName}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{t.title}</h3>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-medium border ${getPriorityStyle(
                      t.priority
                    )}`}
                  >
                    {t.priority}
                  </span>

                  <span className="flex items-center gap-1.5 text-xs text-foreground bg-secondary/80 border border-border px-2.5 py-1 rounded-sm">
                    {getStatusIcon(t.status)}
                    <span>{t.status}</span>
                  </span>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary/80 px-2 py-1 rounded-sm border border-border">
                    <User size={12} className="text-emerald-600 dark:text-emerald-400" />
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
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setCreateModalOpen(false)}
        >
          <div 
            className="w-full max-w-md rounded-md border border-border bg-card p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckSquare size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground leading-tight">Create New Task</h3>
                  <p className="text-xs text-muted-foreground">Add a ticket or deliverable for your team.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="text-muted-foreground font-medium block mb-1.5">Task Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Implement WebSocket speech stream"
                  className="h-10 w-full rounded-md border border-border bg-card px-3 text-foreground placeholder:text-muted-foreground focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all shadow-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground font-medium block mb-1.5">Priority</label>
                  <div className="relative">
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as TaskItem['priority'])}
                      className="appearance-none h-10 w-full rounded-md border border-border bg-card px-3 pr-10 text-foreground focus:border-emerald-500 transition-all cursor-pointer shadow-xs"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                    <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center px-2 pointer-events-none border-l border-emerald-500/30">
                      <ChevronDown size={14} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-muted-foreground font-medium block mb-1.5">Status</label>
                  <div className="relative">
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as TaskItem['status'])}
                      className="appearance-none h-10 w-full rounded-md border border-border bg-card px-3 pr-10 text-foreground focus:border-emerald-500 transition-all cursor-pointer shadow-xs"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                    <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center px-2 pointer-events-none border-l border-emerald-500/30">
                      <ChevronDown size={14} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-muted-foreground font-medium block mb-1.5">Assignee</label>
                <input
                  type="text"
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  placeholder="Team member name"
                  className="h-10 w-full rounded-md border border-border bg-card px-3 text-foreground placeholder:text-muted-foreground focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all shadow-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-3.5 py-2 rounded-md text-xs font-medium bg-secondary text-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
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
