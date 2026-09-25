import React from 'react';
import { AuthRole } from '../types/auth.type';

export interface RoleSelectorProps {
  selectedRole: AuthRole;
  onSelectRole: (role: AuthRole) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ selectedRole, onSelectRole }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
          Bạn muốn sử dụng ReWear AI với vai trò <span style={{ color: '#EF4444' }}>*</span>
        </span>
        <span style={{ fontSize: '12px', color: '#64748B' }}>
          {selectedRole === 'SELLER' ? 'Người bán được chọn' : 'Người mua được chọn'}
        </span>
      </div>

      {/* Two role cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '14px',
          width: '100%',
        }}
      >
        {/* Card 1: Người mua */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onSelectRole('BUYER')}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectRole('BUYER')}
          style={{
            position: 'relative',
            backgroundColor: selectedRole === 'BUYER' ? '#DCE8FA' : '#EDF3FE',
            border: selectedRole === 'BUYER' ? '1.5px solid #2563EB' : '1.5px solid transparent',
            borderRadius: '14px',
            padding: '16px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            transition: 'all 0.2s ease',
            boxSizing: 'border-box',
          }}
        >
          {/* Top icon and checkmark badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: selectedRole === 'BUYER' ? '#000000' : 'rgba(255, 255, 255, 0.9)',
                color: selectedRole === 'BUYER' ? '#FFFFFF' : '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>

            {selectedRole === 'BUYER' && (
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: '#000000',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 'bold',
                }}
              >
                ✓
              </div>
            )}
          </div>

          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
              Người mua
            </div>
            <div
              style={{
                fontSize: '10.5px',
                fontWeight: 700,
                color: '#64748B',
                letterSpacing: '0.04em',
                marginTop: '1px',
              }}
            >
              CUSTOMER ACCOUNT
            </div>
          </div>

          <p
            style={{
              fontSize: '11.5px',
              lineHeight: '1.45',
              color: '#475569',
              margin: 0,
            }}
          >
            Khám phá & mua sắm thời trang hàng hiệu đã qua kiểm định quang học.
          </p>
        </div>

        {/* Card 2: Người bán */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onSelectRole('SELLER')}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectRole('SELLER')}
          style={{
            position: 'relative',
            backgroundColor: selectedRole === 'SELLER' ? '#DCE8FA' : '#EDF3FE',
            border: selectedRole === 'SELLER' ? '1.5px solid #2563EB' : '1.5px solid transparent',
            borderRadius: '14px',
            padding: '16px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            transition: 'all 0.2s ease',
            boxSizing: 'border-box',
          }}
        >
          {/* Top icon and checkmark badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: selectedRole === 'SELLER' ? '#000000' : 'rgba(255, 255, 255, 0.9)',
                color: selectedRole === 'SELLER' ? '#FFFFFF' : '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9h18l-1.5-5h-15L3 9Z" />
                <path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9" />
                <path d="M9 20v-6h6v6" />
                <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
              </svg>
            </div>

            {selectedRole === 'SELLER' && (
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: '#000000',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 'bold',
                }}
              >
                ✓
              </div>
            )}
          </div>

          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
              Người bán
            </div>
            <div
              style={{
                fontSize: '10.5px',
                fontWeight: 700,
                color: '#64748B',
                letterSpacing: '0.04em',
                marginTop: '1px',
              }}
            >
              PROVIDER / SELLER
            </div>
          </div>

          <p
            style={{
              fontSize: '11.5px',
              lineHeight: '1.45',
              color: '#475569',
              margin: 0,
            }}
          >
            Đăng tin bán hàng, thẩm định AI và nhận tiền tự động qua Escrow bảo vệ.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;
