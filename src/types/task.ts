export type Role = 'nurse' | 'dietician' | 'social_worker';

export type TaskStatus = 'overdue' | 'today' | 'upcoming' | 'completed';

export interface Task {
  id: string;
  patientId: string;
  title: string;
  role: Role;
  dueDate: string; // YYYY-MM-DD
  completed: boolean;
  status: TaskStatus; // derived at runtime, never stored on server
}

export interface CreateTaskPayload {
  title: string;
  role: Role;
  dueDate: string;
}

export interface UpdateTaskPayload {
  completed?: boolean;
  dueDate?: string;
  role?: Role;
}

export interface FilterState {
  role: Role | 'all';
  time: TaskStatus | 'all';
}
