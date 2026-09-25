import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  disabled,
  className = '',
  style,
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          border: 'none',
        };
      case 'secondary':
        return {
          backgroundColor: '#F1F5F9',
          color: '#0F172A',
          border: '1px solid #E2E8F0',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: '#0F172A',
          border: '1px solid #CBD5E1',
        };
      case 'danger':
        return {
          backgroundColor: '#E11D48',
          color: '#FFFFFF',
          border: 'none',
        };
      default:
        return {};
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return { height: '36px', padding: '0 12px', fontSize: '13px' };
      case 'lg':
        return { height: '50px', padding: '0 24px', fontSize: '16px' };
      case 'md':
      default:
        return { height: '44px', padding: '0 16px', fontSize: '14px' };
    }
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`btn btn-${variant} btn-${size} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '12px',
        fontWeight: 600,
        fontFamily: 'inherit',
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled || isLoading ? 0.6 : 1,
        width: fullWidth ? '100%' : 'auto',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: variant === 'primary' && !disabled ? '0 2px 4px rgba(15, 23, 42, 0.1)' : 'none',
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...style,
      }}
      {...props}
    >
      {isLoading ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <svg
            style={{
              animation: 'spin 1s linear infinite',
              width: '16px',
              height: '16px',
            }}
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray="32"
              strokeLinecap="round"
            />
          </svg>
          <span>Đang xử lý...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
