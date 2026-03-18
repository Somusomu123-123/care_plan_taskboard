import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { deriveStatus, formatDueDate, getTodayMidnight } from './useTaskStatus';

// Pin today to March 18 2026 so tests don't depend on the current date
const FIXED_TODAY = new Date(2026, 2, 18);

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_TODAY);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('deriveStatus', () => {
  it('returns completed when task is marked done regardless of date', () => {
    expect(deriveStatus('2026-03-10', true)).toBe('completed');
    expect(deriveStatus('2026-03-25', true)).toBe('completed');
  });

  it('returns overdue when due date is before today', () => {
    expect(deriveStatus('2026-03-17', false)).toBe('overdue');
    expect(deriveStatus('2026-01-01', false)).toBe('overdue');
  });

  it('returns today when due date matches today exactly', () => {
    expect(deriveStatus('2026-03-18', false)).toBe('today');
  });

  it('returns upcoming when due date is after today', () => {
    expect(deriveStatus('2026-03-19', false)).toBe('upcoming');
    expect(deriveStatus('2026-04-01', false)).toBe('upcoming');
  });
});

describe('formatDueDate', () => {
  it('returns Done for completed tasks', () => {
    expect(formatDueDate('2026-03-10', true)).toBe('Done');
  });

  it('shows days overdue with correct count', () => {
    expect(formatDueDate('2026-03-16', false)).toBe('2d overdue');
    expect(formatDueDate('2026-03-10', false)).toBe('8d overdue');
  });

  it('returns Today when due date is today', () => {
    expect(formatDueDate('2026-03-18', false)).toBe('Today');
  });

  it('returns Tomorrow when due date is one day ahead', () => {
    expect(formatDueDate('2026-03-19', false)).toBe('Tomorrow');
  });

  it('returns a formatted date string for dates further away', () => {
    const result = formatDueDate('2026-03-25', false);
    expect(result).toContain('25');
    expect(result).toContain('Mar');
  });
});

describe('getTodayMidnight', () => {
  it('returns a date with no time component', () => {
    const today = getTodayMidnight();
    expect(today.getHours()).toBe(0);
    expect(today.getMinutes()).toBe(0);
    expect(today.getSeconds()).toBe(0);
    expect(today.getMilliseconds()).toBe(0);
  });
});
