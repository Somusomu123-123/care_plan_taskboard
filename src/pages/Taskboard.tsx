import { useState } from 'react';
import { useTaskboard } from '../hooks/TaskboardContext';
import { useFilteredTasks } from '../hooks/useFilteredTasks';
import TaskCard from '../components/TaskCard';
import NewTaskModal from '../components/NewTaskModal';
import Toast from '../components/Toast';
import type { TaskStatus } from '../types/task';
import type { Patient } from '../types/patient';
import type { Task } from '../types/task';
import './Taskboard.css';

// ── Column definitions ─────────────────────────────────────────────────────────
const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: 'overdue',   label: 'Overdue'   },
  { key: 'today',     label: 'Due today' },
  { key: 'upcoming',  label: 'Upcoming'  },
  { key: 'completed', label: 'Completed' },
];

// ── Role and time filter options ───────────────────────────────────────────────
const ROLE_OPTIONS = [
  { value: 'all',           label: 'All roles'     },
  { value: 'nurse',         label: 'Nurse'         },
  { value: 'dietician',     label: 'Dietician'     },
  { value: 'social_worker', label: 'Social worker' },
] as const;

const TIME_OPTIONS = [
  { value: 'all',      label: 'All'      },
  { value: 'overdue',  label: 'Overdue'  },
  { value: 'today',    label: 'Today'    },
  { value: 'upcoming', label: 'Upcoming' },
] as const;

// ── PatientInfoCell ────────────────────────────────────────────────────────────
function PatientInfoCell({ patient, onAddTask }: { patient: Patient; onAddTask: () => void }) {
  return (
    <div className="patient-cell">
      <p className="patient-cell__name">{patient.name}</p>
      <p className="patient-cell__meta">Age {patient.age} &middot; {patient.patientCode}</p>
      <p className="patient-cell__schedule">{patient.schedule}</p>
      <p className="patient-cell__since">{patient.dialysisSince} on dialysis</p>
      <button className="patient-cell__add" onClick={onAddTask}>+ Add task</button>
    </div>
  );
}

// ── TaskLane ──────────────────────────────────────────────────────────────────
function TaskLane({ tasks, onComplete }: { tasks: Task[]; onComplete: (id: string) => void }) {
  return (
    <div className="task-lane">
      {tasks.length === 0 ? (
        <span className="task-lane__empty">—</span>
      ) : (
        tasks.map((task) => (
          <TaskCard key={task.id} task={task} onComplete={onComplete} />
        ))
      )}
    </div>
  );
}

// ── Main Taskboard page ────────────────────────────────────────────────────────
export default function Taskboard() {
  const {
    patients, tasks, filters, loading, error,
    toast, setFilters, addTask, completeTask, reload,
  } = useTaskboard();

  const [modalOpen, setModalOpen]               = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>();

  const visible = useFilteredTasks(tasks, filters);

  function openModal(patientId?: string) {
    setSelectedPatientId(patientId);
    setModalOpen(true);
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return <div className="board-state">Loading...</div>;
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="board-state board-state--error">
        <p>{error}</p>
        <button onClick={reload}>Retry</button>
      </div>
    );
  }

  // ── Board ────────────────────────────────────────────────────────────────────
  return (
    <div className="taskboard">

      {/* ── Header ── */}
      <div className="board-header">
        <div className="board-header__left">
          <h1 className="board-header__title">Care Plan Taskboard</h1>
          <span className="board-header__sub">
            {patients.length} patients &middot;{' '}
            {new Date().toLocaleDateString('en-GB', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
          </span>
        </div>
        <div className="board-header__stats">
          {tasks.filter((t) => t.status === 'overdue').length > 0 && (
            <span className="stat stat--red">
              {tasks.filter((t) => t.status === 'overdue').length} overdue
            </span>
          )}
          {tasks.filter((t) => t.status === 'today').length > 0 && (
            <span className="stat stat--amber">
              {tasks.filter((t) => t.status === 'today').length} due today
            </span>
          )}
          <span className="stat stat--green">
            {tasks.filter((t) => t.status === 'completed').length} completed
          </span>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="board-filters">
        <div className="board-filters__group">
          <span className="board-filters__label">Role</span>
          {ROLE_OPTIONS.map((r) => (
            <button
              key={r.value}
              className={`filter-btn ${filters.role === r.value ? 'filter-btn--active' : ''}`}
              onClick={() => setFilters({ role: r.value })}
            >
              {r.label}
            </button>
          ))}
        </div>
        <div className="board-filters__divider" />
        <div className="board-filters__group">
          <span className="board-filters__label">Time</span>
          {TIME_OPTIONS.map((t) => (
            <button
              key={t.value}
              className={`filter-btn ${filters.time === t.value ? 'filter-btn--active' : ''}`}
              onClick={() => setFilters({ time: t.value })}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button className="new-task-btn" onClick={() => openModal()}>
          + New task
        </button>
      </div>

      {/* ── Board grid ── */}
      <div className="board-scroll">
        <div className="board-grid">

          {/* column headers */}
          <div /> {/* empty cell above patient column */}
          {COLUMNS.map((col) => (
            <div key={col.key} className="col-header">
              <span className="col-header__name">{col.label}</span>
              <span className={`col-header__count col-header__count--${col.key}`}>
                {visible.filter((t) => t.status === col.key).length}
              </span>
            </div>
          ))}

          {/* one row per patient */}
          {patients.map((patient) => {
            const patientTasks = visible.filter((t) => t.patientId === patient.id);
            return (
              <>
                <PatientInfoCell
                  key={`info-${patient.id}`}
                  patient={patient}
                  onAddTask={() => openModal(patient.id)}
                />
                {COLUMNS.map((col) => (
                  <TaskLane
                    key={`${patient.id}-${col.key}`}
                    tasks={patientTasks.filter((t) => t.status === col.key)}
                    onComplete={completeTask}
                  />
                ))}
              </>
            );
          })}

        </div>
      </div>

      {/* ── New task modal ── */}
      {modalOpen && (
        <NewTaskModal
          patients={patients}
          defaultPatientId={selectedPatientId}
          onSubmit={(pid, payload) => { void addTask(pid, payload); }}
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* ── Toast ── */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
