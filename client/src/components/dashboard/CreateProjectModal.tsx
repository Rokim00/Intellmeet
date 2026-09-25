import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { createProject } from '@/api/project/project.api';
import type { Project } from '@/types/project.types';
import { parseApiError } from '@/utils/apiError';
import { Modal, ModalFooterCancel } from '@/components/ui/modal';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'planning', label: 'Planning' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

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

  const handleClose = () => {
    if (loading) return;
    setName('');
    setDescription('');
    setStatus('active');
    setError('');
    onClose();
  };

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
        handleClose();
      }
    } catch (err) {
      const { message } = parseApiError(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title="Create New Project"
      description="Add a workspace project for team sprints and meetings."
      footer={
        <>
          <ModalFooterCancel onClick={handleClose} disabled={loading} />
          <Button type="submit" form="create-project-form" disabled={loading}>
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? 'Creating…' : 'Create Project'}
          </Button>
        </>
      }
    >
      <form id="create-project-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive"
          >
            {error}
          </div>
        )}

        <FormField label="Project Name" htmlFor="project-name" required>
          <Input
            id="project-name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mobile App v2, AI Summarizer"
            required
          />
        </FormField>

        <FormField label="Description" htmlFor="project-description">
          <Input
            id="project-description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief summary of scope, objectives, or deliverables…"
          />
        </FormField>

        <FormField label="Initial Status" htmlFor="project-status">
          <Select
            id="project-status"
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={STATUS_OPTIONS}
          />
        </FormField>
      </form>
    </Modal>
  );
};
