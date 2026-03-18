import type { Patient } from '../types/patient';
import { MOCK_PATIENTS } from './mockData';

const BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';
const USE_MOCK = false; // set to false when real backend is ready

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchPatients(): Promise<Patient[]> {
  if (USE_MOCK) {
    await delay(300);
    return MOCK_PATIENTS;
  }
  const res = await fetch(`${BASE}/patients`);
  if (!res.ok) throw new Error(`Failed to fetch patients (${res.status})`);
  const data: unknown = await res.json();
  if (!Array.isArray(data)) return [];
  return data as Patient[];
}
