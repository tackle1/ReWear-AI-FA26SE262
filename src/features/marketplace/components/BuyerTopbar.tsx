import React from 'react';
import { Link } from 'react-router-dom';
import ROUTES from '../../../routes/routes.config';
import '../../../styles/marketplace/BuyerTopbar.css';

export interface BuyerNavItem {
  key: string;
  label: string;
  path: string;
}

/** Menu điều hướng ngang của không gian người mua. */
export const BUYER_NAV_ITEMS: BuyerNavItem[] = [
  { key: 'explore', label: 'Khám phá', path: ROUTES.MARKETPLACE.ROOT },
  { key: 'purchases', label: 'Danh mục', path: ROUTES.BUYER.PURCHASES },
  { key: 'orders', label: 'Đơn hàng', path: ROUTES.BUYER.ORDERS },
  { key: 'messages', label: 'Tin nhắn', path: ROUTES.BUYER.MESSAGES },
];

export interface BuyerTopbarProps {
  avatarSrc?: string;
  userName?: string;
  userMeta?: string;
  studioLabel?: string;
  regionLabel?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  activeNavKey?: string;
  items?: BuyerNavItem[];
  wishlistCount?: number;
  hasUnreadNotifications?: boolean;
  hasUnreadMessages?: boolean;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: (value: string) => void;
  onWishlistClick?: () => void;
  onNotificationClick?: () => void;
  onMessageClick?: () => void;
  onRegionClick?: () => void;
  onLogout?: () => void;
}

export const BuyerTopbar: React.FC<BuyerTopbarProps> = ({
  avatarSrc,
  userName = 'Hoàng Nam',
  userMeta = 'Người mua đã xác thực',
  studioLabel = 'BUYER MARKETPLACE',
  regionLabel = 'VND / HCM City',
  searchPlaceholder = 'Tìm tên hàng, SKU, mã đơn...',
  searchValue,
  activeNavKey = 'explore',
  items = BUYER_NAV_ITEMS,
  wishlistCount = 0,
  hasUnreadNotifications = true,
  hasUnreadMessages = true,
  onSearchChange,
  onSearchSubmit,
  onWishlistClick,
  onNotificationClick,
  onMessageClick,
  onRegionClick,
  onLogout,
}) => {
  const [inner, setInner] = React.useState('');
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const logoutRef = React.useRef<HTMLButtonElement>(null);
  const value = searchValue ?? inner;

  React.useEffect(() => {
    if (!isMenuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <header className="rw-buyer-topbar">
      <div className="rw-buyer-topbar-inner">
        <Link to={ROUTES.MARKETPLACE.ROOT} className="rw-buyer-brand">
          <span className="rw-buyer-brand-mark" aria-hidden="true">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
              <path d="M5.4 5 18.8 18.4" stroke="#0f1930" strokeWidth="3.3" strokeLinecap="round" />
              <path d="M5.4 18.4 18.8 5" stroke="#2e7cf6" strokeWidth="3.3" strokeLinecap="round" />
            </svg>
          </span>
          <span className="rw-buyer-brand-text">
            <b>ReWear AI</b>
            <em>{studioLabel}</em>
          </span>
        </Link>

        <nav className="rw-buyer-nav" aria-label="Điều hướng người mua">
          {items.map((item) => (
            <Link
              key={item.key}
              to={item.path}
              className={`rw-buyer-nav-link${activeNavKey === item.key ? ' active' : ''}`}
              aria-current={activeNavKey === item.key ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="rw-buyer-search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="6" />
            <path d="m20 20-4.2-4.2" />
          </svg>
          <input
            className="rw-buyer-search-input"
            value={value}
            placeholder={searchPlaceholder}
            aria-label="Tìm kiếm sản phẩm đã xác thực"
            onChange={(e) => {
              setInner(e.target.value);
              onSearchChange?.(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSearchSubmit?.(value);
            }}
          />
        </div>

        <div className="rw-buyer-actions">
          <button
            type="button"
            className="rw-buyer-icon-btn"
            aria-label={wishlistCount > 0 ? `Danh sách yêu thích (${wishlistCount} sản phẩm)` : 'Danh sách yêu thích'}
            onClick={onWishlistClick}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 20s-7.5-4.6-7.5-10A4.5 4.5 0 0 1 12 7.4 4.5 4.5 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z" />
            </svg>
            {wishlistCount > 0 && <i className="rw-buyer-dot danger">{wishlistCount}</i>}
          </button>

          <button type="button" className="rw-buyer-icon-btn" aria-label="Thông báo" onClick={onNotificationClick}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 8.5a6 6 0 0 0-12 0c0 6.5-2.6 6.5-2.6 8.5h17.2c0-2-2.6-2-2.6-8.5" />
              <path d="M10.3 20.5a2 2 0 0 0 3.4 0" />
            </svg>
            {hasUnreadNotifications && <i className="rw-buyer-dot info" />}
          </button>

          <button type="button" className="rw-buyer-icon-btn" aria-label="Tin nhắn" onClick={onMessageClick}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 4.5H4v11h6l4 4v-4h6v-11Z" />
            </svg>
            {hasUnreadMessages && <i className="rw-buyer-dot dark" />}
          </button>

          <span className="rw-buyer-vdivider" aria-hidden="true" />

          <button type="button" className="rw-buyer-region" onClick={onRegionClick}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M3.5 9.5h17M3.5 14.5h17" />
              <path d="M12 3.5c2.4 2.4 3.6 5.3 3.6 8.5S14.4 18.1 12 20.5c-2.4-2.4-3.6-5.3-3.6-8.5S9.6 5.9 12 3.5Z" />
            </svg>
            <span>{regionLabel}</span>
          </button>

          <div className="rw-buyer-account" ref={menuRef}>
            <button
              ref={triggerRef}
              type="button"
              className="rw-buyer-account-trigger"
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              aria-controls="rw-buyer-account-menu"
              aria-label={`Mở menu tài khoản của ${userName}`}
              onClick={() => setIsMenuOpen((open) => !open)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown') {
                  event.preventDefault();
                  setIsMenuOpen(true);
                  window.requestAnimationFrame(() => logoutRef.current?.focus());
                }
              }}
            >
              <span className="rw-buyer-user-meta">
                <b>{userName}</b>
                <span className="rw-buyer-user-line">
                  <i className="rw-buyer-verified-dot" aria-hidden="true" />
                  {userMeta}
                </span>
              </span>
              <span className="rw-buyer-avatar">
                {avatarSrc ? (
                  <img className="rw-buyer-avatar-img" src={avatarSrc} alt="" />
                ) : (
                  <span className="rw-buyer-avatar-fallback" aria-hidden="true">{userName.charAt(0)}</span>
                )}
              </span>
            </button>

            {isMenuOpen && (
              <div id="rw-buyer-account-menu" className="rw-buyer-menu" role="menu" aria-label="Tùy chọn tài khoản">
                <div className="rw-buyer-menu-head" aria-hidden="true">
                  <span>Tài khoản người mua</span>
                  <strong>{userName}</strong>
                </div>
                <Link to={ROUTES.BUYER.PURCHASES} className="rw-buyer-menu-item" role="menuitem">
                  Đơn mua của tôi
                </Link>
                <Link to={ROUTES.BUYER.WISHLIST} className="rw-buyer-menu-item" role="menuitem">
                  Danh sách yêu thích
                </Link>
                <button
                  ref={logoutRef}
                  type="button"
                  className="rw-buyer-menu-item rw-buyer-logout"
                  role="menuitem"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onLogout?.();
                  }}
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};

export default BuyerTopbar;
