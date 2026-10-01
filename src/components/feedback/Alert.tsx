import React from 'react';

export interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  message: string;
  description?: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type = 'info', message, description, onClose }) => {
  /*
   * `role` động theo `type`: khối lỗi đăng ký/đăng nhập phải được screen reader
   * đọc ngay khi xuất hiện, còn các thông báo thông thường thì không nên gây
   * nhiễu. `aria-live="assertive"` cho lỗi vì đó là thông tin người dùng cần
   * biết ngay, không nên đợi.
   */
  const isError = type === 'error';

  return (
    <div
      className={`alert alert-${type}`}
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
    >
      <div className="alert-content">
        <strong className="alert-title">{message}</strong>
        {description && <p className="alert-description">{description}</p>}
      </div>
      {onClose && (
        <button
          className="alert-close"
          onClick={onClose}
          aria-label="Đóng thông báo"
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default Alert;
