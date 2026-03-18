import type { TaskStatus } from '../types/task';

function toMidnight(isoDate: string): Date {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function getTodayMidnight(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function deriveStatus(dueDate: string, completed: boolean): TaskStatus {
  if (completed) return 'completed';
  const diff = Math.round(
    (toMidnight(dueDate).getTime() - getTodayMidnight().getTime()) / 86400000,
  );
  if (diff < 0) return 'overdue';
  if (diff === 0) return 'today';
  return 'upcoming';
}

export function formatDueDate(dueDate: string, completed: boolean): string {
  if (completed) return 'Done';
  const diff = Math.round(
    (toMidnight(dueDate).getTime() - getTodayMidnight().getTime()) / 86400000,
  );
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return toMidnight(dueDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}
