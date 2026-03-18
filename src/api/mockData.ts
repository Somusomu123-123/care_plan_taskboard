import type { Patient } from '../types/patient';
import type { Task } from '../types/task';
import { deriveStatus } from '../hooks/useTaskStatus';

export const MOCK_PATIENTS: Patient[] = [
  { id: 'p1', name: 'Arjun Menon',       age: 62, patientCode: 'DL-0041', schedule: 'Mon / Wed / Fri', dialysisSince: '4 yrs' },
  { id: 'p2', name: 'Fatima Al-Rashid',  age: 55, patientCode: 'DL-0067', schedule: 'Tue / Thu / Sat', dialysisSince: '2 yrs' },
  { id: 'p3', name: 'Robert Okafor',     age: 71, patientCode: 'DL-0023', schedule: 'Mon / Wed / Fri', dialysisSince: '6 yrs' },
  { id: 'p4', name: 'Priya Nambiar',     age: 48, patientCode: 'DL-0089', schedule: 'Tue / Thu / Sat', dialysisSince: '1 yr'  },
  { id: 'p5', name: 'Samuel Kurian',     age: 66, patientCode: 'DL-0055', schedule: 'Mon / Wed / Fri', dialysisSince: '3 yrs' },
];

function t(
  id: string,
  patientId: string,
  title: string,
  role: Task['role'],
  dueDate: string,
  completed = false,
): Task {
  return { id, patientId, title, role, dueDate, completed, status: deriveStatus(dueDate, completed) };
}

export const MOCK_TASKS: Task[] = [
  t('t1',  'p1', 'Monthly blood panel',           'nurse',         '2026-03-10'),
  t('t2',  'p1', 'Dietary phosphate review',      'dietician',     '2026-03-18'),
  t('t3',  'p1', 'AV fistula assessment',         'nurse',         '2026-03-25'),
  t('t4',  'p1', 'Benefits and transport check',  'social_worker', '2026-03-11'),
  t('t5',  'p2', 'Hepatitis B vaccination',       'nurse',         '2026-03-08'),
  t('t6',  'p2', 'Fluid restriction counselling', 'dietician',     '2026-03-27'),
  t('t7',  'p2', 'Housing assistance follow-up',  'social_worker', '2026-03-15', true),
  t('t8',  'p2', 'BP and dry weight check',       'nurse',         '2026-03-18'),
  t('t9',  'p3', 'Erythropoietin dose review',    'nurse',         '2026-03-18'),
  t('t10', 'p3', 'Protein and calorie plan',      'dietician',     '2026-03-12'),
  t('t11', 'p3', 'Caregiver support plan',        'social_worker', '2026-03-30'),
  t('t12', 'p3', 'Monthly blood panel',           'nurse',         '2026-03-16', true),
  t('t13', 'p4', 'Tunnelled catheter check',      'nurse',         '2026-03-14', true),
  t('t14', 'p4', 'Potassium intake review',       'dietician',     '2026-03-18'),
  t('t15', 'p4', 'Transport reimbursement form',  'social_worker', '2026-03-09'),
  t('t16', 'p5', 'Monthly blood panel',           'nurse',         '2026-03-21'),
  t('t17', 'p5', 'Dialysis adequacy Kt/V',        'nurse',         '2026-03-13'),
  t('t18', 'p5', 'Low potassium diet session',    'dietician',     '2026-03-17', true),
  t('t19', 'p5', 'Employment support referral',   'social_worker', '2026-03-28'),
];
