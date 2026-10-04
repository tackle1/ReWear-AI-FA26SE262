import React, { useEffect, useMemo, useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ScanLine,
  ImageOff,
} from 'lucide-react';
import {
  LISTING_ANGLES,
  ListingAngle,
} from '../../features/listing/constants/listingAngles';
import '../../styles/listing/ListingPhotoReviewStep.css';

/* ─── Types ─────────────────────────────────────────── */
export type EvidenceStatus = 'ok' | 'warn' | 'missing';

/**
 * Lỗi rà soát cho một góc ảnh, dựng từ kết quả server.
 *
 * Danh sách này CHỈ chứa những góc KHÔNG ĐẠT — component dùng nó để tô viền
 * đỏ đúng khung ảnh lỗi, nên đừng truyền cả các góc đạt.
 */
export interface PhotoReviewServerError {
  angleType: string;
  code?: 'BLUR' | 'WRONG_ANGLE' | 'GLARE' | string;
  message?: string;
}

/**
 * Chỉ số đo THẬT của server cho từng góc ảnh — Bước 03.
 *
 * Gộp cùng dữ liệu `serverErrors` để component hiển thị độ nét/độ sáng đo
 * được, thay vì tự suy đoán từ kích thước file.
 */
export interface PhotoMetrics {
  angleType: string;
  isAcceptable: boolean;
  issues: string[];
  /** Điểm độ nét (Laplacian variance) — càng cao càng rõ nét. */
  sharpnessScore: number;
  /** Độ sáng trung bình 0-255. */
  brightness: number;
  /** CHỈ ĐỂ HIỂN THỊ — backend không dùng kích thước để quyết định đạt/trượt. */
  width: number;
  height: number;
}

interface MetaTag {
  label: string;
  value: string;
}

/** Một góc ảnh trong danh sách rà soát, dựng hoàn toàn từ dữ liệu thật. */
interface EvidenceItem {
  angle: ListingAngle;
  /** Data URL từ Bước 02, `null` nếu góc này chưa chụp. */
  image: string | null;
  status: EvidenceStatus;
  statusLabel: string;
  /** Ghi chú cần người bán xử lý, chỉ hiện khi có vấn đề thật. */
  warning?: string;
  serverError?: PhotoReviewServerError;
}

/* ─── Helpers ───────────────────────────────────────── */

/**
 * Đọc kích thước thật của ảnh từ data URL (ảnh đã được nén ở Bước 02).
 *
 * CHỈ ĐỂ HIỂN THỊ — Bước 03 quyết định đạt/trượt dựa trên độ nét và độ sáng
 * đo từ server, không dùng kích thước ảnh.
 */
const readImageSize = (dataUrl: string): Promise<{ width: number; height: number }> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error('Ảnh không đọc được'));
    image.src = dataUrl;
  });

const readFormat = (dataUrl: string): string => {
  if (dataUrl.startsWith('data:image/png')) return 'PNG';
  if (dataUrl.startsWith('data:image/webp')) return 'WEBP';
  return 'JPEG';
};

const ERROR_LABEL: Record<string, string> = {
  BLUR: 'Ảnh bị mờ',
  WRONG_ANGLE: 'Sai góc chụp',
  GLARE: 'Lóa sáng',
};

/* ─── Component ─────────────────────────────────────── */
interface ListingPhotoReviewStepProps {
  /** Lỗi rà soát trả về từ API, gắn theo `angleType` của backend. */
  serverErrors?: PhotoReviewServerError[];
  /** Chỉ số đo thật từ server cho từng góc (độ nét, độ sáng). */
  metrics?: PhotoMetrics[];
  /** Đang gọi API kiểm tra — hiện trạng thái chờ trên header. */
  isChecking?: boolean;
  /** Lỗi khi gọi API (mạng, backend sập). Hiện cảnh báo riêng. */
  checkError?: string | null;
  /** Hướng dẫn tổng hợp do server sinh, gắn nhãn [GÓC_ẢNH] cho từng lỗi. */
  recommendation?: string;
  /** Ảnh thật đã chụp ở Bước 02: `angleType` → data URL. */
  photos?: Record<string, string>;
  /** Quay lại Bước 02 để chụp lại một góc cụ thể. */
  onRetake?: (angleType: string) => void;
}

export const ListingPhotoReviewStep: React.FC<ListingPhotoReviewStepProps> = ({
  serverErrors,
  metrics = [],
  isChecking = false,
  checkError = null,
  recommendation,
  photos = {},
  onRetake,
}) => {
  /**
   * Kích thước ảnh đo được sau khi nạp. Giữ riêng khỏi `EvidenceItem` vì nó
   * không ảnh hưởng trạng thái, chỉ dùng để hiện ở hàng thông số.
   */
  const [imageSizes, setImageSizes] = useState<Record<string, { width: number; height: number }>>({});

  const items = useMemo<EvidenceItem[]>(
    () =>
      LISTING_ANGLES.map((angle) => {
        const image = photos[angle.angleType] ?? null;
        const serverError = serverErrors?.find((error) => error.angleType === angle.angleType);

        if (!image) {
          return {
            angle,
            image: null,
            status: 'missing',
            statusLabel: 'Chưa chụp góc này',
            warning: `Chưa có ảnh cho Góc ${angle.number}. Vui lòng quay lại Bước 02 để chụp.`,
          };
        }

        if (serverError) {
          return {
            angle,
            image,
            status: 'warn',
            statusLabel: ERROR_LABEL[serverError.code ?? ''] ?? 'Cần xử lý',
            warning: serverError.message,
            serverError,
          };
        }

        return { angle, image, status: 'ok', statusLabel: 'Đã nhận ảnh' };
      }),
    [photos, serverErrors],
  );

  // Đo kích thước từng ảnh để hiện thông số thật thay cho số liệu bịa ra.
  useEffect(() => {
    let cancelled = false;

    void Promise.all(
      LISTING_ANGLES.map(async (angle) => {
        const dataUrl = photos[angle.angleType];
        if (!dataUrl) return null;

        try {
          const size = await readImageSize(dataUrl);
          return [angle.angleType, size] as const;
        } catch {
          return null;
        }
      }),
    ).then((entries) => {
      if (cancelled) return;
      setImageSizes(Object.fromEntries(entries.filter((entry) => entry !== null)));
    });

    return () => {
      cancelled = true;
    };
  }, [photos]);

  const buildMeta = (item: EvidenceItem): MetaTag[] => {
    if (!item.image) {
      return [
        { label: 'Nguồn', value: 'Chưa có ảnh' },
        { label: 'Kích thước', value: '—' },
        { label: 'Dung lượng', value: '—' },
      ];
    }

    const size = imageSizes[item.angle.angleType];
    const metric = metrics.find((m) => m.angleType === item.angle.angleType);

    // Chỉ số đo thật từ server (độ nét/độ sáng) là thứ quyết định đạt hay
    // trượt ở Bước 03. Kích thước chỉ để tham khảo, nên đánh dấu rõ là
    // "tham khảo" để không bị hiểu nhầm là tiêu chí đạt/trượt.
    return [
      {
        label: 'Độ nét',
        value: metric ? `${Math.round(metric.sharpnessScore)} điểm` : 'Đang đo...',
      },
      {
        label: 'Độ sáng',
        value: metric ? `${Math.round(metric.brightness)}/255` : 'Đang đo...',
      },
      {
        label: 'Kích thước',
        value: size ? `${size.width}×${size.height} px (tham khảo)` : 'Đang đọc...',
      },
    ];
  };

  const okCount = items.filter((item) => item.status === 'ok').length;
  /** Số ảnh server đo ra không đạt — dùng cho dòng tiêu chí "Độ rõ nét". */
  const sharpnessFailCount = metrics.filter((m) => !m.isAcceptable).length;
  const warnCount = items.filter((item) => item.status === 'warn').length;
  const missingCount = items.filter((item) => item.status === 'missing').length;
  const total = items.length;
  const integrityPct = total > 0 ? Math.round((okCount / total) * 100) : 0;
  const formats = [...new Set(Object.values(photos).map(readFormat))];
  return (
    <section className="rw-lc-review">
      {/* ── System Banner ── */}
      <div className="rw-lc-review-banner">
        <div className="rw-lc-review-banner-icon">
          <ShieldCheck width={24} height={24} />
        </div>
        <div className="rw-lc-review-banner-text">
          <div className="rw-lc-review-banner-eyebrow">RÀ SOÁT ẢNH BẰNG CHỨNG</div>
          <div className="rw-lc-review-banner-title">
            Kiểm tra bằng chứng ảnh (Photo Review)
          </div>
          <p className="rw-lc-review-banner-desc">
            Kiểm tra {total} góc ảnh bạn đã chụp ở Bước 02 trước khi chuyển sang
            bước xác thực AI. Mọi thông số dưới đây đều đo trực tiếp từ ảnh của bạn.
          </p>
        </div>
      </div>

      {/* ── Server feedback: lỗi kết nối & hướng dẫn chụp lại ── */}
      {checkError && (
        <div
          className="rw-lc-review-alert"
          style={{
            borderColor: '#FECACA',
            background: '#FEF2F2',
            color: '#991B1B',
          }}
        >
          <AlertTriangle width={16} height={16} style={{ flexShrink: 0 }} />
          <span>
            Không kiểm tra được ảnh: {checkError}. Bạn vẫn có thể xem bước kế
            tiếp, nhưng nên thử lại để hệ thống đo được độ rõ nét.
          </span>
        </div>
      )}

      {recommendation && !isChecking && (
        <div
          className="rw-lc-review-alert"
          style={{
            borderColor: '#FDE68A',
            background: '#FFFBEB',
            color: '#92400E',
          }}
        >
          <AlertTriangle width={16} height={16} style={{ flexShrink: 0 }} />
          <span>{recommendation}</span>
        </div>
      )}

      {/* ── Status Bar ── */}
      <div className="rw-lc-review-status-bar">
        <div className="rw-lc-review-status-left">
          <div className="rw-lc-review-status-badge-row">
            <span className="rw-lc-review-status-badge ok">
              <CheckCircle2 width={15} height={15} />
              Sẵn sàng quét: {okCount} Đạt • {warnCount + missingCount} Cần xử lý
            </span>
            {missingCount > 0 && (
              <span className="rw-lc-review-status-badge warn">
                Thiếu {missingCount} góc ảnh
              </span>
            )}
          </div>
          <span className="rw-lc-review-status-note">
            {missingCount > 0
              ? `Còn ${missingCount} góc chưa chụp, cần bổ sung trước khi kiểm định AI.`
              : warnCount > 0
                ? `${warnCount} góc ảnh cần xử lý trước khi kiểm định AI.`
                : 'Đủ 4 góc ảnh và không phát hiện vấn đề kỹ thuật nào.'}
          </span>
        </div>

        <div className="rw-lc-review-status-stats">
          <div className="rw-lc-review-stat">
            <span className="rw-lc-review-stat-label">Ảnh đã chụp</span>
            <span className="rw-lc-review-stat-value">
              {okCount + warnCount}/{total} Góc ảnh
            </span>
          </div>
          <div className="rw-lc-review-stat">
            <span className="rw-lc-review-stat-label">Định dạng</span>
            <span className="rw-lc-review-stat-value">
              {formats.length > 0 ? formats.join(' & ') : '—'}
            </span>
          </div>
          <div className="rw-lc-review-stat">
            <span className="rw-lc-review-stat-label">Tỷ lệ đạt</span>
            <span className="rw-lc-review-stat-value">{integrityPct}%</span>
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
              Danh mục {total} bằng chứng quang học
            </span>
            <span className="rw-lc-review-col-subtitle">Ảnh chụp ở Bước 02</span>
          </div>

          {items.map((item) => (
            <div
              key={item.angle.angleType}
              className={`rw-lc-review-item${item.status === 'ok' ? '' : ' flagged'}`}
            >
              <div className="rw-lc-review-item-inner">
                {/* Thumbnail — ảnh thật từ Bước 02, không dùng ảnh mẫu */}
                <div
                  className={`rw-lc-review-thumb${item.status === 'ok' ? '' : ' server-error'}`}
                >
                  {item.image ? (
                    <img src={item.image} alt={item.angle.title} />
                  ) : (
                    <span className="rw-lc-review-thumb-empty">
                      <ImageOff width={22} height={22} aria-hidden="true" />
                      Chưa có ảnh
                    </span>
                  )}
                  <div
                    className={`rw-lc-review-thumb-badge${
                      item.status === 'ok' ? '' : ' flagged-badge'
                    }`}
                  >
                    {item.angle.number} • {item.angle.subtitle}
                  </div>
                </div>

                {/* Content */}
                <div className="rw-lc-review-item-content">
                  <div className="rw-lc-review-item-head">
                    <div>
                      <div className="rw-lc-review-item-title">{item.angle.title}</div>
                      <div className="rw-lc-review-item-subtitle">
                        Mã góc: {item.angle.angleType}
                      </div>
                    </div>
                    <span
                      className={`rw-lc-review-item-status ${
                        item.status === 'ok' ? 'ok' : 'warn'
                      }`}
                    >
                      {item.status === 'ok' ? (
                        <CheckCircle2 width={14} height={14} />
                      ) : (
                        <AlertTriangle width={14} height={14} />
                      )}
                      {item.statusLabel}
                    </span>
                  </div>

                  {/* Hướng dẫn chụp — cùng nguồn với Bước 02 */}
                  <p className="rw-lc-review-item-desc">{item.angle.guidance}</p>

                  {/* Thông số đo thật từ ảnh */}
                  <div className="rw-lc-review-item-meta">
                    {buildMeta(item).map((meta) => (
                      <span key={meta.label} className="rw-lc-review-item-meta-tag">
                        <strong>{meta.label}:</strong> {meta.value}
                      </span>
                    ))}
                  </div>

                  {item.warning && (
                    <div className="rw-lc-review-item-warning">
                      <AlertTriangle width={16} height={16} />
                      {/* Lý do do server sinh (độ nét, độ sáng) — không suy
                          đoán từ kích thước, vì Bước 03 không kiểm tra kích thước. */}
                      <p className="rw-lc-review-item-warning-text">{item.warning}</p>
                    </div>
                  )}

                  <div className="rw-lc-review-item-actions">
                    <button
                      type="button"
                      className={
                        item.status === 'ok'
                          ? 'rw-lc-review-btn-ghost'
                          : 'rw-lc-review-btn-primary'
                      }
                      onClick={() => onRetake?.(item.angle.angleType)}
                    >
                      <RotateCcw width={14} height={14} />
                      {item.image ? 'Chụp lại' : 'Đi chụp góc này'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* ══ RIGHT: Summary cards ══ */}
        <div className="rw-lc-review-col-right">
          <div className="rw-lc-review-card">
            <h3 className="rw-lc-review-card-title">
              <ShieldCheck width={18} height={18} color="#2563EB" />
              <span>
                TIÊU CHÍ KIỂM TRA ẢNH
                <span className="card-subtitle">Ngưỡng của ứng dụng ReWear AI</span>
              </span>
            </h3>

            <div className="rw-lc-review-criteria-row">
              <div className="rw-lc-review-criteria-left">
                <div className="rw-lc-review-criteria-name">Đủ góc ảnh bắt buộc</div>
                <div className="rw-lc-review-criteria-range">
                  Yêu cầu: OVERALL, BRAND_TAG, WASH_TAG, STITCHING_ZIPPER
                </div>
              </div>
              <span
                className={`rw-lc-review-criteria-value ${missingCount === 0 ? 'pass' : 'fail'}`}
              >
                {missingCount === 0 ? `Đủ (${total}/${total})` : `Thiếu ${missingCount} góc`}
              </span>
            </div>

            <div className="rw-lc-review-criteria-row">
              <div className="rw-lc-review-criteria-left">
                <div className="rw-lc-review-criteria-name">Độ rõ nét ảnh</div>
                <div className="rw-lc-review-criteria-range">
                  Đo trên pixel bởi server · tối thiểu 100 điểm
                </div>
              </div>
              <span
                className={`rw-lc-review-criteria-value ${
                  sharpnessFailCount === 0 && metrics.length > 0 ? 'pass' : 'fail'
                }`}
              >
                {metrics.length === 0
                  ? isChecking
                    ? 'Đang đo...'
                    : 'Chưa đo'
                  : sharpnessFailCount === 0
                    ? `Đạt toàn bộ (${metrics.length})`
                    : `${sharpnessFailCount} ảnh mờ`}
              </span>
            </div>

            <div className="rw-lc-review-criteria-row">
              <div className="rw-lc-review-criteria-left">
                <div className="rw-lc-review-criteria-name">Định dạng ảnh hợp lệ</div>
                <div className="rw-lc-review-criteria-range">Chấp nhận: JPEG, PNG, WEBP</div>
              </div>
              <span
                className={`rw-lc-review-criteria-value ${formats.length > 0 ? 'pass' : 'fail'}`}
              >
                {formats.length > 0 ? formats.join(', ') : 'Chưa có ảnh'}
              </span>
            </div>

            <div className="rw-lc-review-integrity">
              <div className="rw-lc-review-integrity-label">
                <span>Tỷ lệ ảnh đạt yêu cầu</span>
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

          {/* ── Next Step Card ── */}
          <div className="rw-lc-review-card">
            <h3 className="rw-lc-review-card-title">
              <ScanLine width={18} height={18} color="#2563EB" />
              <span>
                BƯỚC TIẾP THEO
                <span className="card-subtitle">Bước 04 — Xác thực AI</span>
              </span>
            </h3>
            <p className="rw-lc-review-escrow-desc">
              {missingCount > 0 || warnCount > 0
                ? 'Bạn vẫn có thể xem bước kế tiếp, nhưng nên bổ sung ảnh còn thiếu hoặc chụp lại góc ảnh có vấn đề để kết quả kiểm định chính xác hơn.'
                : 'Toàn bộ ảnh đã sẵn sàng. Ở Bước 04, hệ thống AI sẽ phân tích ảnh của bạn và chấm điểm xác thực.'}
            </p>
            <div className="rw-lc-review-escrow-hash">
              <span>
                <ImageOff
                  width={13}
                  height={13}
                  style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }}
                />
                Ảnh được giữ nguyên khi gửi sang kiểm định AI
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ListingPhotoReviewStep;