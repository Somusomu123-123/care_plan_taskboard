import { useState } from 'react';
import type { Patient } from '../types/patient';
import type { CreateTaskPayload, Role } from '../types/task';
import './NewTaskModal.css';

interface Props {
  patients: Patient[];
  defaultPatientId?: string;
  onSubmit: (patientId: string, payload: CreateTaskPayload) => void;
  onClose: () => void;
}

export default function NewTaskModal({ patients, defaultPatientId, onSubmit, onClose }: Props) {
  const [patientId, setPatientId] = useState(defaultPatientId ?? patients[0]?.id ?? '');
  const [title, setTitle]         = useState('');
  const [role, setRole]           = useState<Role>('nurse');
  const [dueDate, setDueDate]     = useState('');
  const [error, setError]         = useState('');

  function handleSubmit() {
    if (!title.trim()) { setError('Task name is required'); return; }
    if (!dueDate)       { setError('Due date is required');  return; }
    setError('');
    onSubmit(patientId, { title: title.trim(), role, dueDate });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal__header">
          <h3 className="modal__title">New task</h3>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="modal__body">
          <label className="modal__label">
            Patient
            <select value={patientId} onChange={(e) => setPatientId(e.target.value)}>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.patientCode})</option>
              ))}
            </select>
          </label>

          <label className="modal__label">
            Task name
            <input
              type="text"
              placeholder="e.g. Monthly blood panel"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <div className="modal__row">
            <label className="modal__label">
              Role
              <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
                <option value="nurse">Nurse</option>
                <option value="dietician">Dietician</option>
                <option value="social_worker">Social worker</option>
              </select>
            </label>

            <label className="modal__label">
              Due date
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </label>
          </div>

          {error && <p className="modal__error">{error}</p>}
        </div>

        <div className="modal__footer">
          <button className="modal__cancel" onClick={onClose}>Cancel</button>
          <button className="modal__submit" onClick={handleSubmit}>Create task</button>
        </div>
      </div>
    </div>
  );
}
