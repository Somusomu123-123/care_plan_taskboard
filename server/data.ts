export interface Patient {
  id: string;
  name: string;
  age: number;
  patientCode: string;
  schedule: string;
  dialysisSince: string;
}

export interface Task {
  id: string;
  patientId: string;
  title: string;
  role: 'nurse' | 'dietician' | 'social_worker';
  dueDate: string;
  completed: boolean;
}

export const patients: Patient[] = [
  { id: 'p1', name: 'Arjun Menon',      age: 62, patientCode: 'DL-0041', schedule: 'Mon / Wed / Fri', dialysisSince: '4 yrs' },
  { id: 'p2', name: 'Fatima Al-Rashid', age: 55, patientCode: 'DL-0067', schedule: 'Tue / Thu / Sat', dialysisSince: '2 yrs' },
  { id: 'p3', name: 'Robert Okafor',    age: 71, patientCode: 'DL-0023', schedule: 'Mon / Wed / Fri', dialysisSince: '6 yrs' },
  { id: 'p4', name: 'Priya Nambiar',    age: 48, patientCode: 'DL-0089', schedule: 'Tue / Thu / Sat', dialysisSince: '1 yr'  },
  { id: 'p5', name: 'Samuel Kurian',    age: 66, patientCode: 'DL-0055', schedule: 'Mon / Wed / Fri', dialysisSince: '3 yrs' },
];

export let tasks: Task[] = [
  { id: 't1',  patientId: 'p1', title: 'Monthly blood panel',           role: 'nurse',         dueDate: '2026-03-10', completed: false },
  { id: 't2',  patientId: 'p1', title: 'Dietary phosphate review',      role: 'dietician',     dueDate: '2026-03-18', completed: false },
  { id: 't3',  patientId: 'p1', title: 'AV fistula assessment',         role: 'nurse',         dueDate: '2026-03-25', completed: false },
  { id: 't4',  patientId: 'p1', title: 'Benefits and transport check',  role: 'social_worker', dueDate: '2026-03-11', completed: false },
  { id: 't5',  patientId: 'p2', title: 'Hepatitis B vaccination',       role: 'nurse',         dueDate: '2026-03-08', completed: false },
  { id: 't6',  patientId: 'p2', title: 'Fluid restriction counselling', role: 'dietician',     dueDate: '2026-03-27', completed: false },
  { id: 't7',  patientId: 'p2', title: 'Housing assistance follow-up',  role: 'social_worker', dueDate: '2026-03-15', completed: true  },
  { id: 't8',  patientId: 'p2', title: 'BP and dry weight check',       role: 'nurse',         dueDate: '2026-03-18', completed: false },
  { id: 't9',  patientId: 'p3', title: 'Erythropoietin dose review',    role: 'nurse',         dueDate: '2026-03-18', completed: false },
  { id: 't10', patientId: 'p3', title: 'Protein and calorie plan',      role: 'dietician',     dueDate: '2026-03-12', completed: false },
  { id: 't11', patientId: 'p3', title: 'Caregiver support plan',        role: 'social_worker', dueDate: '2026-03-30', completed: false },
  { id: 't12', patientId: 'p3', title: 'Monthly blood panel',           role: 'nurse',         dueDate: '2026-03-16', completed: true  },
  { id: 't13', patientId: 'p4', title: 'Tunnelled catheter check',      role: 'nurse',         dueDate: '2026-03-14', completed: true  },
  { id: 't14', patientId: 'p4', title: 'Potassium intake review',       role: 'dietician',     dueDate: '2026-03-18', completed: false },
  { id: 't15', patientId: 'p4', title: 'Transport reimbursement form',  role: 'social_worker', dueDate: '2026-03-09', completed: false },
  { id: 't16', patientId: 'p5', title: 'Monthly blood panel',           role: 'nurse',         dueDate: '2026-03-21', completed: false },
  { id: 't17', patientId: 'p5', title: 'Dialysis adequacy Kt/V',        role: 'nurse',         dueDate: '2026-03-13', completed: false },
  { id: 't18', patientId: 'p5', title: 'Low potassium diet session',    role: 'dietician',     dueDate: '2026-03-17', completed: true  },
  { id: 't19', patientId: 'p5', title: 'Employment support referral',   role: 'social_worker', dueDate: '2026-03-28', completed: false },
];