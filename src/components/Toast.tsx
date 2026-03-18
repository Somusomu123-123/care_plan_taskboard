import './Toast.css';

interface Props {
  message: string;
  type: 'success' | 'error';
}

export default function Toast({ message, type }: Props) {
  return (
    <div className={`toast toast--${type}`} role="alert">
      {message}
    </div>
  );
}
