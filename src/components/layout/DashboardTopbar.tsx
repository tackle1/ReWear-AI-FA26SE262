import React, { useEffect, useRef, useState } from 'react';
import '../../styles/dashboard/DashboardTopbar.css';

export interface DashboardTopbarProps {
  avatarSrc?: string;
  userName?: string;
  verifiedLabel?: string;
  userSubtitle?: string;
  regionLabel?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  hasUnread?: boolean;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: (value: string) => void;
  onRegionClick?: () => void;
  onNotificationClick?: () => void;
  onAvatarClick?: () => void;
  onLogout?: () => void;
}

export const DashboardTopbar: React.FC<DashboardTopbarProps> = ({
  avatarSrc,
  userName = 'Mai Linh Vintage',
  verifiedLabel = 'Người bán đã xác thực',
  userSubtitle = 'Đối tác ký quỹ • Quận 1',
  regionLabel = 'VND / HCM City',
  searchPlaceholder = 'Tìm kiếm tin đăng đã xác thực, SKU, mã đơn...',
  searchValue,
  hasUnread = true,
  onSearchChange,
  onSearchSubmit,
  onRegionClick,
  onNotificationClick,
  onAvatarClick,
  onLogout,
}) => {
  const [inner, setInner] = useState('');
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const value = searchValue ?? inner;

  useEffect(() => {
    if (!isAccountMenuOpen) return;

    const handleDocumentClick = (event: MouseEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsAccountMenuOpen(false);
    };

    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isAccountMenuOpen]);

  const handleAvatarClick = () => {
    onAvatarClick?.();
    setIsAccountMenuOpen((isOpen) => !isOpen);
  };

  return (
    <header className="rw-topbar">
      <div className="rw-topbar-search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="6" />
          <path d="m20 20-4.2-4.2" />
        </svg>
        <input
          className="rw-topbar-input"
          value={value}
          placeholder={searchPlaceholder}
          onChange={(e) => {
            setInner(e.target.value);
            onSearchChange?.(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSearchSubmit?.(value);
          }}
        />
      </div>
      <div className="rw-topbar-right">
        <button type="button" className="rw-region-pill" onClick={onRegionClick}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>{regionLabel}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        <button type="button" className="rw-bell-btn" aria-label="Thông báo" onClick={onNotificationClick}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
            <path d="M10.3 21a2 2 0 0 0 3.4 0" />
          </svg>
          {hasUnread && <i className="rw-bell-dot" />}
        </button>
        <div className="rw-account-menu-wrap" ref={accountMenuRef}>
          <button
            type="button"
            className={`rw-avatar-btn${isAccountMenuOpen ? ' is-open' : ''}`}
            onClick={handleAvatarClick}
            aria-label={`Mở menu tài khoản của ${userName}`}
            aria-expanded={isAccountMenuOpen}
            aria-haspopup="menu"
          >
            {avatarSrc ? (
              <img className="rw-avatar-img" src={avatarSrc} alt={userName} />
            ) : (
              <span className="rw-avatar-fallback">{userName.charAt(0)}</span>
            )}
          </button>
          {isAccountMenuOpen && (
            <div className="rw-account-menu" role="menu" aria-label="Menu tài khoản">
              <div className="rw-account-menu-header">
                <span className="rw-account-menu-name">{userName}</span>
                <span className="rw-account-menu-subtitle">{verifiedLabel}</span>
              </div>
              <div className="rw-account-menu-divider" />
              <button
                type="button"
                className="rw-account-menu-item rw-account-menu-logout"
                role="menuitem"
                onClick={() => {
                  setIsAccountMenuOpen(false);
                  onLogout?.();
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M10 17l5-5-5-5" />
                  <path d="M15 12H3" />
                  <path d="M21 19V5a2 2 0 0 0-2-2h-5" />
                </svg>
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
        <div className="rw-user-meta">
          <div className="rw-user-line1">
            <b>{userName}</b>
            <span className="rw-verified-badge">{verifiedLabel}</span>
          </div>
          <span className="rw-user-line2">{userSubtitle}</span>
        </div>
      </div>
    </header>
  );
};

export default DashboardTopbar;
