import React from 'react';
import LoginForm from '../components/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.05fr',
        gap: '56px',
        width: '100%',
        alignItems: 'center',
      }}
      className="rewear-login-grid"
    >
      <style>{`
        @media (max-width: 1024px) {
          .rewear-login-grid {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
          }
        }
      `}</style>

      {/* ============================================================
          LEFT COLUMN — Brand messaging & features
      ============================================================ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

        {/* Badge */}
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '5px 13px',
              borderRadius: '9999px',
              backgroundColor: '#EDF3FE',
              fontSize: '11px',
              fontWeight: 700,
              color: '#1D4ED8',
              letterSpacing: '0.04em',
            }}
          >
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2563EB' }} />
            <span>ĐÃ XÁC THỰC HƠN 12.000+ SẢN PHẨM HÀNG HIỆU</span>
          </div>
        </div>

        {/* Logo mark + sub-headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Shield icon */}
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '9px',
                backgroundColor: '#EDF3FE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1D4ED8',
                flexShrink: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                ReWear AI
              </div>
              <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#64748B', letterSpacing: '0.1em' }}>
                CUSTODIAL RESALE INFRASTRUCTURE
              </div>
            </div>
          </div>
        </div>

        {/* Main headline */}
        <h1
          style={{
            fontSize: '33px',
            fontWeight: 800,
            lineHeight: 1.22,
            color: '#0F172A',
            letterSpacing: '-0.025em',
            margin: 0,
          }}
        >
          Nền tảng giao dịch thời trang thứ cấp tích hợp AI & Bảo chứng Escrow
        </h1>

        {/* Supporting text */}
        <p style={{ fontSize: '13.5px', lineHeight: 1.6, color: '#475569', margin: 0 }}>
          Hạ tầng số định chuẩn hóa quy trình thẩm định vật lý và giám định quang học thời gian thực, kết hợp cơ chế ký quỹ đa phương tối ưu cho thị trường Việt Nam.
        </p>

        {/* Three Feature Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '14px',
          }}
          className="login-feature-grid"
        >
          <style>{`
            @media (max-width: 768px) {
              .login-feature-grid {
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>

          {/* Card: Thẩm định thị giác AI */}
          <div
            style={{
              padding: '16px',
              backgroundColor: '#EDF3FE',
              borderRadius: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563EB',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>
              Thẩm định thị giác AI
            </div>
            <div style={{ fontSize: '11.5px', color: '#475569', lineHeight: 1.45 }}>
              Đối soát độ sắc nét, cấu trúc thớ vải, viên chỉ may và tem nhãn chuẩn bảo tàng.
            </div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#2563EB', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              99.4% Độ chính xác{' '}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="7 17 17 7" /><polyline points="7 7 17 7 17 17" />
              </svg>
            </div>
          </div>

          {/* Card: Ký quỹ Smart-Escrow */}
          <div
            style={{
              padding: '16px',
              backgroundColor: '#EDF3FE',
              borderRadius: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563EB',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="21" x2="21" y2="21" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <polyline points="5 6 12 3 19 6" />
                <line x1="4" y1="10" x2="4" y2="21" />
                <line x1="20" y1="10" x2="20" y2="21" />
              </svg>
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>
              Ký quỹ Smart-Escrow
            </div>
            <div style={{ fontSize: '11.5px', color: '#475569', lineHeight: 1.45 }}>
              Đóng băng nguồn vốn minh bạch tại ngân hàng đối tác cho đến khi khách mở kiện.
            </div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#2563EB', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              Bảo chứng 100% đồng tiền{' '}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="7 17 17 7" /><polyline points="7 7 17 7 17 17" />
              </svg>
            </div>
          </div>

          {/* Card: Minh bạch dữ liệu */}
          <div
            style={{
              padding: '16px',
              backgroundColor: '#EDF3FE',
              borderRadius: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563EB',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>
              Minh bạch dữ liệu
            </div>
            <div style={{ fontSize: '11.5px', color: '#475569', lineHeight: 1.45 }}>
              Báo cáo tỷ lệ tin cậy quang sai micro-laser, thét tiêu nguy cơ trao hàng hoàn trả.
            </div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#2563EB', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              Pháp chứng tự động{' '}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="7 17 17 7" /><polyline points="7 7 17 7 17 17" />
              </svg>
            </div>
          </div>
        </div>

        {/* ISO Bottom note */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#EDF3FE',
            borderRadius: '9999px',
            padding: '7px 16px',
            width: 'fit-content',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', letterSpacing: '0.04em' }}>
            TIÊU CHUẨN GIÁM ĐỊNH ISO/IEC 17025 PHÂN TÍCH QUANG HỌC DỆT MAY
          </span>
        </div>
      </div>

      {/* ============================================================
          RIGHT COLUMN — White Login Card
      ============================================================ */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '22px',
          border: '1px solid #E5E9F2',
          boxShadow: '0 8px 32px -8px rgba(15, 23, 42, 0.06)',
          padding: '36px 40px',
          display: 'flex',
          flexDirection: 'column',
          gap: '22px',
        }}
      >
        {/* Card header */}
        <div>
          {/* Portal badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              marginBottom: '16px',
            }}
          >
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#2563EB' }} />
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em' }}>
              Cổng Định Danh Đối Tác & Khách Hàng
            </span>
          </div>

          <h2
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#0F172A',
              letterSpacing: '-0.02em',
              margin: '0 0 6px 0',
            }}
          >
            Đăng nhập
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: 1.45 }}>
            Đăng nhập để tiếp tục sử dụng hệ sinh thái ReWear AI
          </p>
        </div>

        {/* The form */}
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
