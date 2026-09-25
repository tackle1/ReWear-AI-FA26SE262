import React, { useState } from 'react';
import '../../styles/listing/ListingConditionSection.css';

export type ConditionFootIcon = 'check' | 'shield';

export interface ConditionOption {
  key: string;
  title: string;
  badge: string;
  desc: string;
  footIcon: ConditionFootIcon;
  footText: string;
}

export interface ListingConditionSectionProps {
  title?: string;
  sub?: string;
  actionLabel?: string;
  options?: ConditionOption[];
  value?: string;
  onChange?: (key: string) => void;
  /** Tên nhóm radio, đổi nếu render nhiều lần trên cùng trang */
  groupName?: string;
}

const FootIcon: React.FC<{ name: ConditionFootIcon }> = ({ name }) => {
  if (name === 'shield') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3l7 2.6v5.3c0 4.3-2.9 8-7 9.1-4.1-1.1-7-4.8-7-9.1V5.6L12 3Z" />
        <path d="m9.2 12 2.1 2.1 3.9-4.3" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="8.6" />
      <path d="m8.6 12.2 2.4 2.4 4.4-4.9" />
    </svg>
  );
};

export const CONDITION_OPTIONS: ConditionOption[] = [
  {
    key: 'clearance',
    title: 'Hàng thanh lý',
    badge: 'CHƯA QUA SỬ DỤNG',
    desc: 'Sản phẩm mới chưa qua sử dụng. Không yêu cầu khai báo lịch sử sử dụng, condition mặc định Like New.',
    footIcon: 'check',
    footText: 'Bỏ qua khai báo mòn vải & phục hồi',
  },
  {
    key: 'secondhand',
    title: 'Hàng Secondhand',
    badge: 'ĐÃ QUA SỬ DỤNG',
    desc: 'Sản phẩm đã qua sử dụng, yêu cầu khai báo quá trình sử dụng và phải đạt ngưỡng Condition tối thiểu',
    footIcon: 'shield',
    footText: 'Khai báo độ mòn & kiểm tra ngưỡng Good',
  },
];

export const ListingConditionSection: React.FC<ListingConditionSectionProps> = ({
  title = 'Phân loại hình thức sản phẩm',
  sub = 'Chọn loại hàng để hệ thống cấu hình chuẩn xác quy tắc kiểm định',
  actionLabel = 'Bước 1 cốt lõi',
  options = CONDITION_OPTIONS,
  value,
  onChange,
  groupName = 'rw-listing-condition-type',
}) => {
  const [inner, setInner] = useState('clearance');
  const selected = value ?? inner;

  const select = (key: string) => {
    setInner(key);
    onChange?.(key);
  };

  return (
    <section className="rw-lc-card rw-lc-cat">
      <div className="rw-lc-cat-head">
        <span className="rw-lc-cat-head-icon" aria-hidden="true">
          <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
            <rect x="9.4" y="2.6" width="5.2" height="4.8" rx="1.2" />
            <rect x="2.6" y="16.6" width="5.2" height="4.8" rx="1.2" />
            <rect x="16.2" y="16.6" width="5.2" height="4.8" rx="1.2" />
            <path d="M12 7.4v4.2M5.2 16.6v-5h13.6v5" />
          </svg>
        </span>
        <div className="rw-lc-cat-head-text">
          <h2 className="rw-lc-cat-title">{title}</h2>
          <p className="rw-lc-cat-sub">{sub}</p>
        </div>
        <span className="rw-lc-cat-pill">{actionLabel}</span>
      </div>

      <div className="rw-lc-cat-grid" role="radiogroup" aria-label={title}>
        {options.map((opt) => {
          const isActive = selected === opt.key;
          return (
            <label key={opt.key} className={`rw-lc-cat-opt${isActive ? ' active' : ''}`}>
              <input
                type="radio"
                className="rw-lc-cat-input"
                name={groupName}
                value={opt.key}
                checked={isActive}
                onChange={() => select(opt.key)}
              />
              <span className="rw-lc-cat-opt-top">
                <span className="rw-lc-cat-radio" aria-hidden="true" />
                <span className="rw-lc-cat-opt-title">{opt.title}</span>
                <span className="rw-lc-cat-tag">{opt.badge}</span>
              </span>
              <span className="rw-lc-cat-desc">{opt.desc}</span>
              <span className="rw-lc-cat-foot">
                <FootIcon name={opt.footIcon} />
                <span>{opt.footText}</span>
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
};

export default ListingConditionSection;
