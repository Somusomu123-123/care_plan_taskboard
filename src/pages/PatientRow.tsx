import type { Patient } from '../types/patient';
import type { Task, TaskStatus } from '../types/task';
import TaskCard from '../components/TaskCard';
import './PatientRow.css';

interface Props {
  patient: Patient;
  tasks: Task[];
  columns: { key: TaskStatus; label: string }[];
  onAddTask: (patientId: string) => void;
  onComplete: (taskId: string) => void;
}

export default function PatientRow({
  patient,
  tasks,
  columns,
  onAddTask,
  onComplete,
}: Props) {
  return (
    <>
      <div className="patient-cell">
        <p className="patient-cell__name">{patient.name}</p>
        <p className="patient-cell__meta">
          Age {patient.age} &middot; {patient.patientCode}
        </p>
        <p className="patient-cell__schedule">{patient.schedule}</p>
        <p className="patient-cell__since">{patient.dialysisSince} on dialysis</p>
        <button
          className="patient-cell__add"
          onClick={() => onAddTask(patient.id)}
        >
          + Add task
        </button>
      </div>

      {columns.map((col) => {
        const cards = tasks.filter((t) => t.status === col.key);
        return (
          <div key={col.key} className="task-lane">
            {cards.length === 0 ? (
              <span className="task-lane__empty">—</span>
            ) : (
              cards.map((task) => (
                <TaskCard key={task.id} task={task} onComplete={onComplete} />
              ))
            )}
          </div>
        );
      })}
    </>
  );
}