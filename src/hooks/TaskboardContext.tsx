import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from 'react';
import { fetchPatients } from '../api/patients';
import { fetchTasksForPatient, createTask, updateTask } from '../api/tasks';
import type { Patient } from '../types/patient';
import type { Task, FilterState, CreateTaskPayload, UpdateTaskPayload } from '../types/task';
import { deriveStatus } from './useTaskStatus';

// ── State ──────────────────────────────────────────────────────────────────────
interface State {
  patients: Patient[];
  tasks: Task[];
  filters: FilterState;
  loading: boolean;
  error: string | null;
  toast: { message: string; type: 'success' | 'error' } | null;
}

const initialState: State = {
  patients: [],
  tasks: [],
  filters: { role: 'all', time: 'all' },
  loading: false,
  error: null,
  toast: null,
};

// ── Actions ────────────────────────────────────────────────────────────────────
type Action =
  | { type: 'LOADING' }
  | { type: 'LOADED'; patients: Patient[]; tasks: Task[] }
  | { type: 'LOAD_ERROR'; message: string }
  | { type: 'SET_FILTERS'; filters: Partial<FilterState> }
  | { type: 'TASK_ADD_OPTIMISTIC'; task: Task }
  | { type: 'TASK_ADD_COMMIT'; tempId: string; task: Task }
  | { type: 'TASK_ADD_ROLLBACK'; tempId: string }
  | { type: 'TASK_UPDATE_OPTIMISTIC'; taskId: string; changes: Partial<Task> }
  | { type: 'TASK_UPDATE_COMMIT'; taskId: string; task: Task }
  | { type: 'TASK_UPDATE_ROLLBACK'; taskId: string; previous: Task }
  | { type: 'SET_TOAST'; message: string; toastType: 'success' | 'error' }
  | { type: 'CLEAR_TOAST' };

// ── Reducer ────────────────────────────────────────────────────────────────────
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true, error: null };
    case 'LOADED':
      return { ...state, loading: false, patients: action.patients, tasks: action.tasks };
    case 'LOAD_ERROR':
      return { ...state, loading: false, error: action.message };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.filters } };
    case 'TASK_ADD_OPTIMISTIC':
      return { ...state, tasks: [...state.tasks, action.task] };
    case 'TASK_ADD_COMMIT':
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.tempId ? action.task : t)),
      };
    case 'TASK_ADD_ROLLBACK':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.tempId) };
    case 'TASK_UPDATE_OPTIMISTIC':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.taskId ? { ...t, ...action.changes } : t,
        ),
      };
    case 'TASK_UPDATE_COMMIT':
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.taskId ? action.task : t)),
      };
    case 'TASK_UPDATE_ROLLBACK':
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.taskId ? action.previous : t)),
      };
    case 'SET_TOAST':
      return { ...state, toast: { message: action.message, type: action.toastType } };
    case 'CLEAR_TOAST':
      return { ...state, toast: null };
    default:
      return state;
  }
}

// ── Context ────────────────────────────────────────────────────────────────────
interface ContextValue extends State {
  setFilters: (f: Partial<FilterState>) => void;
  addTask: (patientId: string, payload: CreateTaskPayload) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  patchTask: (taskId: string, payload: UpdateTaskPayload) => Promise<void>;
  reload: () => void;
}

const TaskboardContext = createContext<ContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────────────────────
export function TaskboardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(message: string, toastType: 'success' | 'error') {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    dispatch({ type: 'SET_TOAST', message, toastType });
    toastTimer.current = setTimeout(() => dispatch({ type: 'CLEAR_TOAST' }), 3000);
  }

  const loadAll = useCallback(async () => {
    dispatch({ type: 'LOADING' });
    try {
      const patients = await fetchPatients();
      const taskResults = await Promise.all(
        patients.map((p) => fetchTasksForPatient(p.id).catch(() => [] as Task[])),
      );
      dispatch({ type: 'LOADED', patients, tasks: taskResults.flat() });
    } catch (err) {
      dispatch({
        type: 'LOAD_ERROR',
        message: err instanceof Error ? err.message : 'Something went wrong',
      });
    }
  }, []);

  useEffect(() => { void loadAll(); }, [loadAll]);

  const setFilters = useCallback((filters: Partial<FilterState>) => {
    dispatch({ type: 'SET_FILTERS', filters });
  }, []);

  const addTask = useCallback(async (patientId: string, payload: CreateTaskPayload) => {
    const tempId = `temp_${Date.now()}`;
    const optimistic: Task = {
      id: tempId,
      patientId,
      ...payload,
      completed: false,
      status: deriveStatus(payload.dueDate, false),
    };
    dispatch({ type: 'TASK_ADD_OPTIMISTIC', task: optimistic });
    try {
      const confirmed = await createTask(patientId, payload);
      dispatch({ type: 'TASK_ADD_COMMIT', tempId, task: confirmed });
      showToast('Task created', 'success');
    } catch (err) {
      dispatch({ type: 'TASK_ADD_ROLLBACK', tempId });
      showToast(
        `Could not create task — ${err instanceof Error ? err.message : 'try again'}`,
        'error',
      );
    }
  }, []);

  const patchTask = useCallback(async (taskId: string, payload: UpdateTaskPayload) => {
    const previous = state.tasks.find((t) => t.id === taskId);
    if (!previous) return;
    const optimisticChanges: Partial<Task> = {
      ...payload,
      status: deriveStatus(
        payload.dueDate ?? previous.dueDate,
        payload.completed ?? previous.completed,
      ),
    };
    dispatch({ type: 'TASK_UPDATE_OPTIMISTIC', taskId, changes: optimisticChanges });
    try {
      const confirmed = await updateTask(taskId, payload);
      dispatch({ type: 'TASK_UPDATE_COMMIT', taskId, task: confirmed });
      showToast('Task updated', 'success');
    } catch (err) {
      dispatch({ type: 'TASK_UPDATE_ROLLBACK', taskId, previous });
      showToast(
        `Update failed, reverted — ${err instanceof Error ? err.message : 'try again'}`,
        'error',
      );
    }
  }, [state.tasks]);

  const completeTask = useCallback(
    (taskId: string) => patchTask(taskId, { completed: true }),
    [patchTask],
  );

  return (
    <TaskboardContext.Provider
      value={{ ...state, setFilters, addTask, completeTask, patchTask, reload: loadAll }}
    >
      {children}
    </TaskboardContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────────
export function useTaskboard(): ContextValue {
  const ctx = useContext(TaskboardContext);
  if (!ctx) throw new Error('useTaskboard must be used inside TaskboardProvider');
  return ctx;
}
