import type { BadgeTone } from '@/components/ui/badge-variants';

/**
 * Maps a domain status string to a badge tone. Keeps status→color mapping in
 * one place so a page never re-declares a switch statement for it.
 */
const projectStatusTones: Record<string, BadgeTone> = {
  active: 'success',
  planning: 'warning',
  completed: 'accent',
  archived: 'neutral',
};

export const getProjectStatusTone = (status: string): BadgeTone =>
  projectStatusTones[status.toLowerCase()] ?? 'neutral';

const taskPriorityTones: Record<string, BadgeTone> = {
  urgent: 'danger',
  high: 'warning',
  medium: 'info',
  low: 'neutral',
};

export const getTaskPriorityTone = (priority: string): BadgeTone =>
  taskPriorityTones[priority.toLowerCase()] ?? 'neutral';

const taskStatusTones: Record<string, BadgeTone> = {
  done: 'success',
  'in progress': 'warning',
  'to do': 'neutral',
};

export const getTaskStatusTone = (status: string): BadgeTone =>
  taskStatusTones[status.toLowerCase()] ?? 'neutral';

const meetingStatusTones: Record<string, BadgeTone> = {
  live: 'success',
  scheduled: 'info',
  completed: 'neutral',
};

export const getMeetingStatusTone = (status: string): BadgeTone =>
  meetingStatusTones[status.toLowerCase()] ?? 'neutral';