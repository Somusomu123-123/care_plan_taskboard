import { useState } from 'react';
import { useTaskboard } from '../hooks/TaskboardContext';
import { useFilteredTasks } from '../hooks/useFilteredTasks';
import BoardHeader from './BoardHeader';
import BoardFilters from './BoardFilters';
import PatientRow from './PatientRow';
import NewTaskModal from '../components/NewTaskModal';
import Toast from '../components/Toast';
import type { TaskStatus } from '../types/task';
import './Taskboard.css';

const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: 'overdue',   label: 'Overdue'   },
  { key: 'today',     label: 'Due today' },
  { key: 'upcoming',  label: 'Upcoming'  },
  { key: 'completed', label: 'Completed' },
];

export default function Taskboard() {
  const {
    patients, tasks, filters, loading, error,
    toast, setFilters, addTask, completeTask, reload,
  } = useTaskboard();

  const [modalOpen, setModalOpen]               = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>();
  const [search, setSearch]                     = useState('');

  const visible = useFilteredTasks(tasks, filters);

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  function openModal(patientId?: string) {
    setSelectedPatientId(patientId);
    setModalOpen(true);
  }

  if (loading) {
    return <div className="board-state">Loading...</div>;
  }

  if (error) {
    return (
      <div className="board-state board-state--error">
        <p>{error}</p>
        <button onClick={reload}>Retry</button>
      </div>
    );
  }

  return (
    <div className="taskboard">

      <BoardHeader tasks={tasks} patientCount={patients.length} />

      <BoardFilters
        filters={filters}
        search={search}
        onChange={setFilters}
        onSearch={setSearch}
        onNewTask={() => openModal()}
      />

      <div className="board-scroll">
        <div className="board-grid">

          <div />
          {COLUMNS.map((col) => (
            <div key={col.key} className="col-header">
              <span className="col-header__name">{col.label}</span>
              <span className={`col-header__count col-header__count--${col.key}`}>
                {visible.filter((t) => t.status === col.key).length}
              </span>
            </div>
          ))}

          {filteredPatients.length === 0 ? (
            <div className="board-no-results">
              No patients found for "{search}"
            </div>
          ) : (
            filteredPatients.map((patient) => (
              <PatientRow
                key={patient.id}
                patient={patient}
                tasks={visible.filter((t) => t.patientId === patient.id)}
                columns={COLUMNS}
                onAddTask={(pid) => openModal(pid)}
                onComplete={completeTask}
              />
            ))
          )}

        </div>
      </div>

      {modalOpen && (
        <NewTaskModal
          patients={patients}
          defaultPatientId={selectedPatientId}
          onSubmit={(pid, payload) => { void addTask(pid, payload); }}
          onClose={() => setModalOpen(false)}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}