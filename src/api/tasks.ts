import type { Task, CreateTaskPayload, UpdateTaskPayload } from '../types/task';
import { MOCK_TASKS } from './mockData';
import { deriveStatus } from '../hooks/useTaskStatus';

const BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';
const USE_MOCK = true;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

let store: Task[] = [...MOCK_TASKS];

export async function fetchTasksForPatient(patientId: string): Promise<Task[]> {
  if (USE_MOCK) {
    await delay(250);
    return store.filter((t) => t.patientId === patientId);
  }
  const res = await fetch(`${BASE}/patients/${patientId}/tasks`);
  if (!res.ok) throw new Error(`Failed to fetch tasks (${res.status})`);
  const data: unknown = await res.json();
  if (!Array.isArray(data)) return [];
  return (data as Task[]).map((task) => ({
    ...task,
    completed: task.completed ?? false,
    status: deriveStatus(task.dueDate, task.completed ?? false),
  }));
}

export async function createTask(patientId: string, payload: CreateTaskPayload): Promise<Task> {
  if (USE_MOCK) {
    await delay(400);
    const newTask: Task = {
      id: `t_${Date.now()}`,
      patientId,
      ...payload,
      completed: false,
      status: deriveStatus(payload.dueDate, false),
    };
    store = [...store, newTask];
    return newTask;
  }
  const res = await fetch(`${BASE}/patients/${patientId}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create task (${res.status})`);
  const created = (await res.json()) as Task;
  return { ...created, status: deriveStatus(created.dueDate, created.completed ?? false) };
}

export async function updateTask(taskId: string, payload: UpdateTaskPayload): Promise<Task> {
  if (USE_MOCK) {
    await delay(350);
    const existing = store.find((t) => t.id === taskId);
    if (!existing) throw new Error(`Task ${taskId} not found`);
    const updated: Task = {
      ...existing,
      ...payload,
      status: deriveStatus(
        payload.dueDate ?? existing.dueDate,
        payload.completed ?? existing.completed,
      ),
    };
    store = store.map((t) => (t.id === taskId ? updated : t));
    return updated;
  }
  const res = await fetch(`${BASE}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update task (${res.status})`);
  const updated = (await res.json()) as Task;
  return { ...updated, status: deriveStatus(updated.dueDate, updated.completed ?? false) };
}
