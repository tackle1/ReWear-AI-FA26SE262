import React from 'react';

export interface ToastProps {
  id: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ id, type = 'info', message, onDismiss }) => {
  return (
    <div className={`toast toast-${type}`}>
      <span>{message}</span>
      <button onClick={() => onDismiss(id)}>&times;</button>
    </div>
  );
};

export default Toast;
