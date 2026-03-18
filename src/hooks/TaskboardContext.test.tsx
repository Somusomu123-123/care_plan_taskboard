import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { TaskboardProvider, useTaskboard } from './TaskboardContext';
import * as patientsApi from '../api/patients';
import * as tasksApi from '../api/tasks';
import { MOCK_PATIENTS } from '../api/mockData';

// stub both API modules
vi.mock('../api/patients');
vi.mock('../api/tasks');

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(TaskboardProvider, null, children);

beforeEach(() => {
  vi.mocked(patientsApi.fetchPatients).mockResolvedValue([MOCK_PATIENTS[0]]);
  vi.mocked(tasksApi.fetchTasksForPatient).mockResolvedValue([]);
  vi.mocked(tasksApi.createTask).mockResolvedValue({
    id: 'server-t1',
    patientId: 'p1',
    title: 'Test task',
    role: 'nurse',
    dueDate: '2026-03-25',
    completed: false,
    status: 'upcoming',
  });
  vi.mocked(tasksApi.updateTask).mockResolvedValue({
    id: 't1',
    patientId: 'p1',
    title: 'Existing task',
    role: 'nurse',
    dueDate: '2026-03-25',
    completed: true,
    status: 'completed',
  });
});

afterEach(() => vi.clearAllMocks());

// helper to wait for initial load to settle
async function waitForLoad() {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 50));
  });
}

describe('optimistic create — success', () => {
  it('replaces the temp id with the confirmed server id after API resolves', async () => {
    const { result } = renderHook(() => useTaskboard(), { wrapper });
    await waitForLoad();

    await act(async () => {
      await result.current.addTask('p1', {
        title: 'Test task',
        role: 'nurse',
        dueDate: '2026-03-25',
      });
    });

    const ids = result.current.tasks.map((t) => t.id);
    expect(ids).toContain('server-t1');
    expect(ids.some((id) => id.startsWith('temp_'))).toBe(false);
  });
});

describe('optimistic create — server error rollback', () => {
  it('removes the task when the API call fails', async () => {
    vi.mocked(tasksApi.createTask).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useTaskboard(), { wrapper });
    await waitForLoad();

    const countBefore = result.current.tasks.length;

    await act(async () => {
      await result.current.addTask('p1', {
        title: 'Should be rolled back',
        role: 'nurse',
        dueDate: '2026-03-25',
      });
    });

    // task count should be back to what it was before the failed add
    expect(result.current.tasks.length).toBe(countBefore);
  });

  it('shows an error toast when rollback happens', async () => {
    vi.mocked(tasksApi.createTask).mockRejectedValueOnce(new Error('500'));

    const { result } = renderHook(() => useTaskboard(), { wrapper });
    await waitForLoad();

    await act(async () => {
      await result.current.addTask('p1', {
        title: 'Will fail',
        role: 'nurse',
        dueDate: '2026-03-25',
      });
    });

    expect(result.current.toast?.type).toBe('error');
    expect(result.current.toast?.message).toMatch(/Could not create task/);
  });
});

describe('optimistic complete — server error rollback', () => {
  it('restores the task to its previous state when PATCH fails', async () => {
    vi.mocked(tasksApi.fetchTasksForPatient).mockResolvedValue([{
      id: 't1',
      patientId: 'p1',
      title: 'Existing task',
      role: 'nurse',
      dueDate: '2026-03-25',
      completed: false,
      status: 'upcoming',
    }]);
    vi.mocked(tasksApi.updateTask).mockRejectedValueOnce(new Error('Server error'));

    const { result } = renderHook(() => useTaskboard(), { wrapper });
    await waitForLoad();

    // confirm task starts as not completed
    expect(result.current.tasks.find((t) => t.id === 't1')?.completed).toBe(false);

    await act(async () => {
      await result.current.completeTask('t1');
    });

    // after rollback it should be not completed again
    expect(result.current.tasks.find((t) => t.id === 't1')?.completed).toBe(false);
    expect(result.current.toast?.type).toBe('error');
  });
});

describe('filters', () => {
  it('updates role filter correctly', async () => {
    const { result } = renderHook(() => useTaskboard(), { wrapper });
    await waitForLoad();

    act(() => { result.current.setFilters({ role: 'nurse' }); });
    expect(result.current.filters.role).toBe('nurse');

    act(() => { result.current.setFilters({ role: 'all' }); });
    expect(result.current.filters.role).toBe('all');
  });

  it('updates time filter correctly', async () => {
    const { result } = renderHook(() => useTaskboard(), { wrapper });
    await waitForLoad();

    act(() => { result.current.setFilters({ time: 'overdue' }); });
    expect(result.current.filters.time).toBe('overdue');
  });
});
