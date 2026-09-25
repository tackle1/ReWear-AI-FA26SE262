import React from 'react';

export interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default', className = '' }) => {
  return <span className={`badge badge-${variant} ${className}`}>{label}</span>;
};

export default Badge;
