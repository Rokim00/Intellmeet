import React, { useState } from 'react';
import { Video, Calendar, Clock, Users, Play, ChevronDown, X } from 'lucide-react';
import { useProject } from '@/context/ProjectContext';
import { getProjectName } from '@/types/project.types';
import { EmptyState } from '@/components/ui/EmptyState';

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
  const [timeFilter, setTimeFilter] = useState<'all' | '1h' | '24h' | '7d' | '30d'>('24h');

  // New meeting form state
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('30 mins');
  const [time] = useState('Today, 04:00 PM');

  const activeProjectName = getProjectName(selectedProject);

  const displayedMeetings = meetings;

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newMeeting: MeetingItem = {
      id: `MEET-${Date.now().toString().slice(-4)}`,
      title: title.trim(),
      projectName: activeProjectName,
      time: time.trim() || 'Today, 04:00 PM',
      duration,
      participants: 1,
      status: 'Live Now',
      host: 'arlo',
    };

    setMeetings((prev) => [newMeeting, ...prev]);
    setTitle('');
    setCreateModalOpen(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#0c0c0e] text-white p-6 lg:p-8 space-y-6 font-['Plus_Jakarta_Sans']">
      {/* Header Row: Professional Heading & Time Filter in Same Row */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Video className="text-emerald-400" size={24} />
          <span>Meetings</span>
        </h1>

        {/* Time Filter Dropdown on Right Side of the Same Row */}
        <div className="relative">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as 'all' | '1h' | '24h' | '7d' | '30d')}
            className="appearance-none bg-[#121214] border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 text-xs font-medium rounded-sm pl-3 pr-8 py-2 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
          >
            <option value="1h">Last 1 Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
          />
        </div>
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
              className={`rounded-lg border p-5 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                m.projectName === activeProjectName
                  ? 'border-emerald-500/40 bg-[#141816]'
                  : 'border-zinc-800/80 bg-[#121214] hover:border-zinc-700'
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-sm border border-emerald-500/20">
                    {m.projectName}
                  </span>
                  <span className="text-[11px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-sm">
                    {m.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{m.title}</h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} className="text-zinc-500" />
                    {m.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} className="text-zinc-500" />
                    {m.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={13} className="text-zinc-500" />
                    {m.participants} Members
                  </span>
                </div>
              </div>

              <button className="flex items-center gap-2 rounded-sm bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 px-4 py-2 text-xs font-semibold transition-colors cursor-pointer self-stretch sm:self-auto justify-center">
                <Play size={14} fill="currentColor" />
                <span>Join Room</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create Meeting Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-[#121214] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Video size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">Start Instant Meeting</h3>
                  <p className="text-xs text-zinc-400">Launch a live video room for your team.</p>
                </div>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="rounded-sm p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-400 font-medium block mb-1.5">Meeting Subject *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Architecture Sync, Sprint Planning"
                  className="h-10 w-full rounded-sm border border-zinc-800 bg-[#161618] px-3 text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500/80 transition-colors"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-medium block mb-1.5">Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="h-10 w-full rounded-sm border border-zinc-800 bg-[#161618] px-3 text-zinc-300 focus:border-emerald-500/80 transition-colors"
                >
                  <option value="15 mins">15 mins</option>
                  <option value="30 mins">30 mins</option>
                  <option value="45 mins">45 mins</option>
                  <option value="60 mins">60 mins</option>
                </select>
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
                  Start Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
