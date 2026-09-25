import React, { useState } from 'react';
import {
  AudioWaveform,
  Bell,
  Brain,
  Layers,
  Loader,
  Lock,
  MapPin,
  ShieldCheck,
  X,
  Zap,
} from 'lucide-react';
import trenchCoatImage from '../../assets/images/Burberry-Trench-Coat-Folded.png';
import '../../styles/listing/ListingAiVerificationStep.css';

/* ─── Types ─────────────────────────────────────────── */
export type AiVerificationStageState = 'done' | 'match' | 'processing' | 'pending';

export interface AiVerificationStage {
  /** Số thứ tự hiển thị trong ô vuông, ví dụ "01" */
  id: string;
  title: string;
  detail: string;
  state: AiVerificationStageState;
  /** Nhãn trạng thái bên phải, ví dụ "Đã đạt (0.4s)" */
  result: string;
}

export type EvidenceAngleState = 'pass' | 'match' | 'scanning' | 'pending';

export interface AiVerificationEvidenceAngle {
  id: string;
  label: string;
  state: EvidenceAngleState;
  result: string;
}

export interface AiVerificationMetric {
  label: string;
  value: string;
  /** Bôi xanh giá trị (dùng cho chỉ số độ trễ) */
  accent?: boolean;
}

export interface AiVerificationProduct {
  image?: string;
  tier?: string;
  name?: string;
  meta?: string;
  price?: string;
  sku?: string;
}

interface MicroTextureBar {
  height: number;
  tone: 'dark' | 'light' | 'empty';
}

/* ─── Dữ liệu mặc định ───────────────────────────────── */
export const AI_VERIFICATION_STAGES: AiVerificationStage[] = [
  {
    id: '01',
    title: 'Giai đoạn 01: Chuẩn hoá & Cân bằng độ mầu ảnh (5410K)',
    detail: 'Hiệu chỉnh độ bão hoà, chuẩn hoá màu trên không gian màu đối chiếu chuẩn.',
    state: 'done',
    result: 'Đã đạt (0.4s)',
  },
  {
    id: '02',
    title: 'Giai đoạn 02: Đối soát tem hãng định Burberry và mẫu chuẩn 1990–1998',
    detail: 'Phù hợp phôi chi tiết khoá các ký tự sườn và chỉ đỏ cổ điển.',
    state: 'match',
    result: 'Khớp 99.2% (0.9s)',
  },
  {
    id: '03',
    title: 'Giai đoạn 03: Đánh giá độ căng chỉ ve áo (8.8 SPI) & Độ mòn tự nhiên',
    detail: 'Phát hiện 8.6 mũi khâu/inch (Chuẩn trung bình UK: 8.5 – 9.0 SPI). Đang đối soát vi cấu trúc vải.',
    state: 'processing',
    result: 'Đang xử lý (76%)',
  },
  {
    id: '04',
    title: 'Giai đoạn 04: Tổng hợp điểm tin cậy & Phân loại cấp tình trạng',
    detail: 'Xác định phân loại Excellent/Great và tạo hồ sơ sản phẩm.',
    state: 'pending',
    result: 'Chờ xử lý',
  },
  {
    id: '05',
    title: 'Giai đoạn 05: Đóng gói hồ sơ bằng chứng số & Cấp mã token bằng chứng',
    detail: 'Mã hoá cryptographic hash chứng nhận lưu ký Smart-Escrow.',
    state: 'pending',
    result: 'Chờ xử lý',
  },
];

export const AI_VERIFICATION_ANGLES: AiVerificationEvidenceAngle[] = [
  { id: '01', label: 'Phom dáng toàn thân', state: 'pass', result: 'Đạt' },
  { id: '02', label: 'Nhãn mác cổ áo (Tag)', state: 'match', result: 'Khớp 99.2%' },
  { id: '03', label: 'Ve áo & Mũi may chỉ', state: 'scanning', result: 'Đang quét' },
  { id: '04', label: 'Cúc áo & Khóa kim loại', state: 'pending', result: 'Chờ quét' },
  { id: '05', label: 'Sợi chỉ chéo Gabardine', state: 'pending', result: 'Chờ quét' },
];

export const AI_VERIFICATION_METRICS: AiVerificationMetric[] = [
  { label: 'MẠNG NÔ-RON', value: 'ResNet-152 + SwinV2' },
  { label: 'ĐỘ TRỄ PHẢN HỒI', value: '~148ms (Region APAC)', accent: true },
];

/** Tín hiệu vi cấu trúc: các cột đậm là đỉnh đồng pha, cột nhạt là nền nhiễu. */
const MICRO_TEXTURE_BARS: MicroTextureBar[] = [
  { height: 54, tone: 'dark' },
  { height: 88, tone: 'dark' },
  { height: 20, tone: 'light' },
  { height: 34, tone: 'light' },
  { height: 66, tone: 'dark' },
  { height: 100, tone: 'dark' },
  { height: 26, tone: 'light' },
  { height: 0, tone: 'empty' },
  { height: 72, tone: 'dark' },
  { height: 96, tone: 'dark' },
  { height: 38, tone: 'light' },
  { height: 62, tone: 'dark' },
  { height: 30, tone: 'light' },
  { height: 0, tone: 'empty' },
  { height: 78, tone: 'dark' },
  { height: 100, tone: 'dark' },
  { height: 28, tone: 'light' },
  { height: 44, tone: 'light' },
  { height: 68, tone: 'dark' },
  { height: 92, tone: 'dark' },
  { height: 24, tone: 'light' },
  { height: 0, tone: 'empty' },
];

const MICRO_TEXTURE_AXIS = [
  '0 mm (Mắt lưới)',
  '120 µm (Vết chéo chỉ)',
  '250 µm (Khớp mật độ mẫu lưu kho)',
];

const PRODUCT_DEFAULT: Required<AiVerificationProduct> = {
  image: trenchCoatImage,
  tier: 'Vintage Tier A',
  name: 'Burberrys Trench Coat',
  meta: 'Màu lông Beige • Made in England',
  price: '8.500.000 đ',
  sku: 'SKU: RW-VN-942B',
};

/**
 * Gộp dữ liệu sản phẩm thật vào giá trị mặc định.
 * Bỏ qua các trường rỗng/undefined để ảnh và thông tin mặc định không bị ghi đè (tránh ảnh vỡ).
 */
const withProductDefaults = (product?: AiVerificationProduct): Required<AiVerificationProduct> => {
  const merged: Required<AiVerificationProduct> = { ...PRODUCT_DEFAULT };
  if (!product) return merged;
  if (product.image) merged.image = product.image;
  if (product.tier) merged.tier = product.tier;
  if (product.name) merged.name = product.name;
  if (product.meta) merged.meta = product.meta;
  if (product.price) merged.price = product.price;
  if (product.sku) merged.sku = product.sku;
  return merged;
};

/* ─── Props ─────────────────────────────────────────── */
export interface ListingAiVerificationStepProps {
  /** Số bước đã pad, ví dụ "04" */
  stepNumber?: string;
  stepTitle?: string;
  description?: string;
  /** Nhãn phiên bản lõi thị giác ở dải trạng thái */
  coreLabel?: string;
  pipelineLabel?: string;
  metrics?: AiVerificationMetric[];
  /** Phần trăm tiến độ suy luận, 0 – 100 */
  progress?: number;
  etaLabel?: string;
  tokensUsed?: number;
  tokensTotal?: number;
  activeStageEyebrow?: string;
  activeStageStep?: string;
  activeStageTitle?: string;
  activeStageSuffix?: string;
  stages?: AiVerificationStage[];
  tipTitle?: string;
  tipDescription?: string;
  signalCoherence?: string;
  product?: AiVerificationProduct;
  angles?: AiVerificationEvidenceAngle[];
  anglesSummary?: string;
  escrowTitle?: string;
  escrowDescription?: string;
  escrowNote?: string;
  sessionHash?: string;
  onCancel?: () => void;
  onRunInBackground?: () => void;
  onWaitResult?: () => void;
  quotaExhausted?: boolean;
}

const stageChipClass = (state: AiVerificationStageState) =>
  state === 'done' ? 'done' : state === 'match' ? 'match' : state === 'processing' ? 'processing' : '';

const angleChipClass = (state: EvidenceAngleState) =>
  state === 'pass' ? 'pass' : state === 'match' ? 'match' : state === 'scanning' ? 'scanning' : '';

/* ─── Component ─────────────────────────────────────── */
export const ListingAiVerificationStep: React.FC<ListingAiVerificationStepProps> = ({
  stepNumber = '04',
  stepTitle = 'Xác thực AI & Đối soát chính hãng',
  description = 'Mô hình kiểm định ReWear Vision đối soát 5 góc ảnh đã chụp với hơn 42.000 mẫu trang phục xa xỉ trong kho dữ liệu lưu trữ.',
  coreLabel = 'VISION CORE V4.8',
  pipelineLabel = 'Pipeline #VR-9428-HK',
  metrics = AI_VERIFICATION_METRICS,
  progress = 76,
  etaLabel = '~2.1 giây',
  tokensUsed = 1840,
  tokensTotal = 2420,
  activeStageEyebrow = 'Đang thẩm định',
  activeStageStep = 'Giai đoạn 3/5:',
  activeStageTitle = 'Phân tích mật độ mũi may ve áo & vị sợi Gabardine',
  activeStageSuffix = '(Đang quét ...)',
  stages = AI_VERIFICATION_STAGES,
  tipTitle = 'Gợi ý dành cho người bán',
  tipDescription = 'Quá trình phân tích trên hoàn toàn tự động. Bạn có thể chuyển tab hoặc làm việc khác, hệ thống sẽ gửi thông báo đẩy và email ngay khi hồ sơ kiểm định hoàn tất.',
  signalCoherence = 'Tín hiệu đồng pha: 98.4%',
  product,
  angles = AI_VERIFICATION_ANGLES,
  anglesSummary = '2/5 Đạt',
  escrowTitle = 'Cơ chế Smart-Escrow bảo vệ giao dịch',
  escrowDescription = 'Nếu chỉ số thẩm định AI đạt dưới 80%, tin đăng sẽ tạm dừng và chuyển tiếp tới Hội đồng Giám định Chuyên gia uy tín ReWear Lab. Người bán được bù đắp thêm và nhận thanh toán hoàn toàn khi tình trạng vi phạm.',
  escrowNote = 'Bảo vệ quyền lợi nhà sáng tạo & người bán uy tín',
  sessionHash = 'SESSION SHA256: 81927a3...c9f9 • REWEAR PROTOCOL',
  onCancel,
  onRunInBackground,
  onWaitResult,
  quotaExhausted = tokensUsed >= tokensTotal,
}) => {
  const [backgroundRun, setBackgroundRun] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(quotaExhausted);
  const productData: Required<AiVerificationProduct> = withProductDefaults(product);
  const safeProgress = Math.min(100, Math.max(0, progress));

  const handleRunInBackground = () => {
    if (quotaExhausted) {
      setShowQuotaModal(true);
      return;
    }
    setBackgroundRun(true);
    onRunInBackground?.();
  };

  const handleWaitResult = () => {
    if (quotaExhausted) {
      setShowQuotaModal(true);
      return;
    }
    onWaitResult?.();
  };

  return (
    <>
      <section className="rw-lc-ai" aria-label="Xác thực AI & Đối soát chính hãng">
        {/* ── Dải trạng thái hệ thống ── */}
        <div className="rw-lc-ai-strip">
          <span className="rw-lc-ai-core">
            <Zap width={12} height={12} aria-hidden="true" />
            {coreLabel}
          </span>
          <span className="rw-lc-ai-pipeline">{pipelineLabel}</span>
        </div>

        {/* ── Hero: tiêu đề bước + chỉ số mô hình ── */}
        <header className="rw-lc-ai-hero">
          <div className="rw-lc-ai-hero-text">
            <h2 className="rw-lc-ai-hero-title">
              Bước {stepNumber}: {stepTitle}
            </h2>
            <p className="rw-lc-ai-hero-desc">{description}</p>
          </div>
          <div className="rw-lc-ai-hero-metrics">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className={`rw-lc-ai-metric${metric.accent ? ' accent' : ''}`}
              >
                <span className="rw-lc-ai-metric-label">{metric.label}</span>
                <span className="rw-lc-ai-metric-value">{metric.value}</span>
              </div>
            ))}
          </div>
        </header>

        <div className="rw-lc-ai-columns">
          {/* ══ CỘT TRÁI ══ */}
          <div className="rw-lc-ai-col-main">
            {/* Thẻ 1: Tiến độ suy luận nơ-ron */}
            <article className="rw-lc-ai-card">
              <div className="rw-lc-ai-card-head">
                <h3 className="rw-lc-ai-card-title">
                  <Brain width={17} height={17} aria-hidden="true" />
                  Tiến độ suy luận nơ-ron đa tầng
                </h3>
                <span className="rw-lc-ai-card-side">
                  Ước tính còn lại <b>{etaLabel}</b>
                </span>
              </div>

              <div className="rw-lc-ai-progress-top">
                <strong className="rw-lc-ai-pct">{safeProgress}%</strong>
                <span className="rw-lc-ai-tokens">
                  {tokensUsed.toLocaleString('en-US')} / {tokensTotal.toLocaleString('en-US')} TOKENS
                </span>
              </div>
              <div className="rw-lc-ai-bar-track" role="progressbar" aria-valuenow={safeProgress} aria-valuemin={0} aria-valuemax={100}>
                <span className="rw-lc-ai-bar-fill" style={{ width: `${safeProgress}%` }} />
              </div>

              <div className="rw-lc-ai-stage-panel">
                <span className="rw-lc-ai-stage-spin" aria-hidden="true">
                  <Loader width={17} height={17} />
                </span>
                <div className="rw-lc-ai-stage-panel-text">
                  <span className="rw-lc-ai-stage-eyebrow">{activeStageEyebrow}</span>
                  <p className="rw-lc-ai-stage-panel-desc">
                    {activeStageStep} <b>{activeStageTitle}</b> {activeStageSuffix}
                  </p>
                </div>
                <span className="rw-lc-ai-live">
                  <span className="rw-lc-ai-live-dot" aria-hidden="true" />
                  Live Sensor Active
                </span>
              </div>
            </article>

            {/* Thẻ 2: Quy trình kiểm định 5 giai đoạn */}
            <article className="rw-lc-ai-card">
              <div className="rw-lc-ai-card-head">
                <h3 className="rw-lc-ai-card-title">
                  <Layers width={17} height={17} aria-hidden="true" />
                  Quy trình kiểm định 5 giai đoạn liên hoàn
                </h3>
                <span className="rw-lc-ai-card-side">Giao thức ReWear Standard v2.1</span>
              </div>

              <div className="rw-lc-ai-stages" role="list">
                {stages.map((stage) => (
                  <div
                    key={stage.id}
                    role="listitem"
                    className={`rw-lc-ai-stage${stage.state === 'processing' ? ' is-active' : ''}`}
                  >
                    <span className={`rw-lc-ai-stage-idx${stage.state === 'processing' ? ' rw-lc-ai-stage-spin' : ''}`}>
                      {stage.state === 'processing' ? <Loader width={15} height={15} /> : stage.id}
                    </span>
                    <div className="rw-lc-ai-stage-text">
                      <div className="rw-lc-ai-stage-title">{stage.title}</div>
                      <div className="rw-lc-ai-stage-detail">{stage.detail}</div>
                    </div>
                    <span className={`rw-lc-ai-stage-chip ${stageChipClass(stage.state)}`.trim()}>
                      {stage.result}
                    </span>
                  </div>
                ))}
              </div>
            </article>

            {/* Thẻ 3: Gợi ý dành cho người bán */}
            <article className="rw-lc-ai-tip">
              <span className="rw-lc-ai-tip-icon" aria-hidden="true">
                <MapPin width={16} height={16} />
              </span>
              <div className="rw-lc-ai-tip-body">
                <h3 className="rw-lc-ai-tip-title">{tipTitle}</h3>
                <p className="rw-lc-ai-tip-desc">{tipDescription}</p>
              </div>
            </article>

            {/* Thẻ 4: Biểu đồ đối sánh vi cấu trúc */}
            <article className="rw-lc-ai-card">
              <div className="rw-lc-ai-card-head">
                <h3 className="rw-lc-ai-card-title">
                  <AudioWaveform width={17} height={17} aria-hidden="true" />
                  Biểu đồ đối sánh vi cấu trúc (Micro-Texture Signal)
                </h3>
                <span className="rw-lc-ai-card-side">{signalCoherence}</span>
              </div>

              <div className="rw-lc-ai-chart" aria-hidden="true">
                {MICRO_TEXTURE_BARS.map((bar, index) => (
                  <span
                    key={`${bar.tone}-${index}`}
                    className={`rw-lc-ai-chart-bar ${bar.tone}`}
                    style={{ height: `${bar.height}%` }}
                  />
                ))}
              </div>
              <div className="rw-lc-ai-chart-axis">
                {MICRO_TEXTURE_AXIS.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
            </article>
          </div>

          {/* ══ CỘT PHẢI ══ */}
          <aside className="rw-lc-ai-col-side">
            {/* Sản phẩm đang thẩm định */}
            <article className="rw-lc-ai-card">
              <div className="rw-lc-ai-product-head">
                <span className="rw-lc-ai-product-label">Sản phẩm đang thẩm định</span>
                <span className="rw-lc-ai-tier">{productData.tier}</span>
              </div>
              <div className="rw-lc-ai-product">
                <div className="rw-lc-ai-product-media">
                  <img
                    src={productData.image}
                    alt={productData.name}
                    loading="lazy"
                    onError={(event) => {
                      const target = event.currentTarget;
                      if (target.dataset.fallbackApplied === 'true') return;
                      target.dataset.fallbackApplied = 'true';
                      target.src = trenchCoatImage;
                    }}
                  />
                </div>
                <div>
                  <div className="rw-lc-ai-product-name">{productData.name}</div>
                  <div className="rw-lc-ai-product-meta">{productData.meta}</div>
                  <div className="rw-lc-ai-product-price">{productData.price}</div>
                  <div className="rw-lc-ai-product-sku">{productData.sku}</div>
                </div>
              </div>
            </article>

            {/* Trạng thái 5 góc bằng chứng nộp */}
            <article className="rw-lc-ai-card">
              <div className="rw-lc-ai-card-head">
                <h3 className="rw-lc-ai-card-title">Trạng thái 5 góc bằng chứng nộp</h3>
                <span className="rw-lc-ai-stage-chip done">{anglesSummary}</span>
              </div>
              <div className="rw-lc-ai-angles" role="list">
                {angles.map((angle) => (
                  <div
                    key={angle.id}
                    role="listitem"
                    className={`rw-lc-ai-angle${angle.state === 'scanning' ? ' is-scanning' : ''}`}
                  >
                    <span className="rw-lc-ai-angle-label">
                      <i>{angle.id}.</i>
                      {angle.label}
                    </span>
                    <span className={`rw-lc-ai-angle-chip ${angleChipClass(angle.state)}`.trim()}>
                      {angle.state === 'scanning' && <Loader width={12} height={12} aria-hidden="true" />}
                      {angle.result}
                    </span>
                  </div>
                ))}
              </div>
            </article>

            {/* Cơ chế Smart-Escrow */}
            <article className="rw-lc-ai-card">
              <span className="rw-lc-ai-escrow-chip">
                <ShieldCheck width={12} height={12} aria-hidden="true" />
                Smart-Escrow
              </span>
              <h3 className="rw-lc-ai-escrow-title">{escrowTitle}</h3>
              <p className="rw-lc-ai-escrow-desc">{escrowDescription}</p>
              <p className="rw-lc-ai-escrow-note">
                <Lock width={14} height={14} aria-hidden="true" />
                {escrowNote}
              </p>
              <p className="rw-lc-ai-escrow-session">{sessionHash}</p>
            </article>
          </aside>
        </div>
      </section>

      {backgroundRun && (
        <div className="rw-lc-ai-notice" role="status">
          <Bell width={15} height={15} aria-hidden="true" />
          Đã bật chế độ chạy ngầm — ReWear AI sẽ gửi thông báo đẩy và email ngay khi hồ sơ kiểm định hoàn tất.
        </div>
      )}

      <div className="rw-lc-ai-actionbar">
        <div className="rw-lc-ai-actionbar-inner">
          <button type="button" className="rw-lc-ai-btn rw-lc-ai-btn-cancel" onClick={onCancel}>
            <X width={15} height={15} aria-hidden="true" />
            Hủy phân tích
          </button>

          <div className="rw-lc-ai-actionbar-btns">
            <button type="button" className="rw-lc-ai-btn" onClick={handleRunInBackground} disabled={quotaExhausted}>
              <Bell width={15} height={15} aria-hidden="true" />
              Chạy ngầm &amp; Thông báo sau
            </button>
            <button type="button" className="rw-lc-ai-btn rw-lc-ai-btn-primary" onClick={handleWaitResult} disabled={quotaExhausted}>
              <span className="rw-lc-ai-btn-spin" aria-hidden="true">
                <Loader width={15} height={15} />
              </span>
              Chờ kết quả trực tiếp...
            </button>
          </div>
        </div>
      </div>

      {showQuotaModal && (
        <div className="rw-lc-ai-quota-overlay" role="presentation">
          <div className="rw-lc-ai-quota-modal" role="dialog" aria-modal="true" aria-labelledby="rw-lc-ai-quota-title">
            <button
              type="button"
              className="rw-lc-ai-quota-close"
              aria-label="Đóng thông báo quota"
              onClick={() => setShowQuotaModal(false)}
            >
              <X width={16} height={16} aria-hidden="true" />
            </button>
            <div className="rw-lc-ai-quota-icon" aria-hidden="true">
              <Zap width={22} height={22} />
            </div>
            <p className="rw-lc-ai-quota-eyebrow">QUOTA TOKEN ĐÃ HẾT</p>
            <h3 id="rw-lc-ai-quota-title">Không thể tiếp tục xác thực AI</h3>
            <p>
              Bạn đã sử dụng hết quota token cho phiên kiểm định này. Vui lòng nạp thêm token hoặc thử lại
              sau để tiếp tục đối soát chính hãng.
            </p>
            <div className="rw-lc-ai-quota-usage">
              <span>Đã sử dụng</span>
              <b>{tokensUsed.toLocaleString('en-US')} / {tokensTotal.toLocaleString('en-US')} tokens</b>
            </div>
            <button type="button" className="rw-lc-ai-btn rw-lc-ai-btn-primary" onClick={() => setShowQuotaModal(false)}>
              Đã hiểu
            </button>
          </div>
        </div>
      )}

      {/* Khoảng đệm cuối trang để thanh cố định không che nội dung */}
      <div className="rw-lc-ai-actionbar-space" aria-hidden="true" />
    </>
  );
};

export default ListingAiVerificationStep;
