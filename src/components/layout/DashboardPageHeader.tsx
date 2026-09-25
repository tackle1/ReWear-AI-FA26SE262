import React from 'react';
import '../../styles/dashboard/DashboardPageHeader.css';

export interface DashboardPageHeaderProps {
  eyebrowMain?: string;
  eyebrowSub?: string;
  title?: React.ReactNode;
  description?: string;
  ctaLabel?: string;
  aiBadge?: string;
  hint?: string;
  onCreate?: () => void;
}

export const DashboardPageHeader: React.FC<DashboardPageHeaderProps> = ({
  eyebrowMain = 'BẢNG ĐIỀU KHIỂN NGƯỜI BÁN',
  eyebrowSub = 'Tổng quan & Quy trình thẩm định',
  title = (<>Bảng điều khiển người<br />bán</>),
  description = 'Tạo tin đăng thời trang xa xỉ uy tín trong vài phút. ReWear AI tự động đối soát ảnh trang phục để đánh giá chỉ số xác thực, phân loại tình trạng vải và bằng chứng vi cấu trúc trước khi niêm yết.',
  ctaLabel = 'Tạo tin đăng mới',
  aiBadge = 'AI',
  hint = 'Mất ~3 phút • Chụp ảnh theo hướng dẫn & Chẩn đoán tình trạng AI tức thì',
  onCreate,
}) => {
  return (
    <div className="rw-pagehead-card">
      <div className="rw-pagehead-breadcrumb">
        <span className="rw-crumb-main">{eyebrowMain}</span>
        <span className="rw-crumb-sep">/</span>
        <span className="rw-crumb-sub">{eyebrowSub}</span>
      </div>
      <div className="rw-pagehead-body">
        <div className="rw-pagehead-left">
          <h1 className="rw-pagehead-title">{title}</h1>
          <p className="rw-pagehead-desc">{description}</p>
        </div>
        <div className="rw-pagehead-right">
          <button type="button" className="rw-create-btn" onClick={onCreate}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <path d="M12 8v8M8 12h8" />
              <path d="m17.5 4.5 1 1L20 4l-1-1-1.5 1.5Z" />
            </svg>
            <span className="rw-plus">+</span>
            <span>{ctaLabel}</span>
            <span className="rw-ai-pill">{aiBadge}</span>
          </button>
          <p className="rw-pagehead-hint">
            <i className="rw-hint-dot" />
            <span>{hint}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPageHeader;
