import { TaskboardProvider } from './hooks/TaskboardContext';
import Taskboard from './pages/Taskboard';
import './index.css';

export default function App() {
  return (
    <TaskboardProvider>
      <Taskboard />
    </TaskboardProvider>
  );
}
