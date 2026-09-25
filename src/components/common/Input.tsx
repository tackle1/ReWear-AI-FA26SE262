import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  rightElement?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  id,
  rightElement,
  className = '',
  style,
  ...props
}) => {
  return (
    <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label
          htmlFor={id}
          className="input-label"
          style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B' }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
        <input
          id={id}
          className={`input-field ${error ? 'input-error' : ''} ${className}`}
          style={{
            width: '100%',
            height: '44px',
            padding: rightElement ? '10px 42px 10px 14px' : '10px 14px',
            fontSize: '14px',
            borderRadius: '10px',
            border: `1.5px solid ${error ? '#E11D48' : '#CBD5E1'}`,
            outline: 'none',
            backgroundColor: '#FFFFFF',
            color: '#0F172A',
            transition: 'all 0.2s ease-in-out',
            boxSizing: 'border-box',
            ...style,
          }}
          {...props}
        />
        {rightElement && (
          <div
            style={{
              position: 'absolute',
              right: '12px',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              color: '#64748B',
            }}
          >
            {rightElement}
          </div>
        )}
      </div>
      {error && <span className="error-text" style={{ fontSize: '12px', color: '#E11D48', marginTop: '2px' }}>{error}</span>}
      {helperText && !error && <span className="helper-text" style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{helperText}</span>}
    </div>
  );
};

export default Input;
