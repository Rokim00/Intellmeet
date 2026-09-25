import React, { useState } from 'react';
import { Video, Calendar, Clock, Users, Play } from 'lucide-react';
import { useProject } from '@/context/ProjectContext';
import { getProjectName } from '@/types/project.types';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal, ModalFooterCancel } from '@/components/ui/modal';
import { FormField } from '@/components/ui/form-field';
import { getMeetingStatusTone } from '@/lib/status-tone';

type TimeFilter = 'all' | '1h' | '24h' | '7d' | '30d';

const TIME_FILTER_OPTIONS = [
  { value: '1h', label: 'Last 1 Hour' },
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: 'all', label: 'All Time' },
];

const DURATION_OPTIONS = [
  { value: '15 mins', label: '15 mins' },
  { value: '30 mins', label: '30 mins' },
  { value: '45 mins', label: '45 mins' },
  { value: '60 mins', label: '60 mins' },
];

interface MeetingItem {
  id: string;
  title: string;
  projectName: string;
  time: string;
  duration: string;
  participants: number;
  status: 'Live Now' | 'Scheduled' | 'Completed';
  host: string;
}

export const Meetings: React.FC = () => {
  const { selectedProject } = useProject();
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('24h');

  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('30 mins');

  const activeProjectName = getProjectName(selectedProject);

  const displayedMeetings = meetings;

  const handleCloseModal = () => {
    setTitle('');
    setDuration('30 mins');
    setCreateModalOpen(false);
  };

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newMeeting: MeetingItem = {
      id: `MEET-${Date.now().toString().slice(-4)}`,
      title: title.trim(),
      projectName: activeProjectName,
      time: 'Today, 04:00 PM',
      duration,
      participants: 1,
      status: 'Live Now',
      host: 'arlo',
    };

    setMeetings((prev) => [newMeeting, ...prev]);
    handleCloseModal();
  };

  return (
    <div className="w-full bg-background text-foreground p-6 lg:p-8 space-y-6">
      {/* Header Row: Heading & Time Filter */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          <Video size={24} className="text-emerald-500 dark:text-emerald-400" />
          <span>Meetings</span>
        </h1>

        <Select
          aria-label="Filter meetings by time"
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
          options={TIME_FILTER_OPTIONS}
          wrapperClassName="w-auto"
          className="w-auto pl-3 pr-8 text-xs font-medium"
        />
      </div>

      {/* Content Area */}
      {displayedMeetings.length === 0 ? (
        <EmptyState
          icon={Video}
          title="No meetings scheduled yet"
          description={
            selectedProject
              ? `There are no video conferencing rooms scheduled for '${activeProjectName}'. Click below to launch an instant meeting.`
              : 'There are no active or scheduled meetings in your workspace yet. Click below to start an instant video room.'
          }
          actionLabel="Start Instant Meeting"
          onAction={() => setCreateModalOpen(true)}
          accentColor="emerald"
        />
      ) : (
        <div className="space-y-3">
          {displayedMeetings.map((m) => (
            <div
              key={m.id}
              className={`rounded-md border p-5 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs ${
                m.projectName === activeProjectName
                  ? 'border-emerald-500/40 bg-emerald-500/5'
                  : 'border-border bg-card hover:border-emerald-500/30'
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <Badge tone="success">{m.projectName}</Badge>
                  <Badge tone={getMeetingStatusTone(m.status)}>{m.status}</Badge>
                </div>

                <h3 className="text-base font-bold text-foreground">{m.title}</h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} className="text-muted-foreground" />
                    {m.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} className="text-muted-foreground" />
                    {m.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={13} className="text-muted-foreground" />
                    {m.participants} Members
                  </span>
                </div>
              </div>

              <Button className="self-stretch justify-center sm:self-auto">
                <Play size={14} fill="currentColor" />
                <span>Join Room</span>
              </Button>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={createModalOpen}
        onClose={handleCloseModal}
        title="Start Instant Meeting"
        description="Launch a live video room for your team."
        footer={
          <>
            <ModalFooterCancel onClick={handleCloseModal} />
            <Button type="submit" form="create-meeting-form">
              Start Meeting
            </Button>
          </>
        }
      >
        <form id="create-meeting-form" onSubmit={handleCreateMeeting} className="space-y-4">
          <FormField label="Meeting Subject" htmlFor="meeting-subject" required>
            <Input
              id="meeting-subject"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Architecture Sync, Sprint Planning"
              required
            />
          </FormField>

          <FormField label="Duration" htmlFor="meeting-duration">
            <Select
              id="meeting-duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              options={DURATION_OPTIONS}
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
};
