import React from 'react';
import { Link } from 'react-router-dom';
import ROUTES from '../../routes/routes.config';
import '../../styles/listing/ListingTopbar.css';

export interface ListingNavItem {
  key: string;
  label: string;
  path: string;
}

/** Menu điều hướng ngang của không gian người bán (Seller Studio) */
export const LISTING_NAV_ITEMS: ListingNavItem[] = [
  { key: 'dashboard', label: 'Bảng điều khiển', path: ROUTES.SELLER.DASHBOARD },
  { key: 'listings', label: 'Tin đăng của tôi', path: ROUTES.SELLER.LISTINGS },
  { key: 'orders', label: 'Đơn hàng & Ký quỹ', path: ROUTES.SELLER.ORDERS },
  { key: 'docs', label: 'Tài liệu kiểm định', path: ROUTES.SELLER.VERIFICATION_DOCS },
];

export interface ListingTopbarProps {
  avatarSrc?: string;
  brandName?: string;
  studioLabel?: string;
  activeKey?: string;
  items?: ListingNavItem[];
  regionLabel?: string;
  userName?: string;
  userMeta?: string;
  hasUnread?: boolean;
  onBack?: () => void;
  onRegionClick?: () => void;
  onNotificationClick?: () => void;
  onAvatarClick?: () => void;
}

export const ListingTopbar: React.FC<ListingTopbarProps> = ({
  avatarSrc,
  brandName = 'ReWear AI',
  studioLabel = 'SELLER STUDIO',
  activeKey = 'listings',
  items = LISTING_NAV_ITEMS,
  regionLabel = 'VND / TP. Hồ Chí Minh',
  userName = 'Mai Linh Vintage',
  userMeta = 'Cấp 1 • Đã xác thực',
  hasUnread = true,
  onBack,
  onRegionClick,
  onNotificationClick,
  onAvatarClick,
}) => {
  return (
    <header className="rw-lc-topbar">
      <div className="rw-lc-topbar-inner">
      <button type="button" className="rw-lc-back" onClick={onBack} aria-label="Quay lại">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 12H4M11 5l-7 7 7 7" />
        </svg>
      </button>

      <Link to={ROUTES.SELLER.DASHBOARD} className="rw-lc-brand">
        <span className="rw-lc-brand-mark" aria-hidden="true">
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
            <path d="M5.4 5 18.8 18.4" stroke="#0f1930" strokeWidth="3.3" strokeLinecap="round" />
            <path d="M5.4 18.4 18.8 5" stroke="#2e7cf6" strokeWidth="3.3" strokeLinecap="round" />
          </svg>
        </span>
        <span className="rw-lc-brand-text">{brandName}</span>
      </Link>

      <span className="rw-lc-studio-tag">{studioLabel}</span>

      <nav className="rw-lc-nav" aria-label="Điều hướng người bán">
        {items.map((item) => (
          <Link
            key={item.key}
            to={item.path}
            className={`rw-lc-nav-link${activeKey === item.key ? ' active' : ''}`}
            aria-current={activeKey === item.key ? 'page' : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="rw-lc-topbar-right">
        <button type="button" className="rw-lc-region" onClick={onRegionClick}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 10.2c0 5.8-8 11.6-8 11.6S4 16 4 10.2a8 8 0 1 1 16 0Z" />
            <circle cx="12" cy="10.2" r="2.8" />
          </svg>
          <span>{regionLabel}</span>
        </button>

        <button type="button" className="rw-lc-bell" aria-label="Thông báo" onClick={onNotificationClick}>
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 8.5a6 6 0 0 0-12 0c0 6.5-2.6 6.5-2.6 8.5h17.2c0-2-2.6-2-2.6-8.5" />
            <path d="M10.3 20.5a2 2 0 0 0 3.4 0" />
          </svg>
          {hasUnread && <i className="rw-lc-bell-dot" />}
        </button>

        <span className="rw-lc-vdivider" aria-hidden="true" />

        <div className="rw-lc-user">
          <div className="rw-lc-user-text">
            <b>{userName}</b>
            <span>{userMeta}</span>
          </div>
          <button type="button" className="rw-lc-avatar" onClick={onAvatarClick} aria-label={userName}>
            {avatarSrc ? (
              <img className="rw-lc-avatar-img" src={avatarSrc} alt={userName} />
            ) : (
              <span className="rw-lc-avatar-fallback" aria-hidden="true">
                {userName.charAt(0)}
              </span>
            )}
          </button>
        </div>
      </div>
      </div>
    </header>
  );
};

export default ListingTopbar;
