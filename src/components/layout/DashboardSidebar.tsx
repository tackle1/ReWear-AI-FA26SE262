import React from 'react';
import ROUTES from '../../routes/routes.config';
import '../../styles/dashboard/DashboardSidebar.css';

export interface DashboardMenuItem {
  key: string;
  label: string;
  path: string;
  icon: React.ReactNode;
}

export interface DashboardSidebarProps {
  activeKey?: string;
  items?: DashboardMenuItem[];
  onSelect?: (key: string, item: DashboardMenuItem) => void;
  showAiNote?: boolean;
  aiNoteTitle?: string;
  aiNoteDesc?: string;
}

function MenuIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const DASHBOARD_MENU: DashboardMenuItem[] = [
  {
    key: 'dashboard',
    label: 'Bảng điều khiển',
    path: ROUTES.SELLER.DASHBOARD,
    icon: (
      <MenuIcon>
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
      </MenuIcon>
    ),
  },
  {
    key: 'listings',
    label: 'Tin đăng của tôi',
    path: ROUTES.SELLER.LISTINGS,
    icon: (
      <MenuIcon>
        <path d="M4 9.5 12 4l8 5.5" />
        <path d="M5.5 8.5V19a1 1 0 0 0 1 1H17a1 1 0 0 0 1-1V8.5" />
        <path d="M9.5 20v-6h5v6" />
      </MenuIcon>
    ),
  },
  {
    key: 'orders',
    label: 'Đơn hàng',
    path: ROUTES.SELLER.ORDERS,
    icon: (
      <MenuIcon>
        <path d="M6 3.5h12V20l-2.2-1.4-1.8 1.4-2-1.4-2 1.4L8.2 18.6 6 20V3.5Z" />
        <path d="M9 8h6M9 11.5h6M9 15h3.5" />
      </MenuIcon>
    ),
  },
  {
    key: 'messages',
    label: 'Tin nhắn',
    path: '/seller/messages',
    icon: (
      <MenuIcon>
        <path d="M4 5.5h16v10.5H9.5L4 20V5.5Z" />
      </MenuIcon>
    ),
  },
  {
    key: 'profile',
    label: 'Hồ sơ',
    path: '/seller/profile',
    icon: (
      <MenuIcon>
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="12" cy="10" r="2.8" />
        <path d="M6.8 17.2c.8-2.3 2.8-3.6 5.2-3.6s4.4 1.3 5.2 3.6" />
      </MenuIcon>
    ),
  },
];

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeKey = 'dashboard',
  items = DASHBOARD_MENU,
  onSelect,
  showAiNote = true,
  aiNoteTitle = 'Thẩm định AI',
  aiNoteDesc = 'Quy trình giám định thị giác quang học đa tầng đang kích hoạt.',
}) => {
  return (
    <aside className="rw-sidebar" aria-label="Menu bảng điều khiển">
      <div className="rw-sidebar-logo">
        <span className="rw-logo-mark" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M5 5 19 19" stroke="#22C58B" strokeWidth="3.4" strokeLinecap="round" />
            <path d="M5 19 19 5" stroke="#3B82F6" strokeWidth="3.4" strokeLinecap="round" />
          </svg>
        </span>
        <span className="rw-logo-text">
          ReWear<em>.AI</em>
        </span>
      </div>
      <nav className="rw-sidebar-nav">
        {items.map((item) => (
          <a
            key={item.key}
            href={item.path}
            onClick={(e) => {
              if (onSelect) {
                e.preventDefault();
                onSelect(item.key, item);
              }
            }}
            className={`rw-nav-item${activeKey === item.key ? ' active' : ''}`}
            aria-current={activeKey === item.key ? 'page' : undefined}
          >
            {item.icon}
            <span className="rw-label">{item.label}</span>
          </a>
        ))}
      </nav>
      {showAiNote && (
        <div className="rw-sidebar-ai-note">
          <div className="rw-ai-note-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2.8 13.7 4l2.1-.5 1 1.9 2.1.6-.2 2.1 1.4 1.6-1.4 1.6.2 2.1-2.1.6-1 1.9-2.1-.5L12 16.6 10.3 15.4l-2.1.5-1-1.9-2.1-.6.2-2.1L3.9 9.7l1.4-1.6-.2-2.1 2.1-.6 1-1.9 2.1.5L12 2.8Z" />
              <path d="m9.3 9.7 2 2 3.4-3.8" />
            </svg>
            <span>{aiNoteTitle}</span>
          </div>
          <p className="rw-ai-note-desc">{aiNoteDesc}</p>
        </div>
      )}
    </aside>
  );
};
export default DashboardSidebar;
