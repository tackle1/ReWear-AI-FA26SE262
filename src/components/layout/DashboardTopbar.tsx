import React from 'react';
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
  const [inner, setInner] = React.useState('');
  const [isAccountMenuOpen, setIsAccountMenuOpen] = React.useState(false);
  const accountMenuRef = React.useRef<HTMLDivElement>(null);
  const accountTriggerRef = React.useRef<HTMLButtonElement>(null);
  const logoutMenuItemRef = React.useRef<HTMLButtonElement>(null);
  const value = searchValue ?? inner;

  React.useEffect(() => {
    if (!isAccountMenuOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsAccountMenuOpen(false);
        accountTriggerRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isAccountMenuOpen]);

  const handleAccountButtonClick = () => {
    setIsAccountMenuOpen((isOpen) => !isOpen);
    onAvatarClick?.();
  };

  const handleLogout = () => {
    setIsAccountMenuOpen(false);
    onLogout?.();
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
        {onLogout && (
          <div className="rw-account" ref={accountMenuRef}>
            <button
              ref={accountTriggerRef}
              type="button"
              className="rw-account-trigger"
              onClick={handleAccountButtonClick}
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown') {
                  event.preventDefault();
                  setIsAccountMenuOpen(true);
                  window.requestAnimationFrame(() => logoutMenuItemRef.current?.focus());
                }
              }}
              aria-label={`Mở menu tài khoản của ${userName}`}
              aria-haspopup="menu"
              aria-expanded={isAccountMenuOpen}
              aria-controls="rw-account-menu"
            >
              <span className="rw-avatar-btn">
                {avatarSrc ? (
                  <img className="rw-avatar-img" src={avatarSrc} alt="" />
                ) : (
                  <span className="rw-avatar-fallback" aria-hidden="true">{userName.charAt(0)}</span>
                )}
              </span>
              <span className="rw-user-meta">
                <span className="rw-user-line1">
                  <b>{userName}</b>
                  <span className="rw-verified-badge">{verifiedLabel}</span>
                </span>
                <span className="rw-user-line2">{userSubtitle}</span>
              </span>
              <svg className="rw-account-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {isAccountMenuOpen && (
              <div id="rw-account-menu" className="rw-account-menu" role="menu" aria-label="Tùy chọn tài khoản">
                <div className="rw-account-menu-header" aria-hidden="true">
                  <span>Tài khoản seller</span>
                  <strong>{userName}</strong>
                </div>
                <button
                  ref={logoutMenuItemRef}
                  type="button"
                  className="rw-account-menu-item rw-logout"
                  onClick={handleLogout}
                  role="menuitem"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M10 17l5-5-5-5" />
                    <path d="M15 12H3" />
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  </svg>
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default DashboardTopbar;
