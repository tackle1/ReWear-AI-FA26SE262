import React from 'react';
import '../../../styles/marketplace/MarketplaceFooter.css';

export interface MarketplaceAssuranceBannerProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const MarketplaceAssuranceBanner: React.FC<MarketplaceAssuranceBannerProps> = ({
  title = 'Cơ chế Khóa Tạm Thời 10 Phút & Quỹ ReWear Escrow',
  description = 'Tiền thanh toán được giữ an toàn tại khoản ủy thác VietQR cho đến khi bạn nhận và đối chiếu báo cáo AI.',
  actionLabel = 'Tìm hiểu ký quỹ',
  onAction,
}) => {
  return (
    <section className="rw-mkt-assurance">
      <span className="rw-mkt-assurance-icon" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3.5 12a8.5 8.5 0 1 0 2.5-6" />
          <path d="M3.5 3.5V8H8" />
          <path d="M12 7.5V12l3 2" />
        </svg>
      </span>
      <div className="rw-mkt-assurance-text">
        <b>{title}</b>
        <p>{description}</p>
      </div>
      <button type="button" className="rw-mkt-assurance-btn" onClick={onAction}>
        {actionLabel}
      </button>
    </section>
  );
};

export interface MarketplaceFooterProps {
  copyright?: string;
}

export const MarketplaceFooter: React.FC<MarketplaceFooterProps> = ({
  copyright = '© 2026 ReWear AI Vietnam Co., Ltd. Tất cả quyền được bảo lưu.',
}) => {
  return (
    <footer className="rw-mkt-footer">
      <div className="rw-mkt-footer-top">
        <div className="rw-mkt-footer-badges">
          <span className="rw-mkt-footer-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2.8 4.5 5.4v5.8c0 4.8 3.2 8.4 7.5 10.4 4.3-2 7.5-5.6 7.5-10.4V5.4L12 2.8Z" />
            </svg>
            <b>ReWear AI Escrow Protection</b>
          </span>
          <span className="rw-mkt-footer-dot" aria-hidden="true" />
          <span className="rw-mkt-footer-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M7 9.5h4M7 12.5h7M7 15.5h5" />
              <circle cx="17" cy="14.5" r="1.6" />
            </svg>
            Tiêu chuẩn giám định AI quang học độc quyền
          </span>
        </div>
        <span className="rw-mkt-footer-copy">{copyright}</span>
      </div>
      <div className="rw-mkt-footer-bottom">
        <span className="rw-mkt-footer-badge">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3.5" y="10.5" width="17" height="10.5" rx="2.5" />
            <path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5" />
          </svg>
          VietQR Smart-Escrow Secured
        </span>
        <a className="rw-mkt-footer-policy" href="#dieu-khoan-bao-chung">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3v12" />
            <path d="M7 8.5 4.5 11 7 13.5" />
            <path d="m17 8.5 2.5 2.5L17 13.5" />
            <path d="M5 17.5c1.5 1.6 4 2.5 7 2.5s5.5-.9 7-2.5" />
          </svg>
          Điều khoản bảo chứng
        </a>
      </div>
    </footer>
  );
};

export default MarketplaceFooter;
