import React from 'react';
import {
  AlertTriangle,
  CircleCheck,
  Clock3,
  Flag,
  Search,
  ShieldQuestion,
  UserCheck,
} from 'lucide-react';
import { formatConfidence } from './ListingPublishStep';
/*
 * Style nằm trong `ListingCreate.css` cùng bộ khung `rw-lc-*` của trang, nên
 * import chung một file thay vì tạo CSS riêng trùng lặp phần khai báo.
 */
import '../../styles/listing/ListingCreate.css';

export interface ListingFlagReviewProps {
  image?: string;
  name?: string;
  brand?: string;
  sku?: string;
  price?: string;
  /** Điểm THẬT Bước 05 trả về — hiển thị nguyên vẹn, không làm tròn. */
  confidence?: number;
  /** Ngưỡng từ chối (50) và ngưỡng đăng (75) — để giải thích vì sao cần duyệt. */
  autoRejectThreshold?: number;
  autoPublishThreshold?: number;
  /** true nếu hồ sơ bị trừ điểm vì thiếu hóa đơn. */
  billPenaltyApplied?: boolean;
  /** true nếu backend đã xác nhận tạo tin với trạng thái FLAGGED. */
  isFlagged?: boolean;
  listingId?: string | null;
  /** Trạng thái backend trả về khi khác `FLAGGED`. */
  actualStatus?: string | null;
}

/**
 * THẺ "GẮN CỜ — CHỜ ĐỐI SOÁT" cho trang gắn cờ.
 *
 * Vì sao TÁCH riêng, không dùng lại `ListingPublishStep`: component đó mô tả
 * trạng thái ĐÃ ĐƯỢC PHÁT HÀNH (kích hoạt ký quỹ, gian ngân 48h, thẻ tin hiển
 * thị trên sàn, badge "AI VERIFIED"). Hồ sơ ở nhánh 50–75% chưa được phát hành
 * — chỉ đang CHỜ chuyên viên — nên dùng nhầm sẽ khiến người bán tưởng tin đã
 * lên sàn.
 */
export const ListingFlagReview: React.FC<ListingFlagReviewProps> = ({
  image,
  name,
  brand,
  sku,
  price,
  confidence,
  autoRejectThreshold = 50,
  autoPublishThreshold = 75,
  billPenaltyApplied = false,
  isFlagged = false,
  listingId,
  actualStatus,
}) => {
  const hasConfidence = typeof confidence === 'number' && Number.isFinite(confidence);
  /* Giữ nguyên độ chính xác backend trả về — KHÔNG làm tròn. */
  const score = hasConfidence ? formatConfidence(confidence!) : null;
  const displayName = name?.trim() || 'Sản phẩm chưa đặt tên';
  const displayBrand = brand?.trim() || '—';
  const displaySku = sku?.trim() || '—';
  const displayPrice = price?.trim() || '—';

  return (
    <section className="rw-flag-review-card" aria-label="Trạng thái gắn cờ chờ đối soát">
      <header className={`rw-flag-review-banner${isFlagged ? ' is-sent' : ''}`}>
        <span className="rw-flag-review-banner-icon">
          {isFlagged ? (
            <CircleCheck width={22} height={22} aria-hidden="true" />
          ) : (
            <Flag width={22} height={22} aria-hidden="true" />
          )}
        </span>
        <div>
          <small>
            {isFlagged ? 'ĐÃ GỬN HỒ SƠ · TRẠNG THÁI FLAGGED' : 'CHỜ GỬI HỒ SƠ'}
          </small>
          <strong>
            {isFlagged
              ? 'Tin đăng đã được tạo và đang chờ chuyên viên đối soát'
              : 'Tin chưa được phát hành — cần chuyên viên đối soát trước'}
          </strong>
          {actualStatus && actualStatus !== 'FLAGGED' && (
            <em>
              Lưu ý: hệ thống trả trạng thái “{actualStatus}” khác dự kiến
              “FLAGGED”.
            </em>
          )}
          {listingId && <em>Mã tin đăng: {listingId}</em>}
        </div>
      </header>
      <div className="rw-flag-review-score">
        <div className="rw-flag-review-score-main">
          <span>Điểm kiểm định</span>
          <strong>{score !== null ? `${score}%` : 'Chưa có'}</strong>
          {/*
            Nêu rõ vùng điểm để người bán hiểu vì sao bị gắn cờ: đạt ngưỡng
            tối thiểu (để không bị từ chối) nhưng chưa đủ điểm đăng thẳng.
          */}
          <em>
            ≥ {autoRejectThreshold}% (đủ điều kiện xét) nhưng &lt;{' '}
            {autoPublishThreshold}% (chưa đủ điểm đăng ngay)
          </em>
        </div>
        <ul className="rw-flag-review-reasons">
          <li>
            <AlertTriangle width={15} height={15} aria-hidden="true" />
            Điểm chưa đạt ngưỡng đăng tin tự động ({autoPublishThreshold}%), nên
            hệ thống không tự phát hành.
          </li>
          {billPenaltyApplied && (
            <li>
              <AlertTriangle width={15} height={15} aria-hidden="true" />
              Hồ sơ bị trừ điểm vì chưa tải ảnh hóa đơn — bổ sung hóa đơn ở Bước 01
              có thể nâng điểm.
            </li>
          )}
          <li>
            <ShieldQuestion width={15} height={15} aria-hidden="true" />
            Chuyên viên sẽ đối chiếu ảnh, tem mác và hóa đơn trước khi quyết định
            phát hành.
          </li>
        </ul>
      </div>
      <article className="rw-flag-review-product">
        {image && <img src={image} alt={displayName} loading="lazy" />}
        <div>
          <small>{displayBrand}</small>
          <h3>{displayName}</h3>
          <dl>
            <div>
              <dt>Mã SKU</dt>
              <dd>{displaySku}</dd>
            </div>
            <div>
              <dt>Giá niêm yết</dt>
              <dd>{displayPrice}</dd>
            </div>
          </dl>
        </div>
      </article>

      <ol className="rw-flag-review-timeline">
        <li>
          <span><Flag width={16} height={16} aria-hidden="true" /></span>
          <p>
            <b>Gắn cờ hồ sơ</b>
            <small>Hệ thống đánh dấu tin chờ đối soát, chưa hiển thị công khai.</small>
          </p>
        </li>
        <li>
          <span><Search width={16} height={16} aria-hidden="true" /></span>
          <p>
            <b>Chuyên viên đối chiếu</b>
            <small>Kiểm tra ảnh, tem mác và hóa đơn trong khoảng 24–48 giờ.</small>
          </p>
        </li>
        <li>
          <span><UserCheck width={16} height={16} aria-hidden="true" /></span>
          <p>
            <b>Phát hành hoặc từ chối</b>
            <small>Kết quả gửi lại tài khoản; bị từ chối thì chụp lại ảnh rồi thử lại.</small>
          </p>
        </li>
      </ol>

      <p className="rw-flag-review-footnote">
        <Clock3 width={14} height={14} aria-hidden="true" />
        Bảo vệ ReWear Smart-Escrow chỉ được kích hoạt SAU khi tin được phát hành.
      </p>
    </section>
  );
};

export default ListingFlagReview;