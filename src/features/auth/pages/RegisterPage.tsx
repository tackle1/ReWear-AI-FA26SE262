import React, { useState } from 'react';
import RoleSelector from '../components/RoleSelector';
import RegisterForm from '../components/RegisterForm';
import { AuthRole } from '../types/auth.type';
import inspectionImg from '../../../assets/images/machine-vision-inspection.png';

export const RegisterPage: React.FC = () => {
  // In reference screenshot, "Người bán" is selected by default
  const [selectedRole, setSelectedRole] = useState<AuthRole>('SELLER');

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.18fr',
        gap: '48px',
        width: '100%',
        alignItems: 'start',
      }}
      className="rewear-register-grid"
    >
      <style>{`
        @media (max-width: 1024px) {
          .rewear-register-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>

      {/* ============================================================
          LEFT COLUMN: Brand & Trust / Evidence Messaging
      ============================================================ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {/* Version Badge */}
        <div style={{ display: 'flex' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '9999px',
              backgroundColor: '#EDF3FE',
              fontSize: '11.5px',
              fontWeight: 700,
              color: '#1E3A8A',
              letterSpacing: '0.04em',
            }}
          >
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0F172A' }} />
            <span>HỆ THỐNG GIÁM ĐỊNH & KÝ QUỸ AI V4.2</span>
          </div>
        </div>

        {/* Hero Headline */}
        <h1
          style={{
            fontSize: '34px',
            fontWeight: 800,
            lineHeight: 1.2,
            color: '#0F172A',
            letterSpacing: '-0.03em',
            margin: 0,
          }}
        >
          Gia nhập hệ sinh thái<br />
          thời trang thứ cấp đáng<br />
          tin cậy nhất Việt Nam
        </h1>

        {/* Supporting description */}
        <p
          style={{
            fontSize: '14px',
            lineHeight: 1.6,
            color: '#475569',
            margin: 0,
          }}
        >
          Hạ tầng công nghệ phân tích quang học đa phổ kết hợp cơ chế giải ngân ký quỹ tự động, bảo vệ giá trị chân thực của từng bộ sưu tập xa xỉ.
        </p>

        {/* Card 1: 100% Escrow Bank Protection */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            backgroundColor: '#EDF3FE',
            padding: '16px 20px',
            borderRadius: '16px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0F172A',
              flexShrink: 0,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="21" x2="21" y2="21" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <polyline points="5 6 12 3 19 6" />
              <line x1="4" y1="10" x2="4" y2="21" />
              <line x1="20" y1="10" x2="20" y2="21" />
              <line x1="8" y1="14" x2="8" y2="17" />
              <line x1="12" y1="14" x2="12" y2="17" />
              <line x1="16" y1="14" x2="16" y2="17" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
              100% Giao dịch bảo chứng Ký quỹ Ngân hàng
            </div>
            <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '2px' }}>
              Liên kết trực tiếp với cổng thanh toán bảo hộ Custodial Escrow SG & VN
            </div>
          </div>
        </div>

        {/* Card 2: AI Machine Vision Inspection Banner */}
        <div
          style={{
            position: 'relative',
            height: '175px',
            borderRadius: '16px',
            overflow: 'hidden',
            backgroundColor: '#1E232A',
            backgroundImage: `url(${inspectionImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            boxShadow: '0 8px 24px -6px rgba(15, 23, 42, 0.25)',
          }}
        >
          {/* Bottom text overlay with dark gradient */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              padding: '16px 20px',
              background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.75) 70%, transparent 100%)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FFFFFF', fontSize: '12px', fontWeight: 800, letterSpacing: '0.04em' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m12 2 2.1 2.1 3-.4.4 3 2.5 1.7-1.2 2.8 1.2 2.8-2.5 1.7-.4 3-3-.4L12 22l-2.1-2.1-3 .4-.4-3L4 15.6l1.2-2.8L4 10l2.5-1.7.4-3 3 .4L12 2Z" />
                <path d="m8.7 12 2.1 2.1 4.5-4.5" />
              </svg>
              <span>MACHINE VISION 99.4% ACCURACY PASS</span>
            </div>
            <div style={{ fontSize: '11.5px', color: '#CBD5E1', marginTop: '3px' }}>
              Dữ liệu kiểm chuẩn độc quyền hơn 250,000+ mẫu lưu trữ haute couture.
            </div>
          </div>
        </div>

        {/* Card 3: Dành cho Người bán (PROVIDER) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            padding: '16px 18px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E9F2',
            borderRadius: '16px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#EDF3FE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563EB',
              flexShrink: 0,
              marginTop: '1px',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
                Dành cho Người bán (PROVIDER)
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  backgroundColor: '#DBEAFE',
                  color: '#1D4ED8',
                  letterSpacing: '0.04em',
                }}
              >
                VERIFIED
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5, margin: '4px 0 0 0' }}>
              Đăng bán gắn nhãn xác thực AI Verified độc quyền, tiền hàng được giữ an toàn trên Smart-Escrow và thanh toán tự động, chống tráo hàng 100%.
            </p>
          </div>
        </div>

        {/* Card 4: Dành cho Người mua (CUSTOMER) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            padding: '16px 18px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E9F2',
            borderRadius: '16px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#EDF3FE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#334155',
              flexShrink: 0,
              marginTop: '1px',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
                Dành cho Người mua (CUSTOMER)
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  backgroundColor: '#E2E8F0',
                  color: '#334155',
                  letterSpacing: '0.04em',
                }}
              >
                PROTECTED
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5, margin: '4px 0 0 0' }}>
              Khám phá kho lưu trữ nguyên bản. Kiểm tra kết quả soi kính hiển vi từng đường may, giải ngân tiền chỉ khi người mua xác nhận hài lòng.
            </p>
          </div>
        </div>

        {/* Bottom ISO note */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: '#64748B',
            fontWeight: 600,
            marginTop: '4px',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>TUÂN THỦ TIÊU CHUẨN BẢO MẬT DỮ LIỆU LƯU CHUYỂN ISO/IEC 27001</span>
        </div>
      </div>

      {/* ============================================================
          RIGHT COLUMN: The Registration White Card
      ============================================================ */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #E5E9F2',
          boxShadow: '0 12px 36px -8px rgba(15, 23, 42, 0.05)',
          padding: '38px 42px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Header section */}
        <div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#64748B',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '4px',
            }}
          >
            CỔNG XÁC THỰC NGƯỜI DÙNG
          </span>
          <h2
            style={{
              fontSize: '25px',
              fontWeight: 800,
              color: '#0F172A',
              letterSpacing: '-0.02em',
              margin: '0 0 6px 0',
            }}
          >
            Đăng ký tài khoản
          </h2>
          <p
            style={{
              fontSize: '13px',
              color: '#64748B',
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            Khởi tạo hồ sơ định danh phân cấp để truy cập nền tảng ReWear AI.
          </p>
        </div>

        {/* Role selection */}
        <RoleSelector
          selectedRole={selectedRole}
          onSelectRole={(role) => setSelectedRole(role)}
        />

        {/* Registration form */}
        <RegisterForm role={selectedRole} />
      </div>
    </div>
  );
};

export default RegisterPage;
