import { Router } from 'express';
import { tasks } from '../data';
import type { Task } from '../data';

const router = Router();

// GET /patients/:id/tasks
router.get('/:id/tasks', (req, res) => {
  const patientTasks = tasks.filter((t) => t.patientId === req.params.id);
  res.json(patientTasks);
});

// POST /patients/:id/tasks
router.post('/:id/tasks', (req, res) => {
  const { title, role, dueDate } = req.body;

  if (!title || !role || !dueDate) {
    res.status(400).json({ error: 'title, role and dueDate are required' });
    return;
  }

  const newTask: Task = {
    id: `t_${Date.now()}`,
    patientId: req.params.id,
    title,
    role,
    dueDate,
    completed: false,
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// PATCH /tasks/:id
router.patch('/:id', (req, res) => {
  const taskIndex = tasks.findIndex((t) => t.id === req.params.id);

  if (taskIndex === -1) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  tasks[taskIndex] = { ...tasks[taskIndex], ...req.body };
  res.json(tasks[taskIndex]);
});

export default router;