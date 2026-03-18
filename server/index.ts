import express from 'express';
import cors from 'cors';
import patientsRouter from './routes/patients';
import tasksRouter from './routes/tasks';

const app = express();
const PORT = 4000;

// middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// routes
app.use('/patients', patientsRouter);
app.use('/patients', tasksRouter);
app.use('/tasks', tasksRouter);

// health check
app.get('/', (req, res) => {
  res.json({ message: 'Care Plan Taskboard API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});