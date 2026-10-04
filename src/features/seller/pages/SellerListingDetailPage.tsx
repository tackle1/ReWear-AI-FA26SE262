import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CircleCheck,
  CircleX,
  Info,
  Loader2,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';
import ROUTES from '../../../routes/routes.config';
import DashboardSidebar from '../../../components/layout/DashboardSidebar';
import DashboardTopbar from '../../../components/layout/DashboardTopbar';
import useCurrentUser from '../../../hooks/useCurrentUser';
import { listingApi } from '../../../services/api/listing.api';
import { ListingDetail, VisualSignal } from '../../../types/listing.type';
import useVerificationThresholds from '../../listing/hooks/useVerificationThresholds';
import '../../../styles/dashboard/DashboardTheme.css';
import '../../../styles/dashboard/SellerListingDetail.css';

/** Nhãn tiếng Việt cho `categoryId` — cùng nguồn với bảng tổng quan. */
const CATEGORY_LABELS: Record<string, string> = {
  apparel: 'Quần áo & Áo khoác',
  bags: 'Túi xách & Đồ da',
  accessories: 'Lụa & Phụ kiện',
  shoes: 'Giày dép',
};

/** Nhãn tiếng Việt cho mã phân khúc / tình trạng hàng hóa của backend. */
const SEGMENT_LABELS: Record<string, string> = {
  LUXURY: 'Hàng cao cấp',
  POPULAR: 'Thương hiệu phổ thông',
  LOCAL_NO_BRAND: 'Hàng nội địa',
  SECONDHAND: 'Đồ đã qua sử dụng',
  CLEARANCE: 'Hàng dọn kho',
};

const GENDER_LABELS: Record<string, string> = {
  MEN: 'Nam',
  WOMEN: 'Nữ',
  UNISEX: 'Unisex',
};

/**
 * Nhãn tiếng Việt cho mã hạng AI.
 *
 * Backend trả mã kỹ thuật (`GRADE_A_EXCELLENT`) — hiện thẳng ra cho seller
 * khó hiểu và dễ tưởng là lỗi dữ liệu, nên dịch sang nhãn dễ đọc.
 */
const GRADE_LABELS: Record<string, string> = {
  GRADE_S_LIKE_NEW: 'Như mới',
  GRADE_A_EXCELLENT: 'Rất tốt',
  GRADE_B_GOOD: 'Tốt',
  GRADE_C_FAIR: 'Chấp nhận được',
};

/** Nhãn tiếng Việt cho góc ảnh trong `ListingMedia`. */
const ANGLE_LABELS: Record<string, string> = {
  OVERALL: 'Toàn cảnh',
  BRAND_TAG: 'Mác thương hiệu',
  WASH_TAG: 'Mác hướng dẫn giặt',
  STITCHING_ZIPPER: 'Đường may & khóa',
  DEFECT_DETAIL: 'Chi tiết khuyết điểm',
  BILL_PHOTO: 'Hóa đơn',
};

/** Nhãn + màu cho trạng thái hồ sơ, dùng ở đầu trang và khối lý do. */
const STATUS_META: Record<
  string,
  { label: string; tone: 'ok' | 'warn' | 'bad' | 'draft' }
> = {
  ACTIVE: { label: 'Đang hiển thị trên sàn', tone: 'ok' },
  FLAGGED: { label: 'Đang chờ chuyên viên đối soát', tone: 'warn' },
  REJECTED: { label: 'Hồ sơ bị từ chối', tone: 'bad' },
  DRAFT: { label: 'Bản nháp, chưa kiểm định', tone: 'draft' },
};

const formatPrice = (price: number): string =>
  Number.isFinite(price) ? `${price.toLocaleString('vi-VN')} ₫` : '—';

const formatDateTime = (value: string | null): string => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('vi-VN', { hour12: false });
};

/** `GRADE_A_EXCELLENT` → `Rất tốt`; mã lạ thì giữ nguyên để không mất thông tin. */
const gradeLabel = (grade: string | null): string =>
  (grade && GRADE_LABELS[grade]) || grade || 'Chưa xếp hạng';

/** Dịch tên tín hiệu thị giác sang tiếng Việt; tên lạ thì giữ nguyên. */
const signalLabel = (name: string): string => {
  const key = name.trim().toLowerCase().replace(/\s+/g, '_');
  const labels: Record<string, string> = {
    /*
     * Backend đặt tên tín hiệu theo câu tiếng Anh ("Authentic Neck Tag Font &
     * Alignment"), nên `key` bên trên đã gộp khoảng trắng thành gạch dưới.
     */
    authentic_neck_tag_font_alignment: 'Tem cổ đúng chuẩn',
    wash_tag_fabric_composition_match: 'Thành phần vải khớp thông tin',
    zipper_brand_stitching_density: 'Mật độ đường may chuẩn',
    has_premium_tag: 'Có tem thương hiệu chính hãng',
    tag_quality: 'Chất lượng tem nhãn',
    stitch_quality: 'Chất lượng đường chỉ',
    fabric_feel: 'Cảm giác chất liệu',
    hardware_logo: 'Phụ kiện và logo',
    logo_shape: 'Hình dáng logo',
    fabric_texture: 'Bề mặt chất liệu',
    overall_construction: 'Tỷ lệ form dáng',
    color_fading: 'Màu không bị bạc',
  };
  return labels[key] ?? name;
};

function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'ok' | 'bad';
}) {
  return (
    <div className="rw-sld-tile">
      <span className="rw-sld-tile-label">{label}</span>
      <span className={`rw-sld-tile-value${tone ? ` is-${tone}` : ''}`}>{value}</span>
    </div>
  );
}

/**
 * TRANG CHI TIẾT HỒ SƠ CỦA NGƯỜI BÁN.
 *
 * Bảng "Tin đăng gần đây" chỉ đủ để nhận diện nhanh. Trang này gom đủ dữ
 * liệu từ ba bảng backend (`Listings` + `AiEvaluations` + `ListingMedias`)
 * qua `GET /my-listings/{id}` rồi bố trí theo hai tầng rõ ràng:
 *   1. Tổng quan  — ảnh, tên, giá, trạng thái, thuộc tính.
 *   2. Kiểm định — điểm từng tiêu chí, tín hiệu thị giác, lý do trạng thái.
 */
export const SellerListingDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { listingId = '' } = useParams<{ listingId: string }>();
  const { userId } = useCurrentUser();
  const { thresholds } = useVerificationThresholds();

  const [detail, setDetail] = useState<ListingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /** Ảnh đang xem trong bộ ảnh theo góc; mặc định là góc đầu tiên. */
  const [activeMedia, setActiveMedia] = useState(0);

  useEffect(() => {
    // Chưa đăng nhập hoặc id trên URL không hợp lệ thì không gọi API.
    if (!userId || !listingId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    listingApi
      .getMyListingDetail(listingId, userId)
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setDetail(null);

        /*
         * 404 mang hai nghĩa: tin không tồn tại, hoặc tin có thật nhưng KHÔNG
         * thuộc seller này. Backend cố tình gộp cả hai để không lộ ra việc id
         * có tồn tại hay không — vì vậy thông báo cho người dùng phải nói
         * chung chung, không nói "bạn không có quyền".
         */
        const status = (err as { response?: { status?: number } })?.response?.status;

        setError(
          status === 404
            ? 'Hồ sơ này không tồn tại hoặc không thuộc tài khoản của bạn. Vui lòng quay lại danh sách và chọn tin cần xem.'
            : err instanceof Error && err.message
              ? err.message
              : 'Không tải được hồ sơ. Vui lòng thử lại.',
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    // `cancelled` chặn setState sau khi đã rời trang (đổi URL liên tục).
    return () => {
      cancelled = true;
    };
  }, [listingId, userId]);

  /*
   * Bộ ảnh theo góc. Ưu tiên góc OVERALL để ảnh mở ra khớp với ảnh đại diện
   * mà người bán đã quen nhìn ở bảng danh sách.
   */
  const media = useMemo(() => {
    const list = detail?.media ?? [];
    const overallIndex = list.findIndex(
      (item) => item.angleType?.toUpperCase() === 'OVERALL',
    );
    return overallIndex > 0
      ? [
        list[overallIndex],
        ...list.slice(0, overallIndex),
        ...list.slice(overallIndex + 1),
      ]
      : list;
  }, [detail?.media]);

  const currentImage = media[activeMedia]?.imageUrl ?? detail?.thumbnailUrl ?? null;
  const signals: VisualSignal[] = detail?.visualSignals ?? [];

  const scoreHint =
    typeof detail?.finalAiScore !== 'number'
      ? 'Hồ sơ chưa có điểm kiểm định.'
      : `Ngưỡng tự phát hành là ${thresholds.autoPublishThreshold}%, ngưỡng tự từ chối là ${thresholds.autoRejectThreshold}%.`;

  const backToDashboard = () => navigate(ROUTES.SELLER.DASHBOARD);

  /* Khung trang dùng chung cho mọi trạng thái (loading / lỗi / nội dung). */
  const shell = (children: React.ReactNode) => (
    <div className="seller-app rw-dashboard-theme">
      <DashboardSidebar activeKey="dashboard" onSelect={(_, item) => navigate(item.path)} />
      <section className="seller-shell">
        <DashboardTopbar />
        <main className="seller-main">{children}</main>
      </section>
    </div>
  );

  if (isLoading) {
    return shell(
      <div className="rw-sld-empty" role="status">
        <Loader2 className="rw-sld-spin" width={26} height={26} aria-hidden="true" />
        <h1>Đang tải hồ sơ…</h1>
      </div>,
    );
  }

  if (error || !detail) {
    return shell(
      <div className="rw-sld-empty">
        <TriangleAlert width={28} height={28} aria-hidden="true" />
        <h1>Không tải được hồ sơ</h1>
        <p>{error ?? 'Hồ sơ không tồn tại hoặc không thuộc tài khoản của bạn.'}</p>
        <button type="button" onClick={backToDashboard}>
          Quay lại Bảng điều khiển
        </button>
      </div>,
    );
  }
  const status = STATUS_META[detail.status] ?? {
    label: detail.status,
    tone: 'draft' as const,
  };

  /*
   * Ba thanh điểm: tổng, mác, đường may. `null` khi backend chưa chấm tiêu
   * chí đó — hiện "—" thay vì 0 để không tạo cảm giác bị điểm 0.
   */
  const scoreBars = [
    { label: 'Điểm tổng thể', value: detail.finalAiScore },
    { label: 'Mác & tem nhãn', value: detail.tagLegitScore },
    { label: 'Đường may & khóa', value: detail.stitchingScore },
  ];

  return shell(
    <>
      {/* ── Tầng 1: tổng quan hồ sơ ── */}
      <section className="rw-sld-hero">
        <div className="rw-sld-gallery">
          {currentImage ? (
            <img className="rw-sld-hero-img" src={currentImage} alt={detail.title} />
          ) : (
            <div className="rw-sld-hero-img rw-sld-hero-empty" aria-hidden="true">
              <Sparkles width={30} height={30} />
            </div>
          )}

          {media.length > 1 && (
            <div className="rw-sld-thumbs" role="tablist" aria-label="Ảnh theo góc chụp">
              {media.map((item, index) => (
                <button
                  key={`${item.angleType}-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={index === activeMedia}
                  className={`rw-sld-thumb${index === activeMedia ? ' is-active' : ''}`}
                  onClick={() => setActiveMedia(index)}
                >
                  <img
                    src={item.imageUrl}
                    alt={ANGLE_LABELS[item.angleType] ?? item.angleType}
                  />
                  <span>{ANGLE_LABELS[item.angleType] ?? item.angleType}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rw-sld-hero-body">
          <div className="rw-sld-badges">
            <span className={`rw-sld-badge is-${status.tone}`}>{status.label}</span>
            {detail.brandSegment && (
              <span className="rw-sld-badge is-plain">
                {SEGMENT_LABELS[detail.brandSegment] ?? detail.brandSegment}
              </span>
            )}
          </div>

          <h1 className="rw-sld-name">{detail.title}</h1>
          <p className="rw-sld-price">{formatPrice(detail.price)}</p>

          <div className="rw-sld-tiles">
            <StatTile
              label="Điểm kiểm định"
              value={detail.finalAiScore === null ? '—' : `${detail.finalAiScore}%`}
              tone={
                detail.finalAiScore !== null &&
                  detail.finalAiScore < thresholds.autoPublishThreshold
                  ? 'bad'
                  : 'ok'
              }
            />
            <StatTile label="Hạng tình trạng" value={gradeLabel(detail.conditionGrade)} />
            <StatTile label="SKU" value={detail.skuCode} />
          </div>

          <dl className="rw-sld-specs">
            <div>
              <dt>Thương hiệu</dt>
              <dd>{detail.brand || '—'}</dd>
            </div>
            <div>
              <dt>Kích cước</dt>
              <dd>{detail.size || '—'}</dd>
            </div>
            <div>
              <dt>Màu sắc</dt>
              <dd>{detail.color || '—'}</dd>
            </div>
            <div>
              <dt>Chất liệu</dt>
              <dd>{detail.material || '—'}</dd>
            </div>
            <div>
              <dt>Giới tính</dt>
              <dd>{GENDER_LABELS[detail.gender ?? ''] ?? detail.gender ?? '—'}</dd>
            </div>
            <div>
              <dt>Hình thức</dt>
              <dd>{SEGMENT_LABELS[detail.itemType] ?? (detail.itemType || '—')}</dd>
            </div>
            <div>
              <dt>Danh mục</dt>
              <dd>{CATEGORY_LABELS[detail.categoryId] ?? detail.categoryId}</dd>
            </div>
            <div>
              <dt>Ngày đăng</dt>
              <dd>{formatDateTime(detail.createdAtIso || detail.createdAt)}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* ── Tầng 2: kết quả kiểm định AI ── */}
      <section className="rw-sld-card">
        <h2 className="rw-sld-card-title">
          <Sparkles width={17} height={17} aria-hidden="true" />
          Kết quả kiểm định AI
        </h2>

        <div className="rw-sld-bars">
          {scoreBars.map((bar) => (
            <div key={bar.label} className="rw-sld-bar-row">
              <span className="rw-sld-bar-label">{bar.label}</span>
              <div className="rw-sld-bar-track">
                <div
                  className="rw-sld-bar-fill"
                  style={{ width: `${Math.min(100, Math.max(0, bar.value ?? 0))}%` }}
                />
                {/*
                Vạch mốc ngưỡng tự phát hành. Không có nó, thanh 70% trông y
                hệt thanh 78% trong khi một bên bị đối soát, bên kia đã lên
                sàn — người đọc nhìn số thì hiểu, nhìn thanh thì không.
              */}
                {bar.value !== null && (
                  <span
                    className="rw-sld-bar-mark"
                    style={{ left: `${thresholds.autoPublishThreshold}%` }}
                    title={`Ngưỡng tự phát hành ${thresholds.autoPublishThreshold}%`}
                  />
                )}
              </div>
              <span className="rw-sld-bar-value">
                {bar.value === null ? '—' : `${bar.value}%`}
              </span>
            </div>
          ))}
        </div>

        {/* Nói rõ bằng chữ vạch đánh dấu là gì, để không phải tự đoán. */}
        <p className="rw-sld-bar-legend">
          <i /> Vạch đánh dấu: ngưỡng tự phát hành {thresholds.autoPublishThreshold}%
        </p>

        {detail.rawAiScore !== null &&
          detail.finalAiScore !== null &&
          detail.rawAiScore !== detail.finalAiScore && (
            <p className="rw-sld-note">
              Điểm gốc AI là {detail.rawAiScore}%. Sau khi{' '}
              {detail.missingBillPenaltyApplied
                ? 'trừ điểm do thiếu ảnh hóa đơn'
                : 'điều chỉnh nội bộ'}
              , điểm cuối là <strong>{detail.finalAiScore}%</strong>.
            </p>
          )}

        {signals.length > 0 && (
          <>
            <h3 className="rw-sld-subtitle">Tín hiệu thị giác</h3>
            <ul className="rw-sld-signals">
              {signals.map((signal, index) => (
                <li
                  key={`${signal.signalName}-${index}`}
                  className={`rw-sld-signal${signal.isPassed ? ' is-pass' : ' is-fail'}`}
                >
                  {signal.isPassed ? (
                    <CircleCheck width={16} height={16} aria-hidden="true" />
                  ) : (
                    <CircleX width={16} height={16} aria-hidden="true" />
                  )}
                  <div>
                    <strong>{signalLabel(signal.signalName)}</strong>
                    {signal.note && <span>{signal.note}</span>}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        {detail.statusReason && (
          <div className={`rw-sld-callout is-${status.tone}`} role="note">
            <div className="rw-sld-callout-head">
              {status.tone === 'ok' ? (
                <CircleCheck width={16} height={16} aria-hidden="true" />
              ) : status.tone === 'warn' ? (
                <TriangleAlert width={16} height={16} aria-hidden="true" />
              ) : status.tone === 'bad' ? (
                <CircleX width={16} height={16} aria-hidden="true" />
              ) : (
                <Info width={16} height={16} aria-hidden="true" />
              )}
              <strong>Lý do trạng thái</strong>
            </div>
            <p>{detail.statusReason}</p>
            <small>{scoreHint}</small>
          </div>
        )}
      </section>
    </>
  );
};

export default SellerListingDetailPage;
