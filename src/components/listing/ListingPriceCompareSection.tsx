import React from 'react';
import { formatCurrencyVND } from '../../utils/formatters';
import '../../styles/listing/ListingForm.css';

export interface ListingPriceCompareSectionProps {
  title?: string;
  sub?: string;
  /** Giá người bán đang niêm yết */
  listingPrice?: number;
  /** Giá trung bình của các sản phẩm tương tự trên thị trường */
  marketAverage?: number;
  trendTitle?: string;
  trendDesc?: string;
  trendActionLabel?: string;
  onRefreshTrend?: () => void;
}

/** Biểu đồ cột mini mô phỏng biến động giá thị trường 8 tuần gần nhất */
const TREND_BARS = [42, 58, 36, 64, 50, 74, 62, 88];

export const ListingPriceCompareSection: React.FC<ListingPriceCompareSectionProps> = ({
  title = 'Giá niêm yết hiện tại (để đối chiếu)',
  sub = 'Giá niêm yết của các sản phẩm tương tự trên thị trường giúp bạn định giá hợp lý và tăng tốc độ duyệt hồ sơ.',
  listingPrice = 8550000,
  marketAverage = 8202000,
  trendTitle = 'Phân tích biến động giá thị trường',
  trendDesc = 'Mức giá tương tự đang dao động quanh vùng 7.9 - 8.9 triệu ₫ trong 8 tuần gần nhất.',
  trendActionLabel = 'Cập nhật giá tốt nhất thị trường',
  onRefreshTrend,
}) => {
  return (
    <section className="rw-lc-card">
      <div className="rw-lc-card-head">
        <div>
          <h2 className="rw-lc-card-title">{title}</h2>
          <p className="rw-lc-card-sub">{sub}</p>
        </div>
      </div>

      <div className="rw-lc-price-grid">
        <div>
          <div className="rw-lc-price-stats">
            <div className="rw-lc-price-stat">
              <span>Giá niêm yết của bạn</span>
              <b>{formatCurrencyVND(listingPrice)}</b>
            </div>
            <div className="rw-lc-price-stat hint">
              <span>Giá trung bình thị trường</span>
              <b>{formatCurrencyVND(marketAverage)}</b>
            </div>
          </div>
          <div className="rw-lc-bars" aria-hidden="true">
            {TREND_BARS.map((height, index) => (
              <span
                key={`${height}-${index}`}
                className={`rw-lc-bar${height > 78 ? ' hot' : ''}`}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>

        <div className="rw-lc-trend">
          <h4>{trendTitle}</h4>
          <p>{trendDesc}</p>
          <button type="button" className="rw-lc-trend-btn" onClick={onRefreshTrend}>
            {trendActionLabel}
          </button>
        </div>
      </div>
    </section>
  );
};

export default ListingPriceCompareSection;
