import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ScanLine,
  Cpu,
  ImageOff,
  ZoomIn,
  CheckCheck,
  Circle,
} from 'lucide-react';
import coatImage from '../../assets/images/Burberry-Trench-Coat-full.png';
import labelImage from '../../assets/images/Burberry-Brand-Label.png';
import fabricImage from '../../assets/images/Burberry-Check-Pattern-Detail.png';
import buttonImage from '../../assets/images/Burberry-Buckle-Button-Detail.png';
import stitchImage from '../../assets/images/Burberry-Stitching-Detail.png';
import '../../styles/listing/ListingPhotoReviewStep.css';

/* ─── Types ─────────────────────────────────────────── */
type EvidenceStatus = 'ok' | 'flagged';

export interface PhotoReviewServerError {
  angleId: string;
  code?: 'BLUR' | 'WRONG_ANGLE' | 'GLARE' | string;
  message?: string;
}

interface MetaTag {
  label: string;
  value: string;
}

interface EvidenceItem {
  id: string;
  badgeLabel: string;
  title: string;
  subtitle: string;
  status: EvidenceStatus;
  statusLabel: string;
  description: string;
  meta: MetaTag[];
  image: string;
  warning?: string;
  serverError?: PhotoReviewServerError;
}

/* ─── Static Evidence Data ───────────────────────────── */
const EVIDENCE_ITEMS: EvidenceItem[] = [
  {
    id: '01',
    badgeLabel: '01 • TỔNG QUAN',
    title: 'Toàn bộ sản phẩm (Front Silhouette)',
    subtitle: 'Đã xác thực khung hình ',
    status: 'ok',
    statusLabel: 'Đã xác thực khung hình ',
    description:
      'Tỷ lệ khung hình khớp hình khối di sản. Đã nhận diện trọn vẹn vải áo kép, 10 cúc ngực và đai vai đối xứng.',
    meta: [
      { label: 'Độ phân giải', value: '3840×2160 px' },
      { label: 'Nhiệt độ màu', value: '5400K' },
      { label: 'Độ nét', value: '98.4%' },
    ],
    image: coatImage,
  },
  {
    id: '02',
    badgeLabel: '02 • BRAND LABEL',
    title: 'Nhãn dệt thương hiệu (Collar Tag)',
    subtitle: 'Chỉ sắc nét ',
    status: 'ok',
    statusLabel: 'Chỉ sắc nét ',
    description:
      'Front chữ Serif và khoảng cách ký tự (kerning) đối chiều hoàn hảo với cơ sở dữ liệu lưu từ 1998–2005.',
    meta: [
      { label: 'Độ phân giải', value: '2400×1200 px' },
      { label: 'Độ sắc nét', value: '99.1%' },
      { label: 'Căn bằng', value: '0.1° lịch' },
    ],
    image: labelImage,
  },
  {
    id: '03',
    badgeLabel: '03 • SEAM STITCHING',
    title: 'Mũi may khóa viền ve áo (Lapel Stitching)',
    subtitle: 'Đã hiệu chuẩn mật độ ',
    status: 'ok',
    statusLabel: 'Đã hiệu chuẩn mật độ ',
    description:
      'Tần số mũi may đồng nhất xuyên suốt 420mm đường viền. Không phát hiện mũi đứt hoặc biến dạng chỉ.',
    meta: [
      { label: 'Mật độ', value: '8.8 SPI (Stitches Per Inch)' },
      { label: 'Độ sai', value: '0.42mm' },
      { label: 'Sai lịch', value: '±0.03' },
    ],
    image: stitchImage,
  },
  {
    id: '04',
    badgeLabel: '04 • HARDWARE (FLAGGED)',
    title: 'Phụ kiện kim loại & Cúc sắc (Hardware & Horn Buttons)',
    subtitle: 'Lóa sáng 24%',
    status: 'flagged',
    statusLabel: 'Lóa sáng 24%',
    description:
      'Quang học phát hiện hiện tượng lóa điểm ảnh (hotspot) tại góc chữ D và bề mặt chạm khắc.',
    meta: [
      { label: 'Độ phân giải', value: '48,200 px' },
      { label: 'Khẩu độ mô phỏng', value: 'f/2.2' },
      { label: 'Tương phản', value: 'Mất chi tiết khắc' },
    ],
    warning:
      'Lóa đèn flash trực tiếp trên móc chữ D thắt lưng có thể làm mờ độ sâu khắc vi mô. Khuyến nghị chụp lại dưới ánh sáng tự nhiên khuếch tán để đạt độ tin cậy >90%.',
    image: buttonImage,
  },
  {
    id: '05',
    badgeLabel: '05 • TEXTILE WEAVE',
    title: 'Vải dệt chéo Gabardine & Lót kề (Textile & Lining)',
    subtitle: 'Đã xác thực góc đặt ',
    status: 'ok',
    statusLabel: 'Đã xác thực góc đặt ',
    description:
      'Cấu trúc dệt chéo đanh chắc với góc nghiêng đặc trưng của sợi cotton chéo 2 lớp (double-twist yarn).',
    meta: [
      { label: 'Độ phân giải', value: '3000×2000 px' },
      { label: 'Góc dệt đo lường', value: '63°' },
      { label: 'Tỷ lệ sợi', value: '100% Cotton Gabardine' },
    ],
    image: fabricImage,
  },
];

/* ─── ISO Criteria Data ──────────────────────────────── */
const ISO_CRITERIA = [
  {
    name: 'Phổ nhiệt độ màu',
    range: 'Quy định: 5000K – 5600K',
    value: 'Đạt (5410K)',
    pass: true,
  },
  {
    name: 'Che khuất biên đường may',
    range: 'Ngưỡng dung sai: 0 điểm che',
    value: '0 điểm che',
    pass: true,
  },
  {
    name: 'Phân giải vi mô sợi vải',
    range: 'Chuẩn yêu cầu: > 12 px/mm',
    value: 'Đạt (16.4 px/mm)',
    pass: true,
  },
  {
    name: 'Ngưỡng lóa sáng kim loại',
    range: 'Mức trần cho phép: < 15%',
    value: 'Cảnh báo Góc 04 (24%)',
    pass: false,
  },
];

/* ─── Component ─────────────────────────────────────── */
interface ListingPhotoReviewStepProps {
  /** Errors returned by the photo-review API, keyed by the evidence angle. */
  serverErrors?: PhotoReviewServerError[];
}

const applyServerErrors = (serverErrors: PhotoReviewServerError[] = []) =>
  EVIDENCE_ITEMS.map((item) => {
    const serverError = serverErrors.find((error) => error.angleId === item.id);
    if (!serverError) return item;

    const label =
      serverError.code === 'BLUR'
        ? 'Ảnh bị mờ'
        : serverError.code === 'WRONG_ANGLE'
          ? 'Sai góc chụp'
          : serverError.code === 'GLARE'
            ? 'Lóa sáng'
            : 'Cần xử lý';

    return {
      ...item,
      status: 'flagged' as const,
      statusLabel: label,
      serverError,
      warning: serverError.message || item.warning,
    };
  });

export const ListingPhotoReviewStep: React.FC<ListingPhotoReviewStepProps> = ({ serverErrors }) => {
  const [items, setItems] = useState<EvidenceItem[]>(() => applyServerErrors(serverErrors));

  useEffect(() => {
    setItems(applyServerErrors(serverErrors));
  }, [serverErrors]);

  const handleRetake = (id: string) => {
    // In production: open retake camera for that angle
    console.log('Retake angle:', id);
  };

  const handleContinue = (id: string) => {
    // Mark flagged as continue-anyway
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'ok', statusLabel: 'Vẫn tiếp tục xử lý ✓' } : item
      )
    );
  };

  const passCount = items.filter((i) => i.status === 'ok').length;
  const flagCount = items.filter((i) => i.status === 'flagged').length;
  const integrityPct = 88.2;

  return (
    <section className="rw-lc-review">
      {/* ── System Banner ── */}
      <div className="rw-lc-review-banner">
        <div className="rw-lc-review-banner-icon">
          <ShieldCheck width={24} height={24} />
        </div>
        <div className="rw-lc-review-banner-text">
          <div className="rw-lc-review-banner-eyebrow">
            HỆ THỐNG THẨM ĐỊNH QUANG HỌC ĐA PHỔ
          </div>
          <h2 className="rw-lc-review-banner-title">
            Kiểm tra bằng chứng ảnh (Photo Review)
          </h2>
          <p className="rw-lc-review-banner-desc">
            Rà soát 5 góc ảnh quang học trước khi gửi vào mô hình phân tích nơ-ron AI.
            Phát hiện sớm các lỗi lóa sáng hoặc mất nét để tránh phải thẩm định thủ công.
          </p>
        </div>
      </div>

      {/* ── Status Bar ── */}
      <div className="rw-lc-review-status-bar">
        <div className="rw-lc-review-status-left">
          <div className="rw-lc-review-status-badge-row">
            <span className="rw-lc-review-status-badge ok">
              <CheckCircle2 width={15} height={15} />
              Sẵn sàng quét: {passCount} Đạt • {flagCount} Cần xử lý
            </span>
            {flagCount > 0 && (
              <span className="rw-lc-review-status-badge warn">
                <Circle
                  className="rw-lc-review-status-badge-dot"
                  width={7}
                  height={7}
                  fill="currentColor"
                  strokeWidth={0}
                  aria-hidden="true"
                />
                Lóa sáng 24% ở Góc 04
              </span>
            )}
          </div>
          <span className="rw-lc-review-status-note">
            {passCount} trường ảnh đã đạt tiêu chuẩn phân giải vi sắc.
            {flagCount > 0 && ' Góc 04 có tỷ lệ lóa sáng vượt mức ngưỡng chuẩn.'}
          </span>
        </div>

        <div className="rw-lc-review-status-stats">
          <div className="rw-lc-review-stat">
            <span className="rw-lc-review-stat-label">Độ toàn vẹn</span>
            <span className="rw-lc-review-stat-value">5/5 Góc ảnh</span>
          </div>
          <div className="rw-lc-review-stat">
            <span className="rw-lc-review-stat-label">Thời gian phân tích</span>
            <span className="rw-lc-review-stat-value">~4.2s (AI Core)</span>
          </div>
          <div className="rw-lc-review-stat">
            <span className="rw-lc-review-stat-label">Tự động thông qua</span>
            <span className="rw-lc-review-stat-value">94%+ nếu rõ nét</span>
          </div>
        </div>
      </div>

      {/* ── Main Two-Column Grid ── */}
      <div className="rw-lc-review-grid">
        {/* ══ LEFT: Evidence Photo List ══ */}
        <div className="rw-lc-review-col-left">
          <div className="rw-lc-review-col-header">
            <span className="rw-lc-review-col-title">
              <ScanLine width={18} height={18} color="#2563EB" />
              Danh mục 5 bằng chứng quang học
            </span>
            <span className="rw-lc-review-col-subtitle">Định dạng chuẩn EXIF 2.32</span>
          </div>

          {items.map((item) => (
            <div
              key={item.id}
              className={`rw-lc-review-item${item.status === 'flagged' ? ' flagged' : ''}`}
            >
              <div className="rw-lc-review-item-inner">
                {/* Thumbnail */}
                <div className={`rw-lc-review-thumb${item.status === 'flagged' ? ' server-error' : ''}`}>
                  <img src={item.image} alt={item.title} />
                  <div
                    className={`rw-lc-review-thumb-badge${item.status === 'flagged' ? ' flagged-badge' : ''}`}
                  >
                    {item.badgeLabel}
                  </div>
                </div>

                {/* Content */}
                <div className="rw-lc-review-item-content">
                  {/* Head row */}
                  <div className="rw-lc-review-item-head">
                    <div>
                      <div className="rw-lc-review-item-title">{item.title}</div>
                    </div>
                    <span
                      className={`rw-lc-review-item-status ${item.status === 'ok' ? 'ok' : 'warn'}`}
                    >
                      {item.status === 'ok' ? (
                        <CheckCircle2 width={14} height={14} />
                      ) : (
                        <AlertTriangle width={14} height={14} />
                      )}
                      {item.statusLabel}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="rw-lc-review-item-desc">{item.description}</p>

                  {/* Meta Tags */}
                  <div className="rw-lc-review-item-meta">
                    {item.meta.map((m) => (
                      <span key={m.label} className="rw-lc-review-item-meta-tag">
                        <strong>{m.label}:</strong> {m.value}
                      </span>
                    ))}
                  </div>

                  {/* Warning Box (only for flagged) */}
                  {item.warning && (
                    <div className="rw-lc-review-item-warning">
                      <AlertTriangle width={16} height={16} />
                      <p className="rw-lc-review-item-warning-text">{item.warning}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="rw-lc-review-item-actions">
                    {item.status === 'flagged' && (
                      <button
                        type="button"
                        className="rw-lc-review-btn-ghost"
                        onClick={() => handleContinue(item.id)}
                      >
                        <CheckCheck width={15} height={15} />
                        Vẫn tiếp tục xử lý
                      </button>
                    )}
                    <button
                      type="button"
                      className={item.status === 'flagged' ? 'rw-lc-review-btn-primary' : 'rw-lc-review-btn-ghost'}
                      onClick={() => handleRetake(item.id)}
                    >
                      <RotateCcw width={14} height={14} />
                      {item.status === 'flagged' ? 'Chụp lại góc này' : 'Chụp lại'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ══ RIGHT: ISO Criteria + Neural Network + Escrow ══ */}
        <div className="rw-lc-review-col-right">
          {/* ── ISO/IEC 17020 Criteria Card ── */}
          <div className="rw-lc-review-card">
            <h3 className="rw-lc-review-card-title">
              <ShieldCheck width={18} height={18} color="#2563EB" />
              <span>
                Tiêu chí kiểm định sơ bộ ISO/IEC 17020
                <span className="card-subtitle">Quy chuẩn kỹ thuật trước khi nạp dữ liệu vào mạng nơ-ron tích chập (CNN) phân loại di sản thời trang.</span>
              </span>
            </h3>

            {ISO_CRITERIA.map((c) => (
              <div key={c.name} className="rw-lc-review-criteria-row">
                <div className="rw-lc-review-criteria-left">
                  <div className="rw-lc-review-criteria-name">{c.name}</div>
                  <div className="rw-lc-review-criteria-range">{c.range}</div>
                </div>
                <span className={`rw-lc-review-criteria-value ${c.pass ? 'pass' : 'fail'}`}>
                  {c.value}
                </span>
              </div>
            ))}

            {/* Integrity Progress Bar */}
            <div className="rw-lc-review-integrity">
              <div className="rw-lc-review-integrity-label">
                <span>Chỉ số toàn vẹn tập dữ liệu</span>
                <span>{integrityPct}%</span>
              </div>
              <div className="rw-lc-review-integrity-bar">
                <div
                  className="rw-lc-review-integrity-fill"
                  style={{ width: `${integrityPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* ── Neural Network Reference Card ── */}
          <div className="rw-lc-review-card">
            <h3 className="rw-lc-review-card-title">
              <Cpu width={18} height={18} color="#2563EB" />
              <span>
                MẠNG NÔ-RON ĐỐI CHIẾU
                <span className="card-subtitle">Burberry Archive Vision v4.28</span>
              </span>
            </h3>

            <div className="rw-lc-review-nn-row">
              <span className="rw-lc-review-nn-label">Cơ sở mẫu vật:</span>
              <span className="rw-lc-review-nn-value">142,500+ mẫu lưu trữ</span>
            </div>
            <div className="rw-lc-review-nn-row">
              <span className="rw-lc-review-nn-label">Trạng số mô nhất:</span>
              <span className="rw-lc-review-nn-value">Cập nhật 3 ngày trước</span>
            </div>
            <div className="rw-lc-review-nn-row">
              <span className="rw-lc-review-nn-label">Độ chính xác lịch sử:</span>
              <span className="rw-lc-review-nn-value">99.4% (Tweed/Gabardine)</span>
            </div>

            <div className="rw-lc-review-nn-note">
              <ZoomIn width={16} height={16} style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>
                Mô hình đã được huấn luyện với các bộ sưu tập thời 1970–2024.
              </span>
            </div>
          </div>

          {/* ── Escrow Protection Card ── */}
          <div className="rw-lc-review-card">
            <h3 className="rw-lc-review-card-title">
              <ShieldCheck width={18} height={18} color="#2563EB" />
              Cơ chế bảo vệ ký quỹ
            </h3>
            <p className="rw-lc-review-escrow-desc">
              Các hình ảnh sau khi xác thực sẽ được bảo mã hóa SHA-256 gắn liền với hợp đồng ký quỹ cho đến khi người mua nhận kiện hàng.
            </p>
            <div className="rw-lc-review-escrow-hash">
              <span>
                <ImageOff width={13} height={13} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} />
                SHA-256: 9f4a8b2c...e12d
              </span>
              <span className="rw-lc-review-escrow-signed">ĐÃ KÝ SỐ</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ListingPhotoReviewStep;
