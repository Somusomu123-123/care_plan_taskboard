import type { FilterState, Role, TaskStatus } from '../types/task';
import './BoardFilters.css';

interface Props {
  filters: FilterState;
  search: string;
  onChange: (f: Partial<FilterState>) => void;
  onSearch: (value: string) => void;
  onNewTask: () => void;
}

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

export default function BoardFilters({ filters, search, onChange, onSearch, onNewTask }: Props) {
  return (
    <div className="board-filters">
      {/* search */}
      <input
        type="text"
        className="patient-search"
        placeholder="Search patient..."
        value={search}
        onChange={(e) => onSearch(e.target.value)}
      />

      <div className="board-filters__divider" />

      {/* role filter */}
      <div className="board-filters__group">
        <span className="board-filters__label">Role</span>
        {ROLE_OPTIONS.map((r) => (
          <button
            key={r.value}
            className={`filter-btn ${filters.role === r.value ? 'filter-btn--active' : ''}`}
            onClick={() => onChange({ role: r.value as Role | 'all' })}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="board-filters__divider" />

      {/* time filter */}
      <div className="board-filters__group">
        <span className="board-filters__label">Time</span>
        {TIME_OPTIONS.map((t) => (
          <button
            key={t.value}
            className={`filter-btn ${filters.time === t.value ? 'filter-btn--active' : ''}`}
            onClick={() => onChange({ time: t.value as TaskStatus | 'all' })}
          >
            {t.label}
          </button>
        ))}
      </div>

      <button className="new-task-btn" onClick={onNewTask}>
        + New task
      </button>
    </div>
  );
}