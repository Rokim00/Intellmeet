import React, { useState } from 'react';
import { X, FolderPlus, Loader2 } from 'lucide-react';
import { createProject } from '@/api/project/project.api';
import type { Project } from '@/types/project.types';
import { parseApiError } from '@/utils/apiError';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (project: Project) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await createProject({
        name: name.trim(),
        description: description.trim(),
        status,
      });

      if (res.data?.data) {
        onCreated(res.data.data);
        onClose();
        setName('');
        setDescription('');
      }
    } catch (err) {
      const { message } = parseApiError(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-[#121214] p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <FolderPlus size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">Create New Project</h3>
              <p className="text-xs text-zinc-400">Add a workspace project for team sprints and meetings.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-sm p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="p-2.5 rounded-sm bg-red-950/40 border border-red-800 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-zinc-400 font-medium block mb-1.5">
              Project Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mobile App v2, AI Summarizer"
              className="h-10 w-full rounded-sm border border-zinc-800 bg-[#161616] px-3 text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500/80 transition-colors"
            />
          </div>

          <div>
            <label className="text-zinc-400 font-medium block mb-1.5">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of project scope, objectives, or key deliverables..."
              className="w-full rounded-sm border border-zinc-800 bg-[#161616] p-3 text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500/80 transition-colors"
            />
          </div>

          <div>
            <label className="text-zinc-400 font-medium block mb-1.5">Initial Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-10 w-full rounded-sm border border-zinc-800 bg-[#161616] px-3 text-zinc-300 focus:border-emerald-500/80 transition-colors"
            >
              <option value="active">Active</option>
              <option value="planning">Planning</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-sm text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 rounded-sm bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Creating…
                </>
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
