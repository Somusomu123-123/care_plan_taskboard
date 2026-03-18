import type { Task } from '../types/task';
import { formatDueDate } from '../hooks/useTaskStatus';
import './TaskCard.css';

interface Props {
  task: Task;
  onComplete: (taskId: string) => void;
}

const ROLE_LABEL: Record<Task['role'], string> = {
  nurse: 'Nurse',
  dietician: 'Dietician',
  social_worker: 'Social worker',
};

export default function TaskCard({ task, onComplete }: Props) {
  return (
    <div className={`task-card task-card--${task.status}`}>
      <p className="task-card__title">{task.title}</p>
      <div className="task-card__meta">
        <span className={`task-card__role task-card__role--${task.role}`}>
          {ROLE_LABEL[task.role]}
        </span>
        <span className={`task-card__due task-card__due--${task.status}`}>
          {formatDueDate(task.dueDate, task.completed)}
        </span>
      </div>
      {task.status !== 'completed' && (
        <button className="task-card__btn" onClick={() => onComplete(task.id)}>
          Mark complete
        </button>
      )}
    </div>
  );
}
