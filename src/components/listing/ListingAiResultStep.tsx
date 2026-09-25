import React from 'react';
import {
  BadgeCheck,
  CircleCheck,
  Headphones,
  Info,
  ListChecks,
  Lock,
  Rocket,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import trenchCoatImage from '../../assets/images/Burberry-Trench-Coat-Folded.png';
import '../../styles/listing/ListingAiResultStep.css';

/* ─── Types ─────────────────────────────────────────── */
export interface ResultGrade {
  /** Cấp độ, ví dụ "1" */
  id: string;
  label: string;
  caption: string;
  selected?: boolean;
}

export interface ResultGradeMetric {
  label: string;
  value: string;
  note?: string;
}

export interface ResultEvidenceRow {
  id: string;
  label: string;
  sub?: string;
  score: string;
  status: string;
  progress?: number;
}

export interface ResultExplainItem {
  title: string;
  body: string;
}

export interface ResultProduct {
  image?: string;
  tier?: string;
  verifiedLabel?: string;
  statusLabel?: string;
  name?: string;
  sku?: string;
  marketLabel?: string;
  marketPrice?: string;
  deltaLabel?: string;
  suggestedLabel?: string;
  suggestedPrice?: string;
  escrowNote?: string;
  certificateLabel?: string;
  certificateValue?: string;
}

/* ─── Dữ liệu mặc định ───────────────────────────────── */
export const RESULT_GRADES: ResultGrade[] = [
  { id: '1', label: 'Hoàn hảo (Mới)', caption: 'Mint', },
  { id: '2', label: 'Tốt (Vintage)', caption: 'Good', selected: true },
  { id: '3', label: 'Đã qua sử dụng', caption: 'Used' },
  { id: '4', label: 'Cũ / Hư hỏng', caption: 'Worn' },
];

export const RESULT_GRADE_METRICS: ResultGradeMetric[] = [
  { label: 'Khấu hao bề mặt', value: '5.4%', note: 'Mức độ chấp nhận tối đa' },
  { label: 'Lực căng nứt & Chỉ', value: 'Nguyên bản', note: 'Không quá sửa chữa' },
  { label: 'Tính toàn vẹn lót trong', value: '99.0%', note: 'Hoàn toàn đồng bộ' },
];

export const RESULT_EVIDENCE_ROWS: ResultEvidenceRow[] = [
  {
    id: '01',
    label: 'Mật độ dệt & Đường chỉ nền (Cotton Woven Labour)',
    sub: 'Đối soát vi cấu trúc sợi dọc – sợi ngang theo mẫu chuẩn.',
    score: '99.2%',
    status: 'Đạt ngưỡng',
    progress: 99,
  },
  {
    id: '02',
    label: 'Mũi may khóa & Ve áo (Lapel Stitching)',
    sub: 'Mật độ 8.6 mũi/inch, sai lệch tối đa 0.42mm trên toàn tuyến.',
    score: '96.5%',
    status: 'Đạt ngưỡng',
    progress: 96,
  },
  {
    id: '03',
    label: 'Khóa & Cúc kim loại (Horn Buttons & Buckles)',
    sub: 'Đã bù trừ ảnh hưởng lóa sáng khi đối chiếu khắc laser.',
    score: '84.1%',
    status: 'Đạt ngưỡng',
    progress: 84,
  },
  {
    id: '04',
    label: 'Kết cấu Gabardine chuẩn (Twill Weave)',
    sub: 'Tần số dệt và hướng chéo chỉ khớp kho lưu trữ 1990–1998.',
    score: '91.8%',
    status: 'Đạt ngưỡng',
    progress: 92,
  },
  {
    id: '05',
    label: 'Phom dáng & Độ dựng vai (Hem Flare & Silhouette)',
    sub: 'Tỷ lệ eo – vai và độ dài tà nằm trong dải dung sai hãng.',
    score: '98.0%',
    status: 'Đạt ngưỡng',
    progress: 98,
  },
];

export const RESULT_EXPLAIN_ITEMS: ResultExplainItem[] = [
  {
    title: 'Tại sao điểm đạt 94.0%?',
    body: 'Điểm số tổng hợp được tính toán dựa trên độ sắc nét vi mô của sợi dệt, độ đồng đều sắc thái và mức độ bám sát mô hình chuẩn ReWear Lab. Những sai lệch nhỏ còn lại nằm dưới ngưỡng cảnh báo, nên không làm giảm khả năng niêm yết.',
  },
  {
    title: 'Tại sao chưa đạt tuyệt đối 100%?',
    body: 'Không phát hiện dấu hiệu tráo hàng hoặc phục dựng. Tuy nhiên, sai lệch nhỏ về độ bão hòa màu và độ đàn hồi của vải khiến hồ sơ chưa đạt mức tuyệt đối 100% theo tiêu chuẩn phân loại kỹ thuật.',
  },
];

const PRODUCT_DEFAULT: Required<ResultProduct> = {
  image: trenchCoatImage,
  tier: 'Burberry Vintage',
  verifiedLabel: '8 góc ảnh xác thực',
  statusLabel: 'Đã xác thực',
  name: 'Burberry Vintage Trench Coat Gabardine',
  sku: 'SKU: BUR-84729-LIQ',
  marketLabel: 'Giá niêm yết bán:',
  marketPrice: '8.500.000 đ',
  deltaLabel: '-297.500 đ',
  suggestedLabel: 'Ước tính thực nhận:',
  suggestedPrice: '8.202.500 đ',
  escrowNote: 'Được bảo vệ bởi ReWear Smart-Escrow: khóa thanh toán của người mua được bảo mật và được lưu trữ trên chuỗi dữ liệu an toàn.',
  certificateLabel: 'Chứng nhận mã định danh',
  certificateValue: 'BUR-84729-LIQ',
};

/** Bỏ qua các trường rỗng để không ghi đè giá trị mặc định (tránh ảnh bị vỡ). */
const withProductDefaults = (product?: ResultProduct): Required<ResultProduct> => {
  const merged: Required<ResultProduct> = { ...PRODUCT_DEFAULT };
  if (!product) return merged;
  if (product.image) merged.image = product.image;
  if (product.tier) merged.tier = product.tier;
  if (product.verifiedLabel) merged.verifiedLabel = product.verifiedLabel;
  if (product.statusLabel) merged.statusLabel = product.statusLabel;
  if (product.name) merged.name = product.name;
  if (product.sku) merged.sku = product.sku;
  if (product.marketLabel) merged.marketLabel = product.marketLabel;
  if (product.marketPrice) merged.marketPrice = product.marketPrice;
  if (product.deltaLabel) merged.deltaLabel = product.deltaLabel;
  if (product.suggestedLabel) merged.suggestedLabel = product.suggestedLabel;
  if (product.suggestedPrice) merged.suggestedPrice = product.suggestedPrice;
  if (product.escrowNote) merged.escrowNote = product.escrowNote;
  if (product.certificateLabel) merged.certificateLabel = product.certificateLabel;
  if (product.certificateValue) merged.certificateValue = product.certificateValue;
  return merged;
};

/* ─── Props ─────────────────────────────────────────── */
export interface ListingAiResultStepProps {
  eyebrow?: string;
  latencyLabel?: string;
  title?: string;
  description?: string;
  /** Điểm tin cậy tổng hợp, ví dụ 94 */
  confidence?: number;
  scoreScaleLabel?: string;
  scoreHeadingLabel?: string;
  scoreBadgePrimary?: string;
  scoreBadgeSecondary?: string;
  scoreDescription?: string;
  escrowStatusLabel?: string;
  escrowStatusValue?: string;
  footerNote?: string;
  gradeTitle?: string;
  gradeSubtitle?: string;
  gradeBadge?: string;
  grades?: ResultGrade[];
  gradesConclusion?: string;
  gradeMetrics?: ResultGradeMetric[];
  evidenceTitle?: string;
  evidenceBadge?: string;
  evidenceRows?: ResultEvidenceRow[];
  explainTitle?: string;
  explainSubtitle?: string;
  explainBadge?: string;
  explainItems?: ResultExplainItem[];
  explainNote?: string;
  explainLicense?: string;
  showExplainFooter?: boolean;
  product?: ResultProduct;
  nextListingTitle?: string;
  nextListingDesc?: string;
  nextListingHighlight?: { badge: string; title: string; body: string };
  nextListingNote?: string;
  nextListingCert?: string;
  onBack?: () => void;
  onDownloadReport?: () => void;
  onApprove?: () => void;
}

const DONUT_RADIUS = 52;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

/* ─── Component ─────────────────────────────────────── */
export const ListingAiResultStep: React.FC<ListingAiResultStepProps> = ({
  eyebrow = 'CHỨNG THƯ GIÁM ĐỊNH KỸ THUẬT SỐ #AI-BB8941-VN',
  latencyLabel = 'Độ trễ phân tích: 1.84s',
  title = 'Kết quả kiểm định AI & Bằng chứng quang học',
  description = 'Hoàn tất phân tích nơ-ron đa tầng. Đánh giá khách quan dựa trên cơ sở dữ liệu lưu trữ 42.000 mẫu trang phục xa xỉ đối chiếu.',
  confidence = 94,
  scoreScaleLabel = 'XÁC THỰC',
  scoreHeadingLabel = 'Độ trùng khớp quang phổ cấu trúc:',
  scoreBadgePrimary = 'Độ khớp cao • Đủ điều kiện đăng tin tự động',
  scoreBadgeSecondary = 'Tier–1 Curation',
  scoreDescription = 'Mô hình thị giác máy tính ReWear Vision v4.2 xác nhận toàn bộ chỉ số hình học, mật độ chỉ và quang sai màu nằm trong giới hạn nguyên bản.',
  escrowStatusLabel = 'TRẠNG THÁI ESCROW',
  escrowStatusValue = 'Bảo lưu tự động',
  footerNote = 'Thông tri pháp lý: Đánh giá mang tính thống kê quang học hỗ trợ bởi AI, không cấu thành chứng nhận giám định pháp lý độc quyền. Báo cáo này đại diện cho sự đối chiếu hình học so với tập dữ liệu lưu trữ tại thời điểm quét.',
  gradeTitle = 'Phân loại tình trạng vật lý (Condition Grade)',
  gradeSubtitle = 'Chuẩn kiểm định vật lý ReWear Fabric-Scan',
  gradeBadge = 'Hạng mục: Tốt (Cấp 2)',
  grades = RESULT_GRADES,
  gradesConclusion = 'Phù hợp thẩm định: Phù hợp với mức kỹ thuật của ReWear Fabric-Scan. Khả năng xây dựng và độ bóng của vải vẫn ở mức tốt, không có dấu hiệu vật lý lớn.',
  gradeMetrics = RESULT_GRADE_METRICS,
  evidenceTitle = 'Chỉ số 5 điều kiện thẩm định thực thể (Visual Evidence)',
  evidenceBadge = '5/5 Điều kiện đều đạt ngưỡng',
  evidenceRows = RESULT_EVIDENCE_ROWS,
  explainTitle = 'Minh bạch chẩn đoán AI (Explainable AI Engine)',
  explainSubtitle = 'Cơ sở lý luận & Thuật toán phân định rủi ro',
  explainBadge = 'Có sẵn để kiểm tra',
  explainItems = RESULT_EXPLAIN_ITEMS,
  explainNote = 'Cần có sự đồng ý của người bán (tùy chọn) khi trích xuất dữ liệu giải trình.',
  explainLicense = 'LICENSE: REWEAR-XAI-1.0',
  showExplainFooter = false,
  product,
  nextListingTitle = 'Quy trình xử lý ngoại lệ',
  nextListingDesc = 'Nếu sản phẩm trong tương lai lại đạt điểm < 80%, hệ thống sẽ tự động chuyển đối soát cho cơ chế chấm điểm kèm bản log kiểm tra.',
  nextListingHighlight = {
    badge: '•',
    title: 'Điểm mô phỏng: 72%',
    body: 'Cần kiểm tra thêm • Đang chờ chuyển về cơ chế kiểm tra và định tuyến xác thực theo từng bước.',
  },
  nextListingNote = 'Bảo vệ danh tính và dữ liệu ĐỘNG lệch theo tiêu chuẩn cơ chế chấm điểm.',
  nextListingCert = 'Chứng thực giám định: License REWEAR-CERT-2024',
}) => {
  const productData = withProductDefaults(product);
  const safeConfidence = Math.min(100, Math.max(0, confidence));
  const roundedConfidence = Math.round(safeConfidence);
  const arcLength = (safeConfidence / 100) * DONUT_CIRCUMFERENCE;

  return (
    <>
      <section className="rw-lc-result" aria-label="Kết quả thẩm định AI">
        {/* ── Dải trạng thái ── */}
        <div className="rw-lc-result-strip">
          <span className="rw-lc-result-eyebrow">
            <ShieldCheck width={13} height={13} aria-hidden="true" />
            {eyebrow}
          </span>
        </div>

        {/* ── Tiêu đề ── */}
        <header className="rw-lc-result-hero">
          <div className="rw-lc-result-hero-main">
            <h2 className="rw-lc-result-title">{title}</h2>
            <p className="rw-lc-result-desc">{description}</p>
          </div>
          <span className="rw-lc-result-latency">
            <span className="rw-lc-result-latency-dot" aria-hidden="true" />
            {latencyLabel}
          </span>
        </header>

        <div className="rw-lc-result-columns">
          {/* ══ CỘT TRÁI ══ */}
          <div className="rw-lc-result-col-main">
            {/* Thẻ 1: Độ tin cậy & đối soát */}
            <article className="rw-lc-result-card">
              <div className="rw-lc-result-score">
                <div className="rw-lc-result-donut-wrap">
                  <svg
                    viewBox="0 0 132 132"
                    className="rw-lc-result-donut"
                    role="img"
                    aria-label={`Điểm tin cậy ${safeConfidence}%`}
                  >
                    <circle cx="66" cy="66" r={DONUT_RADIUS} className="rw-lc-result-donut-track" />
                    <circle
                      cx="66"
                      cy="66"
                      r={DONUT_RADIUS}
                      className="rw-lc-result-donut-arc"
                      strokeDasharray={`${arcLength} ${DONUT_CIRCUMFERENCE - arcLength}`}
                      transform="rotate(-90 66 66)"
                    />
                  </svg>
                  <div className="rw-lc-result-donut-text">
                    <strong>{roundedConfidence}<small>%</small></strong>
                    <span>{scoreScaleLabel}</span>
                  </div>
                </div>

                <div className="rw-lc-result-score-info">
                  <div className="rw-lc-result-score-badges">
                    <span className="rw-lc-result-badge is-primary">{scoreBadgePrimary}</span>
                    <span className="rw-lc-result-badge">{scoreBadgeSecondary}</span>
                  </div>
                  <h3 className="rw-lc-result-score-heading">
                    {scoreHeadingLabel} {safeConfidence.toFixed(1)} / 100
                  </h3>
                  <p className="rw-lc-result-score-desc">{scoreDescription}</p>
                </div>

                <div className="rw-lc-result-escrow-state">
                  <span className="rw-lc-result-escrow-state-label">{escrowStatusLabel}</span>
                  <span className="rw-lc-result-escrow-state-value">
                    <ShieldCheck width={16} height={16} aria-hidden="true" />
                    {escrowStatusValue}
                  </span>
                </div>
              </div>

              <p className="rw-lc-result-note">
                <Info width={15} height={15} aria-hidden="true" />
                <span>{footerNote}</span>
              </p>
            </article>

            {/* Thẻ 2: Phân loại tình trạng & cấp độ */}
            <article className="rw-lc-result-card rw-lc-result-grade-card">
              <div className="rw-lc-result-card-head rw-lc-result-grade-header">
                <div className="rw-lc-result-grade-header-copy">
                  <h3 className="rw-lc-result-card-title">
                    <SlidersHorizontal width={17} height={17} aria-hidden="true" />
                    {gradeTitle}
                  </h3>
                  {gradeSubtitle && <p className="rw-lc-result-grade-subtitle">{gradeSubtitle}</p>}
                </div>
                <span className="rw-lc-result-chip green">{gradeBadge}</span>
              </div>

              <div className="rw-lc-result-grade-layout">
                <div className="rw-lc-result-grades" aria-label="Phân loại cấp độ">
                  {grades.map((grade) => (
                    <div
                      key={grade.id}
                      className={`rw-lc-result-grade${grade.selected ? ' is-selected' : ''}`}
                    >
                      <span className="rw-lc-result-grade-step">Cấp {grade.id}</span>
                      <span className="rw-lc-result-grade-name">{grade.label}</span>
                      <span className="rw-lc-result-grade-caption">{grade.caption}</span>
                    </div>
                  ))}
                </div>

                <div className="rw-lc-result-grade-main">
                  <p className="rw-lc-result-conclusion">
                    <b>Kết luận:</b> {gradesConclusion}
                  </p>

                  <div className="rw-lc-result-metrics">
                    {gradeMetrics.map((metric) => (
                      <div className="rw-lc-result-metric" key={metric.label}>
                        <span className="rw-lc-result-metric-label">{metric.label}</span>
                        <span className="rw-lc-result-metric-value">{metric.value}</span>
                        {metric.note && <span className="rw-lc-result-metric-note">{metric.note}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>

            {/* Thẻ 3: Chỉ số 5 điều kiện thẩm định */}
            <article className="rw-lc-result-card">
              <div className="rw-lc-result-card-head">
                <h3 className="rw-lc-result-card-title">
                  <ListChecks width={17} height={17} aria-hidden="true" />
                  {evidenceTitle}
                </h3>
                <span className="rw-lc-result-chip green">{evidenceBadge}</span>
              </div>

              <div className="rw-lc-result-evidence">
                {evidenceRows.map((row) => (
                  <div className="rw-lc-result-evidence-row" key={row.id}>
                    <span className="rw-lc-result-evidence-idx">{row.id}</span>
                    <div className="rw-lc-result-evidence-text">
                      <div className="rw-lc-result-evidence-title">{row.label}</div>
                      {row.sub && <div className="rw-lc-result-evidence-sub">{row.sub}</div>}
                    </div>
                    <div className="rw-lc-result-evidence-score">
                      <span className="rw-lc-result-evidence-pct">{row.score}</span>
                      <span className="rw-lc-result-evidence-status">
                        <CircleCheck width={12} height={12} aria-hidden="true" />
                        {row.status}
                      </span>
                      {typeof row.progress === 'number' && (
                        <span className="rw-lc-result-evidence-bar" aria-label={`Tiến độ ${row.progress}%`}>
                          <span style={{ width: `${Math.max(0, Math.min(100, row.progress))}%` }} />
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </article>

            {/* Thẻ 4: Minh bạch đối soát AI */}
            <article className="rw-lc-result-card">
              <div className="rw-lc-result-card-head rw-lc-result-explain-header">
                <div className="rw-lc-result-explain-header-copy">
                  <h3 className="rw-lc-result-card-title rw-lc-result-explain-title">
                    <Sparkles width={17} height={17} aria-hidden="true" />
                    {explainTitle}
                  </h3>
                  {explainSubtitle && <p className="rw-lc-result-explain-subtitle">{explainSubtitle}</p>}
                </div>
                <span className="rw-lc-result-chip indigo">{explainBadge}</span>
              </div>

              <div className="rw-lc-result-explain-grid">
                {explainItems.map((item) => (
                  <div className="rw-lc-result-explain" key={item.title}>
                    <div className="rw-lc-result-explain-head">
                      <span className="rw-lc-result-explain-icon" aria-hidden="true">
                        <Info width={14} height={14} />
                      </span>
                      {item.title}
                    </div>
                    <p className="rw-lc-result-explain-body">{item.body}</p>
                  </div>
                ))}
              </div>

              {showExplainFooter && (
                <div className="rw-lc-result-explain-footer">
                  <span className="rw-lc-result-explain-note">
                    <Lock width={13} height={13} aria-hidden="true" />
                    {explainNote}
                  </span>
                  <span className="rw-lc-result-explain-license">{explainLicense}</span>
                </div>
              )}
            </article>
          </div>

          {/* ══ CỘT PHẢI ══ */}
          <aside className="rw-lc-result-col-side">
            {/* Tình trạng thẩm định & sản phẩm */}
            <article className="rw-lc-result-card rw-lc-result-preview-card">
              <div className="rw-lc-result-card-head rw-lc-result-preview-header">
                <h3 className="rw-lc-result-card-title rw-lc-result-preview-title">Tóm tắt tin đăng niêm yết</h3>
                <button type="button" className="rw-lc-result-preview-button">Xem trước</button>
              </div>

              <div className="rw-lc-result-product-media rw-lc-result-product-media-compact">
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
                <span className="rw-lc-result-product-tag">{productData.tier}</span>
                <span className="rw-lc-result-product-verified">
                  <BadgeCheck width={13} height={13} aria-hidden="true" />
                  {productData.verifiedLabel}
                </span>
              </div>

              <h4 className="rw-lc-result-product-name">{productData.name}</h4>
              <div className="rw-lc-result-product-subtitle">Màu Honey Beige · Size M · Xuất xứ UK thập niên 90</div>
              <div className="rw-lc-result-product-sku">{productData.sku}</div>

              <div className="rw-lc-result-price-rows">
                <div className="rw-lc-result-price-row">
                  <span className="rw-lc-result-price-label">{productData.marketLabel}</span>
                  <span className="rw-lc-result-price-value">{productData.marketPrice}</span>
                  <span className="rw-lc-result-price-delta">{productData.deltaLabel}</span>
                </div>
                <div className="rw-lc-result-price-row is-strong">
                  <span className="rw-lc-result-price-label">{productData.suggestedLabel}</span>
                  <span className="rw-lc-result-price-value">{productData.suggestedPrice}</span>
                </div>
              </div>

              <p className="rw-lc-result-escrow">
                <Lock width={13} height={13} aria-hidden="true" />
                <span>{productData.escrowNote}</span>
              </p>
            </article>

            {/* Quy trình niêm yết tiếp theo */}
            <article className="rw-lc-result-card">
              <h3 className="rw-lc-result-card-title">
                <Rocket width={17} height={17} aria-hidden="true" />
                {nextListingTitle}
              </h3>
              <p className="rw-lc-result-next-desc">{nextListingDesc}</p>

              <div className="rw-lc-result-highlight">
                <span className="rw-lc-result-highlight-badge">{nextListingHighlight.badge}</span>
                <div>
                  <div className="rw-lc-result-highlight-title">{nextListingHighlight.title}</div>
                  <p className="rw-lc-result-highlight-body">{nextListingHighlight.body}</p>
                </div>
              </div>

              <p className="rw-lc-result-next-note">
                <Lock width={13} height={13} aria-hidden="true" />
                {nextListingNote}
              </p>
              <p className="rw-lc-result-next-cert">
                <ShieldCheck width={13} height={13} aria-hidden="true" />
                {nextListingCert}
              </p>
            </article>

            <div className="rw-lc-result-cta-row">
              <div className="rw-lc-result-cta-copy">
                <span className="rw-lc-result-cta-icon" aria-hidden="true">
                  <Headphones width={25} height={25} strokeWidth={2.2} />
                </span>
                <span className="rw-lc-result-cta-text">
                  <strong>Cần trợ giúp giám định?</strong>
                  <span>Chuyên viên hỗ trợ 24/7 qua Chat</span>
                </span>
              </div>
              <button type="button" className="rw-lc-result-cta-link">
                Liên hệ
              </button>
            </div>
          </aside>
        </div>
      </section>

    </>
  );
};

export default ListingAiResultStep;
