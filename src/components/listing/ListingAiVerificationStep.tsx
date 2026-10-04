import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, ImageOff, Loader, Sparkles, X } from 'lucide-react';
import { LISTING_ANGLES } from '../../features/listing/constants/listingAngles';
import {
  AiScanResult,
  AiImageDetectionResult,
  DatasetMatchResult,
  SignalCheckResult,
  VerificationDecision,
  VerificationThresholds,
  VisualSignal,
} from '../../types/verification.type';
import '../../styles/listing/ListingAiVerificationStep.css';

/* ─── Types ─────────────────────────────────────────── */

/** Trạng thái một góc ảnh, tính từ kết quả đo thật của Bước 03. */
export type AngleQualityState = 'ok' | 'warn' | 'missing' | 'checking';

export interface AngleQuality {
  angleType: string;
  number: string;
  label: string;
  /** Tên tiếng Anh của góc, lấy từ `LISTING_ANGLES` để đối chiếu với chuẩn hãng. */
  subtitle?: string;
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

/** Nhãn tiếng Việt cho phân khúc brand do backend quyết định. */
const SEGMENT_LABEL: Record<string, string> = {
  LUXURY: 'LUXURY — thương hiệu cao cấp',
  POPULAR: 'POPULAR — thương hiệu phổ thông',
  LOCAL_NO_BRAND: 'Không nhãn hiệu',
};

/**
 * Bỏ số 0 thừa cho giao diện gọn (85.5 → "85.5", 85.00 → "85").
 */
const formatScore = (value: number): string =>
  Number.isFinite(value) ? String(Math.round(value * 10) / 10) : '—';

/** Chuyển `GRADE_A_EXCELLENT` thành `A / Xuất sắc` cho dễ đọc. */
const CONDITION_LABEL: Record<string, string> = {
  GRADE_S_LIKE_NEW: 'S — Như mới',
  GRADE_A_EXCELLENT: 'A — Xuất sắc',
  GRADE_B_GOOD: 'B — Tốt',
  GRADE_C_FAIR: 'C — Chấp nhận được',
};

const angleChipClass = (state: AngleQualityState) =>
  state === 'ok'
    ? 'pass'
    : state === 'warn'
      ? 'match'
      : state === 'checking'
        ? 'scanning'
        : '';

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
  /** Mức độ khớp với data set chuẩn của hãng, kèm mức trừ tương ứng. */
  datasetMatch?: DatasetMatchResult | null;
  /** Kết quả phát hiện ảnh AI nếu backend đã chạy kiểm tra này. */
  aiImageDetection?: AiImageDetectionResult | null;
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
  /**
   * Hạn mức token khởi tạo của SELLER mới (`sellerDefaultAiTokenQuota`
   * từ `GET /thresholds`) — mẫu số cho hiển thị "còn 9/10".
   */
  tokenQuota?: number;
  /**
   * Backend đã chặn (403) vì hết quota token AI.
   *
   * Khác với việc tự suy ra từ `remainingTokens`: cờ này do chính lần gọi API
   * thất bại trả về, nên vẫn đáng tin khi chưa đọc được số dư.
   */
  quotaExceeded?: boolean;
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
  datasetMatch = null,
  aiImageDetection = null,
  decision = null,
  signals = null,
  isVerifying = false,
  remainingTokens = null,
  tokenCost,
  tokenQuota,
  quotaExceeded = false,
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
            subtitle: angle.subtitle,
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
            subtitle: angle.subtitle,
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
          subtitle: angle.subtitle,
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
   * Điểm phân tích để hiển thị. Cả `analyze-photos` và `verify-and-decide` đều
   * trả `AiScanResult`; ưu tiên kết quả của `analyze-photos` và fallback sang
   * điểm AI gộp trong quyết định, để Bước 04 không bị trống khi một endpoint lỗi.
   */
  const aiScores = analysis ?? decision?.aiScores ?? null;

  /**
   * Bản báo giải thích mức trừ vì thiếu bill của hàng LUXURY.
   *
   * QUAN TRỌNG — chỉ ĐỌC số backend đã tính, tuyệt đối không tự nhân lại ở
   * client. Backend đã áp `baseScore * (1 - penalty / 100)` rồi mới so ngưỡng
   * (`AiVerificationExampleController.cs`); nếu ở đây trừ thêm lần nữa thì điểm
   * sẽ bị trừ hai lần (100 → 85 → 72.25) và tệ hơn hẳn nghiệp vụ.
   *
   * Vì backend gộp cả trừ thiếu bill lẫn trừ lệch dataset vào `penaltyPercent`,
   * ta hiện mũi tên `điểm gốc → điểm cuối` thay vì gán con số riêng cho bill.
   * Mức trừ bill đọc từ `thresholds.missingBillPenaltyPercent` (cùng key cấu
   * hình `MISSING_BILL_PENALTY_PERCENT` của backend) và chỉ hiện khi có sẵn.
   */
  const billPenaltyNote = useMemo(() => {
    if (!decision?.missingBillPenaltyApplied) return null;

    const base = decision.baseScore;
    const final = decision.finalScore;
    const percent = thresholds?.missingBillPenaltyPercent;

    const mathText =
      Number.isFinite(base) && Number.isFinite(final) && base > final
        ? `${formatScore(base)} → ${formatScore(final)}`
        : null;

    return {
      mathText,
      percentText: typeof percent === 'number' && percent > 0 ? `−${percent}%` : null,
    };
  }, [decision, thresholds]);

  /**
   * Câu giải thích tiếng Việt cho kết quả quyết định.
   *
   * Thay cho `decision.recommendation` của backend (tiếng Anh máy dịch) và thay
   * cho `decision.reason` (chuỗi kỹ thuật có mã grade + con số lặp lại). Câu này
   * chỉ nói điều seller quan tâm: điểm họ đạt được nằm ở đâu so với ngưỡng, và
   * vì vậy hồ sơ rơi vào kết quả nào.
   *
   * Chỉ hiện ngưỡng khi `thresholds` có sẵn; thiếu thì vẫn kết luận được nhờ
   * `status` nên câu vẫn có giá trị.
   */
  const decisionSummary = useMemo(() => {
    if (!decision) return null;

    const score = formatScore(decision.finalScore);
    const publish = thresholds?.autoPublishThreshold;
    const reject = thresholds?.autoRejectThreshold;
    const limit = (value: number | undefined) =>
      typeof value === 'number' ? String(value) : null;

    if (decision.status === 'APPROVED') {
      const p = limit(publish);
      return p
        ? `Điểm ${score} đã đạt ngưỡng đăng tin (từ ${p} điểm). Hồ sơ sẽ được đăng.`
        : `Điểm ${score} đạt yêu cầu. Hồ sơ sẽ được đăng.`;
    }

    if (decision.status === 'REJECTED') {
      const r = limit(reject);
      return r
        ? `Điểm ${score} thấp hơn ngưỡng từ chối ${r} điểm, nên hồ sơ bị từ chối.`
        : `Điểm ${score} quá thấp, nên hồ sơ bị từ chối.`;
    }

    // REVIEW_NEEDED — trạng thái phổ biến nhất nên nói rõ khoảng ngưỡng.
    if (typeof reject === 'number' && typeof publish === 'number') {
      return `Điểm ${score} nằm trong khoảng cần Admin xem xét (từ ${reject} đến dưới ${publish} điểm).`;
    }
    return `Điểm ${score} chưa đủ để tự động đăng, cần Admin xem xét thủ công.`;
  }, [decision, thresholds]);

  /** Các góc AI không đọc được — đánh dấu để seller biết cần chụp lại góc nào. */
  const aiFailedAngles = useMemo(
    () => new Set<string>(aiScores?.failedImageAngles ?? []),
    [aiScores],
  );

  /**
   * Danh sách tín hiệu hiển thị.
   *
   * `check-signals` là nguồn đầy đủ nhất (kèm số đạt/trượt); chỉ fallback sang
   * `visualSignals` của `analyze-photos` khi endpoint đó không trả về, để không
   * hiện hai bản giống nhau.
   */
  const signalSource = signals && signals.signals.length > 0 ? signals : null;
  const signalList: VisualSignal[] = signalSource
    ? signalSource.signals
    : analysis?.visualSignals ?? [];
  const signalTotal = signalSource?.totalSignals ?? signalList.length;
  const signalPassed =
    signalSource?.passedSignals ?? signalList.filter((item) => item.isPassed).length;

  /**
   * Token AI còn lại không đủ cho một lần xác thực nữa.
   *
   * Backend chặn (403) khi số dư nhỏ hơn phí, nên báo TRƯỚC khi seller bấm mới
   * bị chặn — nếu không, họ sẽ thấy Bước 04 lỗi mà không hiểu vì sao.
   */
  const isOutOfTokens =
    quotaExceeded ||
    (typeof remainingTokens === 'number' &&
      typeof tokenCost === 'number' &&
      tokenCost > 0 &&
      remainingTokens < tokenCost);

  /** Chỉ sang Bước 05 khi ẢNH ĐẠT và còn đủ token để xem kết quả. */
  const canProceed = isReady && !isOutOfTokens;

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

    // Số dư token AI. Hiện "còn 9/10" (số dư / hạn mức khởi tạo từ
    // `SELLER_DEFAULT_AI_TOKEN_QUOTA`) kèm phí mỗi lần để seller hiểu vì sao
    // số này tụt mỗi lần bấm xác thực lại, thay vì tự nhiên mất đi.
    if (typeof remainingTokens === 'number') {
      const quotaSuffix =
        typeof tokenQuota === 'number' && tokenQuota > 0 ? `/${tokenQuota}` : '';
      items.push({
        label: 'TOKEN AI CÒN LẠI',
        value:
          typeof tokenCost === 'number' && tokenCost > 0
            ? `${remainingTokens}${quotaSuffix} (mỗi lần −${tokenCost})`
            : `${remainingTokens}${quotaSuffix}`,
      });
    }

    return items;
  }, [okCount, total, isChecking, thresholds, analysis, signals, isVerifying, remainingTokens, tokenCost, tokenQuota]);

  /*
   * Pop-up báo hết quota token AI.
   *
   * Mở tự động ở lần ĐẦU phát hiện hết quota để seller hiểu vì sao nút xem kết
   * quả bị khoá; sau đó tôn trọng thao tác đóng của họ (không bật lại liên tục).
   * Khi số dư được nạp lại thì trạng thái đóng cũng tự đặt lại.
   */
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
  const wasOutOfTokens = useRef(false);

  useEffect(() => {
    if (isOutOfTokens && !wasOutOfTokens.current) setIsQuotaModalOpen(true);
    if (!isOutOfTokens) setIsQuotaModalOpen(false);
    wasOutOfTokens.current = isOutOfTokens;
  }, [isOutOfTokens]);

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

        {(checkError || isOutOfTokens || verifyError) && (
          <div className="rw-lc-ai-notices">
            {checkError && (
              <div className="rw-lc-ai-notice is-error" role="alert">
                <AlertTriangle width={16} height={16} aria-hidden="true" />
                <span>Không đọc được kết quả kiểm tra ảnh: {checkError}</span>
              </div>
            )}

            {isOutOfTokens && (
              <div className="rw-lc-ai-notice is-warn" role="alert">
                <AlertTriangle width={16} height={16} aria-hidden="true" />
                <span>
                  Bạn còn <strong>{remainingTokens}</strong> token AI, không đủ cho một
                  lần xác thực (mỗi lần tốn <strong>{tokenCost}</strong> token). Hãy nạp
                  thêm token để tiếp tục kiểm định sản phẩm.
                </span>
              </div>
            )}

            {verifyError && (
              <div className="rw-lc-ai-notice is-error" role="alert">
                <AlertTriangle width={16} height={16} aria-hidden="true" />
                <span>Không hoàn tất được bước xác thực AI: {verifyError}</span>
              </div>
            )}
          </div>
        )}

        <div className="rw-lc-ai-columns">
          {/* ══ CỘT TRÁI ══ */}
          <div className="rw-lc-ai-col-main">
            {(decision || isVerifying) && (
              <article
                className={`rw-lc-ai-card rw-lc-ai-verdict ${
                  decision ? (DECISION_LABEL[decision.status]?.cls ?? '') : ''
                }`.trim()}
              >
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
                    {/*
                      Kết quả kiểm định. Đọc thẳng từ `decision` — KHÔNG tự tính
                      lại ở client, vì backend đã áp trừ trước khi so ngưỡng; tính
                      thêm lần nữa sẽ trừ hai lần.
                    */}
                    <div className="rw-lc-ai-result">
                      <div className="rw-lc-ai-result-item">
                        <span>Điểm cuối cùng</span>
                        <b>{formatScore(decision.finalScore)}/100</b>
                      </div>
                      <div className="rw-lc-ai-result-item">
                        <span>Mức trừ</span>
                        <b>
                          −{decision.penaltyPoints ?? decision.penaltyPercent} điểm
                        </b>
                      </div>
                      <div className="rw-lc-ai-result-item">
                        <span>Phân khúc</span>
                        <b>{SEGMENT_LABEL[decision.brandSegment] ?? decision.brandSegment}</b>
                      </div>
                      <div className="rw-lc-ai-result-item">
                        <span>Hoá đơn</span>
                        <b>{decision.hasBillPhoto ? 'Đã tải lên' : 'Chưa có'}</b>
                      </div>
                    </div>

                    {/*
                      Giải thích rõ vì sao bị trừ điểm. Trước đây ô "Mức trừ" chỉ
                      hiện −15% mà không nói lý do, seller thấy mất điểm nhưng
                      không biết do thiếu bill hay do ảnh lệch data set.
                      Con số đọc thẳng từ `decision` của backend, không tính lại.
                    */}
                    {billPenaltyNote && (
                      <div className="rw-lc-ai-bill-note">
                        <span className="rw-lc-ai-bill-note-eyebrow">
                          <AlertTriangle width={14} height={14} aria-hidden="true" />
                          Bị trừ điểm vì thiếu hoá đơn
                        </span>
                        <p className="rw-lc-ai-bill-note-text">
                          Sản phẩm thuộc phân khúc <strong>LUXURY</strong> nên bắt buộc
                          phải có ảnh hoá đơn của hãng. Bạn chưa tải hoá đơn, vì vậy
                          điểm tin cậy bị trừ
                          {billPenaltyNote.percentText && (
                            <> <strong>{billPenaltyNote.percentText}</strong></>
                          )}
                          .
                          {billPenaltyNote.mathText && (
                            <>
                              {' '}Điểm tính được:{' '}
                              <strong className="rw-lc-ai-bill-math">
                                {billPenaltyNote.mathText}
                              </strong>
                              .
                            </>
                          )}{' '}
                          Tải ảnh hoá đơn và xác thực lại để lấy lại mức trừ này.
                        </p>
                      </div>
                    )}
                    {/*
                      KHÔNG hiện `decision.reason` — đó là chuỗi kỹ thuật thô
                      backend trả về cho dev, ví dụ:
                      "Score: 70.12 | Grade: GRADE_A_EXCELLENT | Missing bill
                      photo (-15%): base score 82.50 reduced because...".
                      Toàn tiếng Anh, lẫn mã grade, lặp lại đúng những con số đã
                      hiện ở các ô phía trên (điểm cuối, mức trừ, phân khúc), khiến
                      seller đọc rối mà không thêm thông tin gì.

                      Giữ lại trong log kỹ thuật qua `console.debug` để khi cần
                      truy vết vẫn có full context, còn trên giao diện chỉ còn
                      phần tiếng Việt đã dịch sẵn.
                    */}
                    {decision.reason && console.debug('[AI] decision.reason:', decision.reason)}
                    {decision.recommendation &&
                      console.debug('[AI] decision.recommendation:', decision.recommendation)}
                    {/*
                      `recommendation` của backend cũng là tiếng Anh máy dịch
                      ("Final score 70.12 requires manual review") và nói lại đúng
                      nội dung chip trạng thái phía trên, nên hiển thị câu tiếng
                      Việt tự dựng — kèm ngưỡng để seller hiểu vì sao hồ sơ rơi
                      vào kết quả đó.
                    */}
                    {decisionSummary && (
                      <p className="rw-lc-ai-decision-recommend">{decisionSummary}</p>
                    )}
                  </>
                ) : (
                  <p className="rw-lc-ai-decision-reason">
                    {isVerifying ? 'Đang gọi máy chủ xác thực…' : 'Chưa nhận được quyết định.'}
                  </p>
                )}
              </article>
            )}

            {/* Bảng đối chiếu từng tín hiệu — check-signals (fallback: analyze-photos) */}
            {signalList.length > 0 && (
              <article className="rw-lc-ai-card">
                <div className="rw-lc-ai-card-head">
                  <h3 className="rw-lc-ai-card-title">
                    <CheckCircle2 width={17} height={17} aria-hidden="true" />
                    Đối chiếu tín hiệu thị giác
                  </h3>
                  <span className="rw-lc-ai-card-side">
                    {signalPassed}/{signalTotal} đạt
                  </span>
                </div>
                <ul className="rw-lc-ai-signals">
                  {signalList.map((signal, index) => (
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
            {/* Bộ ảnh đã chụp ở Bước 02 và đo ở Bước 03 — hiện ẢNH THẬT kèm chỉ số và cờ AI */}
            <article className="rw-lc-ai-card">
              <div className="rw-lc-ai-card-head">
                <h3 className="rw-lc-ai-card-title">
                  <CheckCircle2 width={17} height={17} aria-hidden="true" />
                  Bộ ảnh đã kiểm định
                </h3>
                <span className="rw-lc-ai-card-side">
                  {okCount + warnCount}/{total} góc có ảnh
                </span>
              </div>

              <div className="rw-lc-ai-gallery">
                {angles.map((angle) => {
                  const aiFlagged = aiFailedAngles.has(angle.angleType);
                  return (
                    <figure
                      key={angle.angleType}
                      className={`rw-lc-ai-shot is-${angle.state}${aiFlagged ? ' is-ai-flagged' : ''}`}
                    >
                      <div className="rw-lc-ai-shot-media">
                        {angle.image ? (
                          <img
                            src={angle.image}
                            alt={`Ảnh góc ${angle.number} — ${angle.label}`}
                            loading="lazy"
                          />
                        ) : (
                          <span className="rw-lc-ai-shot-empty">
                            <ImageOff width={20} height={20} aria-hidden="true" />
                            Chưa chụp
                          </span>
                        )}
                        <span className="rw-lc-ai-shot-badge">{angle.number}</span>
                        <span className={`rw-lc-ai-shot-chip ${angleChipClass(angle.state)}`.trim()}>
                          {angle.result}
                        </span>
                      </div>
                      <figcaption className="rw-lc-ai-shot-caption">
                        <b>{angle.label}</b>
                        {angle.subtitle && <span>{angle.subtitle}</span>}
                        {angle.detail && <em>{angle.detail}</em>}
                        {aiFlagged && (
                          <span className="rw-lc-ai-shot-ai">AI không đọc được góc này</span>
                        )}
                      </figcaption>
                    </figure>
                  );
                })}
              </div>
            </article>

            {/* Phân tích chi tiết của AI — điểm thành phần, độ khớp data set,
                phát hiện ảnh AI và các cờ mờ / chụp hụt. */}
            {(aiScores || datasetMatch || aiImageDetection) && (
              <article className="rw-lc-ai-card">
                <div className="rw-lc-ai-card-head">
                  <h3 className="rw-lc-ai-card-title">
                    <Sparkles width={17} height={17} aria-hidden="true" />
                    Phân tích chi tiết từ AI
                  </h3>
                  <span className="rw-lc-ai-card-side">
                    {aiScores
                      ? `Điểm AI ${Math.round(aiScores.rawScore)}/100`
                      : 'Chưa có điểm AI'}
                  </span>
                </div>

                {aiScores && (
                  <div className="rw-lc-ai-scores">
                    {[
                      { label: 'Điểm chính hãng', value: aiScores.rawScore },
                      { label: 'Mác / Nhãn', value: aiScores.tagLegitScore },
                      { label: 'Đường may & Khóa kéo', value: aiScores.stitchingScore },
                      ...(datasetMatch
                        ? [{ label: 'Khớp dữ liệu hãng', value: datasetMatch.matchScore }]
                        : []),
                    ].map((row) => (
                      <div key={row.label} className="rw-lc-ai-score">
                        <span className="rw-lc-ai-score-label">{row.label}</span>
                        <span className="rw-lc-ai-score-value">{Math.round(row.value)}/100</span>
                        <span className="rw-lc-ai-score-track">
                          <span
                            className={`rw-lc-ai-score-fill ${
                              row.value >= 80 ? 'pass' : row.value >= 60 ? 'match' : 'fail'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, row.value))}%` }}
                          />
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {aiScores && (
                  <div className="rw-lc-ai-chips">
                    <span className="rw-lc-ai-mini-chip">
                      Tình trạng:{' '}
                      {CONDITION_LABEL[aiScores.conditionGrade] ?? aiScores.conditionGrade}
                    </span>
                    {aiScores.isBlur && (
                      <span className="rw-lc-ai-mini-chip is-warn">AI thấy ảnh mờ</span>
                    )}
                    {aiFailedAngles.size > 0 && (
                      <span className="rw-lc-ai-mini-chip is-warn">
                        {aiFailedAngles.size} góc AI không đọc được
                      </span>
                    )}
                  </div>
                )}

            {aiImageDetection && (
                  <div className="rw-lc-ai-stage-panel">
                    <div className="rw-lc-ai-stage-panel-text">
                      <span className="rw-lc-ai-stage-eyebrow">KIỂM TRA ẢNH AI</span>
                      <p className="rw-lc-ai-stage-panel-desc">
                        {aiImageDetection.isAiGenerated
                          ? `Phát hiện dấu hiệu ảnh được tạo bởi AI${
                              typeof aiImageDetection.confidence === 'number'
                                ? ` (độ tin cậy ${Math.round(aiImageDetection.confidence)}%)`
                                : ''
                            }. Điểm tin cậy ảnh bị trừ ${aiImageDetection.penaltyPercent}%.`
                          : (aiImageDetection.reason ??
                            'Không phát hiện dấu hiệu ảnh được tạo bởi AI.')}
                      </p>
                    </div>
                  </div>
                )}

                {datasetMatch &&
                  (datasetMatch.hasMismatchWarning ||
                    datasetMatch.mismatchedSignals.length > 0) && (
                    <div className="rw-lc-ai-stage-panel is-warn">
                      <div className="rw-lc-ai-stage-panel-text">
                        <span className="rw-lc-ai-stage-eyebrow">ĐỐI CHIẾU DATA SET HÃNG</span>
                        <p className="rw-lc-ai-stage-panel-desc">
                          {datasetMatch.warning}
                          {datasetMatch.mismatchedSignals.length > 0 &&
                            ` Tín hiệu chưa khớp: ${datasetMatch.mismatchedSignals.join(' · ')}.`}
                          {datasetMatch.explanation && ` ${datasetMatch.explanation}`}
                          {datasetMatch.penaltyPercent > 0 &&
                            ` Mức trừ: −${datasetMatch.penaltyPercent}%.`}
                        </p>
                      </div>
                    </div>
                  )}
              </article>
            )}

            {/* Thẻ 3: Điều kiện qua bước */}
            <article className={`rw-lc-ai-tip${isReady ? ' is-ready' : ''}`}>
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

            {/*
              Danh sách góc ảnh chi tiết đã chuyển lên cột trái dạng gallery kèm
              ảnh thật, nên cột phải không lặp lại nữa.
            */}
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
              disabled={!canProceed}
            >
              {canProceed ? (
                <CheckCircle2 width={15} height={15} aria-hidden="true" />
              ) : isOutOfTokens ? (
                <AlertTriangle width={15} height={15} aria-hidden="true" />
              ) : (
                <Loader
                  className="rw-lc-ai-btn-spin"
                  width={15}
                  height={15}
                  aria-hidden="true"
                />
              )}
              {isOutOfTokens
                ? 'Hết quota token AI'
                : canProceed
                  ? 'Xem kết quả thẩm định'
                  : 'Cần đủ ảnh đạt để tiếp tục'}
            </button>
          </div>
        </div>
      </div>

      {/* Khoảng đệm nhỏ cuối trang để nút không dính sát mép dưới. */}
      <div className="rw-lc-ai-actionbar-space" aria-hidden="true" />

      {/*
        Pop-up chặn xem kết quả khi hết token AI. Bấm ra ngoài hoặc nút "Đã hiểu"
        đều đóng được; nút xem kết quả vẫn bị khoá cho tới khi nạp thêm token.
      */}
      {isQuotaModalOpen && (
        <div
          className="rw-lc-ai-quota-overlay"
          role="presentation"
          onClick={() => setIsQuotaModalOpen(false)}
        >
          <div
            className="rw-lc-ai-quota-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="rw-lc-ai-quota-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="rw-lc-ai-quota-close"
              onClick={() => setIsQuotaModalOpen(false)}
              aria-label="Đóng thông báo"
            >
              <X width={16} height={16} aria-hidden="true" />
            </button>

            <span className="rw-lc-ai-quota-icon" aria-hidden="true">
              <AlertTriangle width={22} height={22} />
            </span>

            <p className="rw-lc-ai-quota-eyebrow">HẾT QUOTA TOKEN AI</p>
            <h3 id="rw-lc-ai-quota-title">Không đủ token để xem kết quả</h3>
            <p>
              Mỗi lượt kiểm định tốn <strong>{tokenCost ?? 1} token</strong>. Số dư
              hiện tại không đủ cho một lượt xác thực, nên hệ thống đã khoá nút xem
              kết quả ở Bước 05. Hãy nạp thêm token rồi thực hiện lại xác thực.
            </p>

            <div className="rw-lc-ai-quota-usage">
              <span>Số dư hiện tại</span>
              <b>{typeof remainingTokens === 'number' ? remainingTokens : 0} token</b>
            </div>

            <button
              type="button"
              className="rw-lc-ai-btn rw-lc-ai-btn-primary"
              onClick={() => setIsQuotaModalOpen(false)}
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ListingAiVerificationStep;
