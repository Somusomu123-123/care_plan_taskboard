import { useMemo } from 'react';
import type { Task, FilterState } from '../types/task';

export function useFilteredTasks(tasks: Task[], filters: FilterState): Task[] {
  return useMemo(() => {
    return tasks.filter((task) => {
      if (filters.role !== 'all' && task.role !== filters.role) return false;
      if (filters.time !== 'all' && task.status !== filters.time) return false;
      return true;
    });
  }, [tasks, filters]);
}
