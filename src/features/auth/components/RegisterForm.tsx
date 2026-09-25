import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../../../components/feedback/Alert';
import { AuthRole, RegisterFormData } from '../types/auth.type';
import { useRegister } from '../hooks/useRegister';

export interface RegisterFormProps {
  role: AuthRole;
  onSuccess?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ role, onSuccess }) => {
  const navigate = useNavigate();
  const { register, isLoading, error, isSuccess } = useRegister();

  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    role,
    agreeTerms: false,
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  React.useEffect(() => {
    setFormData((prev) => ({ ...prev, role }));
  }, [role]);

  // Validation
  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Vui lòng nhập họ và tên';
    }

    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!formData.phone.trim()) {
      errors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!phoneRegex.test(formData.phone.trim())) {
      errors.phone = 'Số điện thoại không đúng định dạng';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Vui lòng nhập địa chỉ email';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Email không hợp lệ';
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!formData.password) {
      errors.password = 'Vui lòng nhập mật khẩu';
    } else if (!passwordRegex.test(formData.password)) {
      errors.password = 'Mật khẩu cần tối thiểu 8 ký tự, bao gồm cả chữ cái và số.';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (!formData.agreeTerms) {
      errors.agreeTerms = 'Bạn phải đồng ý với Điều khoản và Quy chế';
    }

    return errors;
  }, [formData]);

  const isFormValid = useMemo(() => {
    return Object.keys(validationErrors).length === 0;
  }, [validationErrors]);

  const handleChange = (field: keyof RegisterFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      fullName: true,
      phone: true,
      email: true,
      password: true,
      confirmPassword: true,
      agreeTerms: true,
    });

    if (!isFormValid || isLoading) return;

    const success = await register(formData);
    if (success) {
      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => {
          navigate('/login');
        }, 1200);
      }
    }
  };

  const eyeIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const eyeOffIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {error && (
        <Alert
          type="error"
          message="Lỗi đăng ký"
          description={error}
        />
      )}

      {isSuccess && (
        <Alert
          type="success"
          message="Đăng ký thành công!"
          description="Hồ sơ định danh đã được tạo thành công. Đang chuyển sang Đăng nhập..."
        />
      )}

      {/* Row 1: Họ và tên & Số điện thoại */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', width: '100%' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#1E293B', marginBottom: '6px' }}>
            Họ và tên <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <input
            type="text"
            placeholder="Nhập họ và tên đầy đủ"
            value={formData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            onBlur={() => handleBlur('fullName')}
            style={{
              width: '100%',
              height: '44px',
              padding: '0 14px',
              backgroundColor: '#EDF3FE',
              border: touched.fullName && validationErrors.fullName ? '1px solid #EF4444' : '1px solid transparent',
              borderRadius: '10px',
              fontSize: '13.5px',
              color: '#0F172A',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {touched.fullName && validationErrors.fullName && (
            <span style={{ fontSize: '11.5px', color: '#EF4444', marginTop: '3px', display: 'block' }}>
              {validationErrors.fullName}
            </span>
          )}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#1E293B', marginBottom: '6px' }}>
            Số điện thoại <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <input
            type="tel"
            placeholder="0912 345 678"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            onBlur={() => handleBlur('phone')}
            style={{
              width: '100%',
              height: '44px',
              padding: '0 14px',
              backgroundColor: '#EDF3FE',
              border: touched.phone && validationErrors.phone ? '1px solid #EF4444' : '1px solid transparent',
              borderRadius: '10px',
              fontSize: '13.5px',
              color: '#0F172A',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {touched.phone && validationErrors.phone && (
            <span style={{ fontSize: '11.5px', color: '#EF4444', marginTop: '3px', display: 'block' }}>
              {validationErrors.phone}
            </span>
          )}
        </div>
      </div>

      {/* Row 2: Email doanh nghiệp hoặc cá nhân */}
      <div>
        <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#1E293B', marginBottom: '6px' }}>
          Email doanh nghiệp hoặc cá nhân <span style={{ color: '#EF4444' }}>*</span>
        </label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            style={{
              width: '100%',
              height: '44px',
              padding: '0 40px 0 14px',
              backgroundColor: '#EDF3FE',
              border: touched.email && validationErrors.email ? '1px solid #EF4444' : '1px solid transparent',
              borderRadius: '10px',
              fontSize: '13.5px',
              color: '#0F172A',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ position: 'absolute', right: '14px', color: '#64748B', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', fontWeight: 600 }}>@</span>
          </div>
        </div>
        {touched.email && validationErrors.email && (
          <span style={{ fontSize: '11.5px', color: '#EF4444', marginTop: '3px', display: 'block' }}>
            {validationErrors.email}
          </span>
        )}
      </div>

      {/* Row 3: Mật khẩu & Xác nhận mật khẩu */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', width: '100%' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#1E293B', marginBottom: '6px' }}>
            Mật khẩu <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Tối thiểu 8 ký tự"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              style={{
                width: '100%',
                height: '44px',
                padding: '0 40px 0 14px',
                backgroundColor: '#EDF3FE',
                border: touched.password && validationErrors.password ? '1px solid #EF4444' : '1px solid transparent',
                borderRadius: '10px',
                fontSize: '13.5px',
                color: '#0F172A',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="button"
              aria-label="Toggle password"
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
          {touched.password && validationErrors.password && (
            <span style={{ fontSize: '11.5px', color: '#EF4444', marginTop: '3px', display: 'block' }}>
              {validationErrors.password}
            </span>
          )}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#1E293B', marginBottom: '6px' }}>
            Xác nhận mật khẩu <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Nhập lại mật khẩu"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              style={{
                width: '100%',
                height: '44px',
                padding: '0 40px 0 14px',
                backgroundColor: '#EDF3FE',
                border: touched.confirmPassword && validationErrors.confirmPassword ? '1px solid #EF4444' : '1px solid transparent',
                borderRadius: '10px',
                fontSize: '13.5px',
                color: '#0F172A',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="button"
              aria-label="Toggle confirm password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
              {showConfirmPassword ? eyeOffIcon : eyeIcon}
            </button>
          </div>
          {touched.confirmPassword && validationErrors.confirmPassword && (
            <span style={{ fontSize: '11.5px', color: '#EF4444', marginTop: '3px', display: 'block' }}>
              {validationErrors.confirmPassword}
            </span>
          )}
        </div>
      </div>

      {/* Info notice box */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#EDF3FE',
          borderRadius: '10px',
          padding: '10px 14px',
          fontSize: '12.5px',
          color: '#475569',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span>Mật khẩu cần tối thiểu 8 ký tự, bao gồm cả chữ cái và số.</span>
      </div>

      {/* Terms checkbox */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '2px' }}>
        <input
          id="termsCheck"
          type="checkbox"
          checked={formData.agreeTerms}
          onChange={(e) => handleChange('agreeTerms', e.target.checked)}
          style={{
            marginTop: '2px',
            width: '16px',
            height: '16px',
            accentColor: '#0F172A',
            cursor: 'pointer',
            borderRadius: '4px',
          }}
        />
        <label
          htmlFor="termsCheck"
          style={{
            fontSize: '12px',
            lineHeight: '1.45',
            color: '#475569',
            cursor: 'pointer',
          }}
        >
          Tôi đồng ý với{' '}
          <span style={{ textDecoration: 'underline', color: '#0F172A', fontWeight: 500 }}>
            Điều khoản sử dụng
          </span>
          , Chính sách bảo mật và{' '}
          <span style={{ textDecoration: 'underline', color: '#0F172A', fontWeight: 500 }}>
            Quy chế ký quỹ bảo vệ 100%
          </span>{' '}
          của hệ thống ReWear AI.
        </label>
      </div>
      {touched.agreeTerms && validationErrors.agreeTerms && (
        <span style={{ fontSize: '11.5px', color: '#EF4444', marginTop: '-8px', display: 'block' }}>
          {validationErrors.agreeTerms}
        </span>
      )}

      {/* Primary Submit Button */}
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
          opacity: !isFormValid || isLoading ? 0.6 : 1,
          transition: 'all 0.2s ease',
          marginTop: '6px',
        }}
      >
        {isLoading ? (
          <span>Đang xử lý...</span>
        ) : (
          <>
            <span style={{ fontSize: '16px' }}>&rarr;</span>
            <span>Đăng ký tài khoản</span>
          </>
        )}
      </button>

      {/* Login link */}
      <div style={{ textAlign: 'center', fontSize: '13px', color: '#64748B', marginTop: '6px' }}>
        Đã có tài khoản?{' '}
        <button
          type="button"
          onClick={() => navigate('/login')}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            color: '#0F172A',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          Đăng nhập &rsaquo;
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;
