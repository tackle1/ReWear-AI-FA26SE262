import React from 'react';
import { useNavigate } from 'react-router-dom';
import BuyerTopbar from '../components/BuyerTopbar';
import ROUTES from '../../../routes/routes.config';
import buyerAvatar from '../../../assets/images/seller-avatar.png';

export interface BuyerSectionPlaceholderProps {
  title: string;
  description?: string;
  activeNavKey?: string;
  icon?: string;
}

/**
 * Khung tạm cho các mục trong menu ngang của không gian người mua
 * (Đơn mua / Đơn hàng / Tài liệu / Yêu thích) khi chưa có màn hình riêng.
 */
export const BuyerSectionPlaceholder: React.FC<BuyerSectionPlaceholderProps> = ({
  title,
  description = 'Màn hình này đang được hoàn thiện trong giai đoạn tiếp theo của ReWear AI.',
  activeNavKey,
  icon = '🧾',
}) => {
  const navigate = useNavigate();

  return (
    <div className="rw-mkt-app rw-dashboard-theme">
      <BuyerTopbar
        avatarSrc={buyerAvatar}
        activeNavKey={activeNavKey}
        onLogout={() => navigate(ROUTES.AUTH.LOGIN, { replace: true })}
      />
      <main
        style={{
          flex: '1 1 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 20px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '520px',
            padding: '40px 36px',
            border: '1px solid #E6ECF6',
            borderRadius: '18px',
            background: '#FFFFFF',
            boxShadow: '0 20px 44px -32px rgba(26, 54, 93, 0.5)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '28px', marginBottom: '12px' }} aria-hidden="true">
            {icon}
          </div>
          <h1 style={{ margin: '0 0 10px', fontSize: '21px', fontWeight: 800, color: '#0F172A' }}>
            {title}
          </h1>
          <p style={{ margin: '0 0 24px', fontSize: '13.5px', lineHeight: 1.65, color: '#64748B' }}>
            {description}
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                padding: '11px 20px',
                borderRadius: '11px',
                border: '1px solid #D7DFEE',
                backgroundColor: '#FFFFFF',
                color: '#334155',
                fontFamily: 'inherit',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer',
              }}
            >
              ← Quay lại
            </button>
            <button
              type="button"
              onClick={() => navigate(ROUTES.MARKETPLACE.ROOT)}
              style={{
                padding: '11px 20px',
                borderRadius: '11px',
                border: 0,
                background: 'linear-gradient(135deg, #0B0B0F 0%, #1C2A52 60%, #2E7CF6 160%)',
                color: '#FFFFFF',
                fontFamily: 'inherit',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer',
              }}
            >
              Về trang khám phá
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BuyerSectionPlaceholder;
