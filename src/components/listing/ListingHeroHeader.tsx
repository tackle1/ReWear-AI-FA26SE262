import React from 'react';
import '../../styles/listing/ListingHeroHeader.css';

export interface ListingHeroHeaderProps {
  badgeLabel?: string;
  /** Số bước đã pad, ví dụ "01" */
  stepNumber?: string;
  /** Tiêu đề bước, ví dụ "Thông tin sản phẩm" */
  stepTitle?: string;
  description?: string;
  modelEyebrow?: string;
  modelName?: string;
  onModelClick?: () => void;
  showModel?: boolean;
}

export const ListingHeroHeader: React.FC<ListingHeroHeaderProps> = ({
  badgeLabel = 'HỒ SƠ NHẬN DIỆN AI V4.2 KHỞI ĐỘNG',
  stepNumber = '01',
  stepTitle = 'Thông tin sản phẩm',
  description = 'Nhập các thông số cốt lõi và dữ liệu tham chiếu để hệ thống AI kích hoạt mô hình đối sánh quang học trước khi sang Bước 02 (Chụp ảnh).',
  modelEyebrow = 'MODEL CẦN CHIẾU',
  modelName = "Burberry Archive Heritage '24",
  onModelClick,
  showModel = true,
}) => {
  return (
    <header className={`rw-lc-herohead${stepNumber === '02' ? ' rw-lc-herohead-capture' : ''}`}>
      <div className="rw-lc-herohead-left">
        <span className="rw-lc-herohead-badge">
          <i className="rw-lc-herohead-dot" aria-hidden="true" />
          {stepNumber === '02' ? 'BƯỚC 02 TRONG 06 • QUY TRÌNH KIỂM ĐỊNH AI & NIÊM YẾT' : badgeLabel}
        </span>
        <h1 className="rw-lc-herohead-title">
          Bước {stepNumber}: {stepTitle}
        </h1>
        <p className="rw-lc-herohead-desc">{description}</p>
      </div>

      {showModel && <button type="button" className="rw-lc-herohead-model" onClick={onModelClick}>
        <span className="rw-lc-herohead-model-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="6" rx="7.2" ry="2.9" />
            <path d="M4.8 6v12c0 1.6 3.22 2.9 7.2 2.9s7.2-1.3 7.2-2.9V6" />
            <path d="M4.8 12c0 1.6 3.22 2.9 7.2 2.9s7.2-1.3 7.2-2.9" />
          </svg>
        </span>
        <span className="rw-lc-herohead-model-text">
          <span className="rw-lc-herohead-model-eyebrow">{modelEyebrow}</span>
          <span className="rw-lc-herohead-model-name">{modelName}</span>
        </span>
      </button>}
    </header>
  );
};

export default ListingHeroHeader;
