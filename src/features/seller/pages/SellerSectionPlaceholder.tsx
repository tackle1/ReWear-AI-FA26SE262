import React from 'react';
import ROUTES from '../../../routes/routes.config';
import { LISTING_NAV_ITEMS } from '../../../components/listing/ListingTopbar';
import type { ListingNavItem } from '../../../components/listing/ListingTopbar';

export interface SellerSectionPlaceholderProps {
  title: string;
  description?: string;
  activeKey?: string;
}

/**
 * Shell tạm cho các mục trong menu ngang của không gian người bán
 * (Tin đăng của tôi / Đơn hàng & Ký quỹ / Tài liệu kiểm định) khi chưa có màn hình riêng.
 */
export const SellerSectionPlaceholder: React.FC<SellerSectionPlaceholderProps> = ({
  title,
  description = 'Màn hình này đang được hoàn thiện trong giai đoạn tiếp theo của ReWear AI.',
  activeKey,
}) => {
  const active: ListingNavItem | undefined = LISTING_NAV_ITEMS.find(
    (item) => item.key === activeKey || item.label === title
  );

  return (
    <div
      className="rw-dashboard-theme"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        background: 'linear-gradient(180deg, #f7faff 0%, #f3f6fc 100%)',
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E6ECF6',
          borderRadius: '18px',
          padding: '40px 36px',
          maxWidth: '520px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 44px -32px rgba(26, 54, 93, 0.5)',
        }}
      >
        <div style={{ fontSize: '28px', marginBottom: '12px' }} aria-hidden="true">
          🧵
        </div>
        <h1 style={{ fontSize: '21px', fontWeight: 800, color: '#0F172A', margin: '0 0 10px' }}>{title}</h1>
        <p style={{ fontSize: '13.5px', lineHeight: 1.65, color: '#64748B', margin: '0 0 24px' }}>{description}</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href={active ? active.path : ROUTES.SELLER.DASHBOARD}
            onClick={(e) => {
              e.preventDefault();
              window.history.back();
            }}
            style={{
              display: 'inline-block',
              padding: '11px 20px',
              borderRadius: '11px',
              border: '1px solid #D7DFEE',
              backgroundColor: '#FFFFFF',
              color: '#334155',
              fontWeight: 700,
              fontSize: '13.5px',
              textDecoration: 'none',
            }}
          >
            ← Quay lại
          </a>
          <a
            href={ROUTES.SELLER.DASHBOARD}
            style={{
              display: 'inline-block',
              padding: '11px 20px',
              borderRadius: '11px',
              background: 'linear-gradient(135deg, #0B0B0F 0%, #1C2A52 60%, #2E7CF6 160%)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '13.5px',
              textDecoration: 'none',
            }}
          >
            Về Bảng điều khiển
          </a>
        </div>
      </div>
    </div>
  );
};

export default SellerSectionPlaceholder;
