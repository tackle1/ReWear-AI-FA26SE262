import React from 'react';
import '../../styles/dashboard/DashboardStats.css';

export interface StatPill { text: string; dot?: boolean; }
export interface DashboardStatItem {
  key: string;
  label: string;
  value: string;
  unit?: string;
  icon: React.ReactNode;
  footPill?: StatPill;
  footText?: string;
  footLead?: string;
}

function StatIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

/**
 * Icon cho từng thẻ số liệu.
 *
 * Tách riêng khỏi dữ liệu vì đây là phần trình bày, không phải số liệu — giá trị
 * của thẻ phải do trang cha truyền vào từ dữ liệu thật.
 */
export const SELLER_STAT_ICONS: Record<string, React.ReactNode> = {
  active: (<StatIcon><path d="M12 4 8.5 8H4l8-5 8 5h-4.5L12 4Z" /><path d="M7 8.5 5.5 20h13L17 8.5" /><path d="M9.5 20v-5h5v5" /></StatIcon>),
  aiRate: (<StatIcon><path d="M12 3 5 5.8v5.4c0 4.4 3 8 7 9.8 4-1.8 7-5.4 7-9.8V5.8L12 3Z" /><path d="m9.3 11.6 2 2 3.4-3.8" /></StatIcon>),
  escrow: (<StatIcon><rect x="3.5" y="4.5" width="17" height="13" rx="2.5" /><path d="M3.5 9.5h17" /><path d="M7 14.5h4" /></StatIcon>),
  queue: (<StatIcon><rect x="3.5" y="4" width="17" height="12.5" rx="2.5" /><circle cx="9" cy="10" r="2" /><path d="M5.8 14.5c.5-1.4 1.6-2.2 3.2-2.2s2.7.8 3.2 2.2" /><path d="M14.5 9.5h3M14.5 12h3" /><path d="M9 19.5h11" /></StatIcon>),
};

export interface DashboardStatsProps {
  items: DashboardStatItem[];
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ items }) => {
  return (
    <div className="rw-stats-grid">
      {items.map((s) => (
        <div className="rw-stat-card" key={s.key}>
          <div className="rw-stat-top">
            <span className="rw-stat-label">{s.label}</span>
            <span className="rw-stat-icon">{s.icon}</span>
          </div>
          <div className="rw-stat-value">
            {s.value}
            {s.unit && <span className="rw-stat-unit">{s.unit}</span>}
            {s.key === 'queue' && s.footText && <span className="rw-stat-inline-sub"> {s.footText}</span>}
          </div>
          <div className="rw-stat-foot">
            {s.key === 'escrow' ? (
              <span className="rw-stat-escrow-line">{s.footLead && <b>{s.footLead} </b>}{s.footText}</span>
            ) : s.key === 'queue' ? (
              s.footPill && <span className="rw-stat-pill">{s.footPill.dot && <i />} {s.footPill.text}</span>
            ) : (
              <><span className="rw-stat-pill">{s.footPill?.text}</span><span className="rw-stat-foot-text"> {s.footText}</span></>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
