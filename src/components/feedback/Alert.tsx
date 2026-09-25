import React from 'react';

export interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  message: string;
  description?: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type = 'info', message, description, onClose }) => {
  return (
    <div className={`alert alert-${type}`}>
      <div className="alert-content">
        <strong className="alert-title">{message}</strong>
        {description && <p className="alert-description">{description}</p>}
      </div>
      {onClose && <button className="alert-close" onClick={onClose}>&times;</button>}
    </div>
  );
};

export default Alert;
