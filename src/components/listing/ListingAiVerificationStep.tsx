import React, { useMemo } from 'react';
import { AlertTriangle, CheckCircle2, ImageOff, Loader, X } from 'lucide-react';
import { LISTING_ANGLES } from '../../features/listing/constants/listingAngles';
import {
  AiScanResult,
  SignalCheckResult,
  VerificationDecision,
  VerificationThresholds,
} from '../../types/verification.type';
import '../../styles/listing/ListingAiVerificationStep.css';

/* ─── Types ─────────────────────────────────────────── */

/** Trạng thái một góc ảnh, tính từ kết quả đo thật của Bước 03. */
export type AngleQualityState = 'ok' | 'warn' | 'missing' | 'checking';

export interface AngleQuality {
  angleType: string;
  number: string;
  label: string;
  image?: string;
  state: AngleQualityState;
  /** Nhãn ngắn bên phải, ví dụ "Đạt" / "Cần chụp lại". */
  result: string;
  /** Chi tiết đo được, hiện dưới nhãn. */
  detail?: string;
}

export interface VerificationMetric {
  label: string;
  value: string;
}

export interface AiVerificationProduct {
  image?: string;
  name?: string;
  brand?: string;
  size?: string;
  color?: string;
  price?: string;
  sku?: string;
}

/** Chỉ số đo được trên ảnh, lấy từ `ImageQualityResultDto` của backend. */
interface MeasuredImage {
  isAcceptable: boolean;
  issues: string[];
  width: number;
  height: number;
  sharpnessScore: number;
  brightness: number;
}

/* ─── Helpers ───────────────────────────────────────── */

/** Nhãn tiếng Việt cho quyết định của `verify-and-decide`. */
const DECISION_LABEL: Record<string, { text: string; cls: string }> = {
  APPROVED: { text: 'Đạt — được đăng tin', cls: 'pass' },
  REVIEW_NEEDED: { text: 'Cần Admin xem xét', cls: 'match' },
  REJECTED: { text: 'Không đạt — bị từ chối', cls: 'fail' },
};

/** Chuyển `GRADE_A_EXCELLENT` thành `A / Xuất sắc` cho dễ đọc. */
const CONDITION_LABEL: Record<string, string> = {
  GRADE_S_LIKE_NEW: 'S — Như mới',
  GRADE_A_EXCELLENT: 'A — Xuất sắc',
  GRADE_B_GOOD: 'B — Tốt',
  GRADE_C_FAIR: 'C — Chấp nhận được',
};

const angleChipClass = (state: AngleQualityState) =>
  state === 'ok' ? 'pass' : state === 'warn' ? 'match' : '';

/**
 * Quy đổi điểm độ nét của backend sang nhãn dễ hiểu.
 *
 * Đây là ngưỡng HIỂN THỊ, không phải kết luận AI: điểm Laplacian variance phụ
 * thuộc cả nội dung ảnh nên cùng một sản phẩm có thể cho điểm khác nhau. Vì vậy
 * phần quyết định đạt/không đạt vẫn lấy từ `isAcceptable` mà backend tính sẵn.
 */
const describeSharpness = (score: number): string => {
  if (!Number.isFinite(score) || score <= 0) return 'Chưa đo được độ nét';
  if (score < 30) return 'Độ nét thấp';
  if (score < 80) return 'Độ nét khá';
  return 'Độ nét tốt';
};

const describeBrightness = (value: number): string => {
  if (!Number.isFinite(value)) return '';
  if (value < 40) return 'Ảnh tối';
  if (value > 215) return 'Ảnh quá sáng';
  return 'Ánh sáng phù hợp';
};

/* ─── Component ─────────────────────────────────────── */
export interface ListingAiVerificationStepProps {
  /** Số bước đã pad, ví dụ "04" */
  stepNumber?: string;
  stepTitle?: string;
  description?: string;
  /** Sản phẩm người bán nhập ở Bước 01. */
  product?: AiVerificationProduct;
  /** Ảnh đã chụp ở Bước 02: `angleType` → data URL. */
  photos?: Record<string, string>;
  /** Kết quả đo thật từ Bước 03, gom theo `angleType`. */
  measuredPhotos?: Record<string, MeasuredImage>;
  /** Đang gọi endpoint kiểm tra ảnh. */
  isChecking?: boolean;
  /** Thông điệp lỗi khi gọi endpoint thất bại. */
  checkError?: string | null;
  /** `recommendation` của backend, dùng nguyên văn. */
  recommendation?: string;
  thresholds?: VerificationThresholds;
  /** Kết quả `analyze-photos`: điểm chính hãng + điểm thành phần. */
  analysis?: AiScanResult | null;
  /** Kết quả `verify-and-decide`: APPROVED / REVIEW_NEEDED / REJECTED. */
  decision?: VerificationDecision | null;
  /** Kết quả `check-signals`: bảng đối chiếu tín hiệu. */
  signals?: SignalCheckResult | null;
  /** Đang gọi 3 endpoint của Bước 04. */
  isVerifying?: boolean;
  /**
   * Số token AI còn lại sau lần phân tích vừa rồi.
   *
   * `null` khi chưa có kết quả, hoặc gọi không xác thực (không trừ token).
   * Backend trừ token ở mỗi endpoint Bước 04, nên số này giảm dần mỗi lần
   * seller bấm xác thực lại — cần hiện ra để họ không bất ngờ khi bị chặn.
   */
  remainingTokens?: number | null;
  /** Phí token cho mỗi lần phân tích, để giải thích vì sao số dư giảm. */
  tokenCost?: number;
  /** Lỗi khi gọi endpoint Bước 04. */
  verifyError?: string | null;
  onCancel?: () => void;
  onWaitResult?: () => void;
}

export const ListingAiVerificationStep: React.FC<ListingAiVerificationStepProps> = ({
  stepNumber = '04',
  stepTitle = 'Xác thực AI & Đối soát chính hãng',
  description = 'Hệ thống chuẩn bị hồ sơ bằng chứng để đối chiếu. Mọi chỉ số dưới đây đều đo trực tiếp từ ảnh bạn đã chụp.',
  product,
  photos = {},
  measuredPhotos = {},
  isChecking = false,
  checkError = null,
  recommendation,
  thresholds,
  analysis = null,
  decision = null,
  signals = null,
  isVerifying = false,
  remainingTokens = null,
  tokenCost,
  verifyError = null,
  onCancel,
  onWaitResult,
}) => {
  const angles = useMemo<AngleQuality[]>(
    () =>
      LISTING_ANGLES.map((angle) => {
        const image = photos[angle.angleType];
        const measured = measuredPhotos[angle.angleType];

        if (!image) {
          return {
            angleType: angle.angleType,
            number: angle.number,
            label: angle.title,
            state: 'missing' as const,
            result: 'Chưa chụp',
            detail: 'Cần ảnh cho góc này để đối chiếu.',
          };
        }

        if (isChecking || !measured) {
          return {
            angleType: angle.angleType,
            number: angle.number,
            label: angle.title,
            image,
            state: 'checking' as const,
            result: isChecking ? 'Đang đo' : 'Chưa có kết quả',
            detail: isChecking ? undefined : 'Chưa nhận được chỉ số đo cho ảnh này.',
          };
        }

        const facts = [
          `${measured.width}×${measured.height} px`,
          describeSharpness(measured.sharpnessScore),
          describeBrightness(measured.brightness),
        ].filter(Boolean);

        return {
          angleType: angle.angleType,
          number: angle.number,
          label: angle.title,
          image,
          state: (measured.isAcceptable ? 'ok' : 'warn') as AngleQualityState,
          result: measured.isAcceptable ? 'Đạt' : 'Cần chụp lại',
          detail: measured.issues.length > 0 ? measured.issues.join(' · ') : facts.join(' · '),
        };
      }),
    [photos, measuredPhotos, isChecking],
  );

  const okCount = angles.filter((angle) => angle.state === 'ok').length;
  const warnCount = angles.filter((angle) => angle.state === 'warn').length;
  const missingCount = angles.filter((angle) => angle.state === 'missing').length;
  const total = angles.length;
  const percent = total > 0 ? Math.round((okCount / total) * 100) : 0;
  const isReady = okCount === total && total > 0;

  /**
   * Token AI còn lại không đủ cho một lần xác thực nữa.
   *
   * Backend chặn (403) khi số dư nhỏ hơn phí, nên báo TRƯỚC khi seller bấm mới
   * bị chặn — nếu không, họ sẽ thấy Bước 04 lỗi mà không hiểu vì sao.
   */
  const isOutOfTokens =
    typeof remainingTokens === 'number' &&
    typeof tokenCost === 'number' &&
    tokenCost > 0 &&
    remainingTokens < tokenCost;

  /** Chỉ số tóm tắt — tất cả suy ra từ dữ liệu đo, không có số bịa đặt. */
  const metrics = useMemo<VerificationMetric[]>(() => {
    const items: VerificationMetric[] = [
      { label: 'GÓC ẢNH ĐẠT', value: `${okCount}/${total}` },
    ];

    if (isChecking) items.push({ label: 'TRẠNG THÁI', value: 'Đang đo ảnh' });

    // Điểm do AI chấm ở Bước 04 (analyze-photos) — số thật từ server.
    if (isVerifying && !analysis) {
      items.push({ label: 'AI', value: 'Đang xác thực…' });
    } else if (analysis) {
      items.push({ label: 'ĐIỂM CHÍNH HÃNG', value: `${analysis.rawScore.toFixed(1)}/100` });
      items.push({ label: 'MÁC / NHÃN', value: `${Math.round(analysis.tagLegitScore)}/100` });
      items.push({ label: 'ĐƯỜNG MAY', value: `${Math.round(analysis.stitchingScore)}/100` });
      items.push({
        label: 'TÌNH TRẠNG',
        value: CONDITION_LABEL[analysis.conditionGrade] ?? analysis.conditionGrade,
      });
    }

    if (signals) {
      items.push({
        label: 'TÍN HIỆU',
        value: `${signals.passedSignals}/${signals.totalSignals} đạt`,
      });
    }

    if (thresholds) {
      items.push({ label: 'NGƯỠNG ĐĂNG TIN', value: `${thresholds.autoPublishThreshold}%` });
    }

    // Số dư token AI. Hiện "còn N" kèm phí mỗi lần để seller hiểu vì sao
    // số này tụt mỗi lần bấm xác thực lại, thay vì tự nhiên mất đi.
    if (typeof remainingTokens === 'number') {
      items.push({
        label: 'TOKEN AI CÒN LẠI',
        value:
          typeof tokenCost === 'number' && tokenCost > 0
            ? `${remainingTokens} (mỗi lần −${tokenCost})`
            : `${remainingTokens}`,
      });
    }

    return items;
  }, [okCount, total, isChecking, thresholds, analysis, signals, isVerifying, remainingTokens, tokenCost]);

  return (
    <>
      <section className="rw-lc-ai" aria-label="Bước 04 xác thực AI và đối soát chính hãng">
        <header className="rw-lc-ai-hero">
          <div className="rw-lc-ai-hero-text">
            <h2 className="rw-lc-ai-hero-title">
              Bước {stepNumber}: {stepTitle}
            </h2>
            <p className="rw-lc-ai-hero-desc">{description}</p>
          </div>
          {metrics.length > 0 && (
            <div className="rw-lc-ai-hero-metrics">
              {metrics.map((metric) => (
                <div key={metric.label} className="rw-lc-ai-metric">
                  <span className="rw-lc-ai-metric-label">{metric.label}</span>
                  <span className="rw-lc-ai-metric-value">{metric.value}</span>
                </div>
              ))}
            </div>
          )}
        </header>

        {checkError && (
          <div className="rw-lc-ai-notice" role="alert">
            <AlertTriangle width={15} height={15} aria-hidden="true" />
            Không đọc được kết quả kiểm tra ảnh: {checkError}
          </div>
        )}

        {isOutOfTokens && (
          <div className="rw-lc-ai-notice" role="alert">
            <AlertTriangle width={15} height={15} aria-hidden="true" />
            Bạn còn <strong>{remainingTokens}</strong> token AI, không đủ cho một
            lần xác thực (mỗi lần tốn <strong>{tokenCost}</strong> token). Hãy
            nạp thêm token để tiếp tục kiểm định sản phẩm.
          </div>
        )}

        {verifyError && (
          <div className="rw-lc-ai-notice" role="alert">
            <AlertTriangle width={15} height={15} aria-hidden="true" />
            Không hoàn tất được bước xác thực AI: {verifyError}
          </div>
        )}

        <div className="rw-lc-ai-columns">
          {/* ══ CỘT TRÁI ══ */}
          <div className="rw-lc-ai-col-main">
            {(decision || isVerifying) && (
              <article className="rw-lc-ai-card">
                <div className="rw-lc-ai-card-head">
                  <h3 className="rw-lc-ai-card-title">
                    {isVerifying ? (
                      <Loader width={17} height={17} aria-hidden="true" />
                    ) : (
                      <CheckCircle2 width={17} height={17} aria-hidden="true" />
                    )}
                    Quyết định đối soát chính hãng
                  </h3>
                  {decision && (
                    <span
                      className={`rw-lc-ai-stage-chip ${DECISION_LABEL[decision.status]?.cls ?? ''}`}
                    >
                      {DECISION_LABEL[decision.status]?.text ?? decision.status}
                    </span>
                  )}
                </div>

                {decision ? (
                  <>
                    <p className="rw-lc-ai-decision-reason">{decision.reason}</p>
                    <p className="rw-lc-ai-decision-recommend">{decision.recommendation}</p>
                  </>
                ) : (
                  <p className="rw-lc-ai-decision-reason">
                    {isVerifying ? 'Đang gọi máy chủ xác thực…' : 'Chưa nhận được quyết định.'}
                  </p>
                )}
              </article>
            )}

            {/* Bảng đối chiếu từng tín hiệu — check-signals */}
            {signals && signals.signals.length > 0 && (
              <article className="rw-lc-ai-card">
                <div className="rw-lc-ai-card-head">
                  <h3 className="rw-lc-ai-card-title">
                    <CheckCircle2 width={17} height={17} aria-hidden="true" />
                    Đối chiếu tín hiệu thị giác
                  </h3>
                  <span className="rw-lc-ai-card-side">
                    {signals.passedSignals}/{signals.totalSignals} đạt
                  </span>
                </div>
                <ul className="rw-lc-ai-signals">
                  {signals.signals.map((signal, index) => (
                    <li
                      key={`${signal.signalName}-${index}`}
                      className={`rw-lc-ai-signal ${signal.isPassed ? 'pass' : 'fail'}`}
                    >
                      <span className="rw-lc-ai-signal-name">{signal.signalName}</span>
                      <span className="rw-lc-ai-signal-note">{signal.note}</span>
                      <span className="rw-lc-ai-signal-chip">
                        {signal.isPassed ? 'Đạt' : 'Trượt'}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            )}

            {/* Thẻ 1: Kết quả kiểm tra ảnh */}
            <article className="rw-lc-ai-card">
              <div className="rw-lc-ai-card-head">
                <h3 className="rw-lc-ai-card-title">
                  {isChecking ? (
                    <Loader width={17} height={17} aria-hidden="true" />
                  ) : (
                    <CheckCircle2 width={17} height={17} aria-hidden="true" />
                  )}
                  Kết quả kiểm tra bằng chứng ảnh
                </h3>
                <span className="rw-lc-ai-card-side">
                  {isChecking ? 'Đang đo…' : `${okCount}/${total} góc đạt`}
                </span>
              </div>

              <div className="rw-lc-ai-progress-top">
                <strong className="rw-lc-ai-pct">{percent}%</strong>
                <span className="rw-lc-ai-tokens">
                  {isChecking
                    ? 'Đang kiểm tra ảnh'
                    : warnCount === 0 && missingCount === 0
                      ? 'Tất cả ảnh đạt yêu cầu'
                      : [
                          warnCount > 0 ? `${warnCount} góc cần chụp lại` : '',
                          missingCount > 0 ? `${missingCount} góc chưa chụp` : '',
                        ]
                          .filter(Boolean)
                          .join(' • ')}
                </span>
              </div>
              <div
                className="rw-lc-ai-bar-track"
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <span className="rw-lc-ai-bar-fill" style={{ width: `${percent}%` }} />
              </div>

              {recommendation && !isChecking && (
                <div className="rw-lc-ai-stage-panel">
                  <div className="rw-lc-ai-stage-panel-text">
                    <span className="rw-lc-ai-stage-eyebrow">HƯỚNG DẪN</span>
                    <p className="rw-lc-ai-stage-panel-desc">{recommendation}</p>
                  </div>
                </div>
              )}
            </article>
            {/* Thẻ 2: Chỉ số từng góc ảnh */}
            <article className="rw-lc-ai-card">
              <div className="rw-lc-ai-card-head">
                <h3 className="rw-lc-ai-card-title">Chỉ số từng góc ảnh</h3>
                <span className="rw-lc-ai-card-side">Đo trực tiếp trên ảnh của bạn</span>
              </div>

              <div className="rw-lc-ai-angles" role="list">
                {angles.map((angle) => (
                  <div
                    key={angle.angleType}
                    role="listitem"
                    className={`rw-lc-ai-angle${angle.state === 'checking' ? ' is-scanning' : ''}`}
                  >
                    <span className="rw-lc-ai-angle-label">
                      <i>{angle.number}.</i>
                      {angle.label}
                      {angle.detail && <em className="rw-lc-ai-angle-detail">{angle.detail}</em>}
                    </span>
                    <span className={`rw-lc-ai-angle-chip ${angleChipClass(angle.state)}`.trim()}>
                      {angle.state === 'checking' && (
                        <Loader width={12} height={12} aria-hidden="true" />
                      )}
                      {angle.state === 'missing' && (
                        <ImageOff width={12} height={12} aria-hidden="true" />
                      )}
                      {angle.result}
                    </span>
                  </div>
                ))}
              </div>
            </article>

            {/* Thẻ 3: Điều kiện qua bước */}
            <article className="rw-lc-ai-tip">
              <div className="rw-lc-ai-tip-head">
                <span className="rw-lc-ai-tip-icon" aria-hidden="true">
                  <CheckCircle2 width={16} height={16} />
                </span>
                <span className="rw-lc-ai-tip-title">Điều kiện qua bước này</span>
              </div>
              <p className="rw-lc-ai-tip-desc">
                {isChecking
                  ? 'Đang đo chất lượng ảnh, vui lòng chờ…'
                  : isReady
                    ? 'Đủ 4 góc ảnh và mọi ảnh đều đạt chất lượng. Bạn có thể sang Bước 05 để xem kết luận thẩm định.'
                    : missingCount > 0
                      ? `Còn ${missingCount} góc ảnh chưa chụp. Vui lòng quay lại Bước 02 để bổ sung trước khi kiểm định.`
                      : `Có ${warnCount} góc ảnh chưa đạt chất lượng. Nên chụp lại để kết quả kiểm định chính xác hơn.`}
              </p>
            </article>
          </div>
          {/* ══ CỘT PHẢI ══ */}
          <aside className="rw-lc-ai-col-side">
            {/* Sản phẩm đang thẩm định — dữ liệu người bán nhập ở Bước 01 */}
            <article className="rw-lc-ai-card">
              <div className="rw-lc-ai-product-head">
                <span className="rw-lc-ai-product-label">Sản phẩm đang thẩm định</span>
              </div>
              <div className="rw-lc-ai-product">
                <div className="rw-lc-ai-product-media">
                  {product?.image ? (
                    <img src={product.image} alt={product.name ?? 'Ảnh sản phẩm'} loading="lazy" />
                  ) : (
                    <span className="rw-lc-review-thumb-empty">
                      <ImageOff width={22} height={22} aria-hidden="true" />
                      Chưa có ảnh
                    </span>
                  )}
                </div>
                <div>
                  <div className="rw-lc-ai-product-name">
                    {product?.name?.trim() || 'Chưa nhập tên sản phẩm'}
                  </div>
                  <div className="rw-lc-ai-product-meta">
                    {[product?.brand, product?.size, product?.color]
                      .filter(Boolean)
                      .join(' • ') || 'Chưa nhập thông tin'}
                  </div>
                  <div className="rw-lc-ai-product-price">
                    {product?.price?.trim() || 'Chưa nhập giá'}
                  </div>
                  <div className="rw-lc-ai-product-sku">
                    {product?.sku?.trim() || 'Chưa nhập mã sản phẩm'}
                  </div>
                </div>
              </div>
            </article>

            {/* Trạng thái các góc bằng chứng đã nộp */}
            <article className="rw-lc-ai-card">
              <div className="rw-lc-ai-card-head">
                <h3 className="rw-lc-ai-card-title">
                  Góc bằng chứng đã nộp ({okCount + warnCount}/{total})
                </h3>
                <span className="rw-lc-ai-stage-chip done">
                  {missingCount === 0 ? 'Đủ góc' : `Thiếu ${missingCount}`}
                </span>
              </div>
              <div className="rw-lc-ai-angles" role="list">
                {angles.map((angle) => (
                  <div
                    key={`sub-${angle.angleType}`}
                    role="listitem"
                    className="rw-lc-ai-angle"
                  >
                    <span className="rw-lc-ai-angle-label">
                      <i>{angle.number}.</i>
                      {angle.label}
                    </span>
                    <span className={`rw-lc-ai-angle-chip ${angleChipClass(angle.state)}`.trim()}>
                      {angle.result}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          </aside>
        </div>
      </section>

      <div className="rw-lc-ai-actionbar">
        <div className="rw-lc-ai-actionbar-inner">
          <button type="button" className="rw-lc-ai-btn rw-lc-ai-btn-cancel" onClick={onCancel}>
            <X width={15} height={15} aria-hidden="true" />
            Quay lại Bước 03
          </button>

          <div className="rw-lc-ai-actionbar-btns">
            <button
              type="button"
              className="rw-lc-ai-btn rw-lc-ai-btn-primary"
              onClick={onWaitResult}
              disabled={!isReady}
            >
              <span className="rw-lc-ai-btn-spin" aria-hidden="true">
                <Loader width={15} height={15} />
              </span>
              {isReady ? 'Xem kết quả thẩm định' : 'Cần đủ ảnh đạt để tiếp tục'}
            </button>
          </div>
        </div>
      </div>

      {/* Khoảng đệm cuối trang để thanh cố định không che nội dung */}
      <div className="rw-lc-ai-actionbar-space" aria-hidden="true" />
    </>
  );
};

export default ListingAiVerificationStep;
