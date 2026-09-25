import React from 'react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md' }) => {
  return <div className={`spinner spinner-${size}`} role="status" aria-label="loading" />;
};

export default Spinner;
