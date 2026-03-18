import type { Task } from '../types/task';
import './BoardHeader.css';

interface Props {
  tasks: Task[];
  patientCount: number;
}

export default function BoardHeader({ tasks, patientCount }: Props) {
  const overdue = tasks.filter((t) => t.status === 'overdue').length;
  const today   = tasks.filter((t) => t.status === 'today').length;
  const done    = tasks.filter((t) => t.status === 'completed').length;

  const dateStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="board-header">
      <div className="board-header__left">
        <h1 className="board-header__title">Care Plan Taskboard</h1>
        <span className="board-header__sub">
          {patientCount} patients &middot; {dateStr}
        </span>
      </div>
      <div className="board-header__stats">
        {overdue > 0 && <span className="stat stat--red">{overdue} overdue</span>}
        {today   > 0 && <span className="stat stat--amber">{today} due today</span>}
        <span className="stat stat--green">{done} completed</span>
      </div>
    </div>
  );
}