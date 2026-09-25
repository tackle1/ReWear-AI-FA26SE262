import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';
import { LoginFormData } from '../types/auth.type';
import storage from '../../../utils/storage';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useLogin();

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const isFormValid = formData.email.trim().length > 0 && formData.password.length >= 1;

  const handleChange = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!isFormValid || isLoading) return;
    const success = await login(formData);
    if (success) {
      const user = storage.getItem<{ role: string }>('rewear_current_user');
      navigate(user?.role === 'SELLER' ? '/seller/dashboard' : '/marketplace');
    }
  };

  const eyeIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
  const eyeOffIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* API error */}
      {error && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '10px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            fontSize: '13px',
            color: '#DC2626',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {/* Email field */}
      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1E293B', marginBottom: '7px' }}>
          Email
        </label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {/* Left mail icon */}
          <div style={{ position: 'absolute', left: '13px', color: '#94A3B8', display: 'flex', alignItems: 'center', zIndex: 1 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <input
            type="email"
            placeholder="curator@resale.vn"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            style={{
              width: '100%',
              height: '44px',
              padding: '0 14px 0 40px',
              backgroundColor: '#EDF3FE',
              border: touched.email && !formData.email ? '1px solid #EF4444' : '1px solid transparent',
              borderRadius: '10px',
              fontSize: '13.5px',
              color: '#0F172A',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Password field */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>
            Mật khẩu
          </label>
          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              fontSize: '12.5px',
              color: '#0F172A',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
            }}
          >
            Quên mật khẩu?
          </button>
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {/* Left lock icon */}
          <div style={{ position: 'absolute', left: '13px', color: '#94A3B8', display: 'flex', alignItems: 'center', zIndex: 1 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••••••"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
            style={{
              width: '100%',
              height: '44px',
              padding: '0 42px 0 40px',
              backgroundColor: '#EDF3FE',
              border: touched.password && !formData.password ? '1px solid #EF4444' : '1px solid transparent',
              borderRadius: '10px',
              fontSize: '13.5px',
              color: '#0F172A',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <button
            type="button"
            aria-label="Toggle password visibility"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '12px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: 0,
            }}
          >
            {showPassword ? eyeOffIcon : eyeIcon}
          </button>
        </div>
      </div>

      {/* Remember me */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '-4px' }}>
        <input
          id="rememberMe"
          type="checkbox"
          checked={formData.rememberMe}
          onChange={(e) => handleChange('rememberMe', e.target.checked)}
          style={{
            width: '16px',
            height: '16px',
            accentColor: '#2563EB',
            cursor: 'pointer',
          }}
        />
        <label
          htmlFor="rememberMe"
          style={{ fontSize: '12.5px', color: '#475569', cursor: 'pointer' }}
        >
          Ghi nhớ đăng nhập trên thiết bị này
        </label>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={!isFormValid || isLoading}
        style={{
          width: '100%',
          height: '46px',
          backgroundColor: '#000000',
          color: '#FFFFFF',
          borderRadius: '10px',
          border: 'none',
          fontSize: '14px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          cursor: !isFormValid || isLoading ? 'not-allowed' : 'pointer',
          opacity: !isFormValid || isLoading ? 0.65 : 1,
          transition: 'all 0.2s ease',
          marginTop: '4px',
        }}
      >
        {isLoading ? (
          <span>Đang xử lý...</span>
        ) : (
          <>
            <span>Đăng nhập</span>
            <span style={{ fontSize: '16px' }}>&rarr;</span>
          </>
        )}
      </button>

      {/* Create account link */}
      <div style={{ textAlign: 'center', fontSize: '13px', color: '#475569', marginTop: '4px' }}>
        Chưa có tài khoản ReWear AI?{' '}
        <button
          type="button"
          onClick={() => navigate('/register')}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            color: '#0F172A',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '13px',
            textDecoration: 'underline',
            textUnderlineOffset: '2px',
          }}
        >
          Đăng ký tài khoản ngay
        </button>
      </div>

      {/* Terms fine print */}
      <p
        style={{
          fontSize: '11.5px',
          color: '#94A3B8',
          lineHeight: 1.55,
          textAlign: 'center',
          margin: 0,
          marginTop: '4px',
          paddingTop: '14px',
          borderTop: '1px solid #F1F5F9',
        }}
      >
        Bằng việc tiếp tục đăng nhập, bạn xác nhận đã đọc và hoàn toàn đồng ý với{' '}
        <span style={{ color: '#475569', textDecoration: 'underline', cursor: 'pointer' }}>Điều khoản dịch vụ</span>{' '}
        và{' '}
        <span style={{ color: '#475569', textDecoration: 'underline', cursor: 'pointer' }}>Chính sách bảo mật ký quỹ</span>{' '}
        của ReWear AI.
      </p>
    </form>
  );
};

export default LoginForm;
