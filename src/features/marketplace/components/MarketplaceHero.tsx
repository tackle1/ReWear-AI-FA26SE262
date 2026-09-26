import React from 'react';
import '../../../styles/marketplace/MarketplaceHero.css';

export interface MarketplaceHeroProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  matchRateLabel?: string;
  matchRate?: string;
}

export const MarketplaceHero: React.FC<MarketplaceHeroProps> = ({
  eyebrow = 'REWEAR FORENSIC CATALOGUE',
  title = 'Khám phá sản phẩm',
  description = 'Tìm kiếm và khám phá các sản phẩm đã được phân tích bằng AI qua quang học bề mặt & mã hóa lưu trữ ký quỹ.',
  matchRateLabel = 'MỨC TIN CẬY SẴN TB',
  matchRate = '93.8% Match Rate',
}) => {
  return (
    <section className="rw-mkt-hero">
      <div className="rw-mkt-hero-left">
        <p className="rw-mkt-eyebrow">
          <i className="rw-mkt-eyebrow-dot" aria-hidden="true" />
          <span>{eyebrow}</span>
        </p>
        <h1 className="rw-mkt-title">{title}</h1>
        <p className="rw-mkt-desc">{description}</p>
      </div>

      <div className="rw-mkt-hero-right">
        <div className="rw-mkt-match-card">
          <span className="rw-mkt-match-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 18V9M10 18V5M16 18v-6M22 18H2" />
            </svg>
          </span>
          <div className="rw-mkt-match-text">
            <span className="rw-mkt-match-label">{matchRateLabel}</span>
            <strong className="rw-mkt-match-value">{matchRate}</strong>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketplaceHero;
