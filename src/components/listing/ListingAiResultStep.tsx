import React, { useEffect, useMemo } from 'react';
import {
  AlertTriangle,
  BadgeCheck,
  CircleCheck,
  CircleX,
  FileText,
  Headphones,
  Info,
  ListChecks,
  Loader,
  Lock,
  Rocket,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Timer,
} from 'lucide-react';
import trenchCoatImage from '../../assets/images/Burberry-Trench-Coat-Folded.png';
import useVerificationThresholds from '../../features/listing/hooks/useVerificationThresholds';
import {
  ConfidenceEvaluation,
  AiImageDetectionResult,
  SignalCheckResult,
  VerificationDecision,
  VerificationThresholds,
} from '../../types/verification.type';
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
  /**
   * Giá người bán nhập ở Bước 01 (chuỗi số, ví dụ "8500000").
   *
   * Nguồn GIÁ THẬT cho thẻ tóm tắt. Trước đây hai dòng giá lấy từ hằng số
   * bịa trong `PRODUCT_DEFAULT`, nên mọi tin đăng đều hiện "8.500.000 đ /
   * 8.202.500 đ" dù người bán nhập giá khác.
   */
  price?: string;
  /** Thương hiệu người bán nhập ở Bước 01 — hiện trong cảnh báo brand lạ. */
  brand?: string;
  sku?: string;
  marketLabel?: string;
  /**
   * Giá niêm yết. ƯU TIÊN giá người bán nhập ở Bước 01 — dùng chuỗi rỗng thì
   * component tự lấy từ `price`.
   */
  marketPrice?: string;
  /** Giá gốc bán ra (chưa trừ phí) — mặc định BẰNG `marketPrice`. */
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

/*
 * KHÔNG còn `RESULT_EVIDENCE_ROWS` cứng (99.2%, 96.5%, 84.1%, 91.8%, 98.0 —
 * luôn "Đạt ngưỡng"). Danh sách điều kiện thẩm định nay dựng từ kết quả
 * `check-signals` thật của Bước 04, nên hồ sơ ảnh kém sẽ hiện "Trượt" thay vì
 * quảng cáo 5/5 đạt.
 */

/** Nội dung giải thích thứ hai — không phụ thuộc điểm số. */
const EXPLAIN_ITEM_NO_PERFECT_SCORE: ResultExplainItem = {
  title: 'Tại sao chưa đạt tuyệt đối 100%?',
  body: 'Không phát hiện dấu hiệu tráo hàng hoặc phục dựng. Tuy nhiên, sai lệch nhỏ về độ bão hòa màu và độ đàn hồi của vải khiến hồ sơ chưa đạt mức tuyệt đối 100% theo tiêu chuẩn phân loại kỹ thuật.',
};

/**
 * Sinh nội dung giải thích theo điểm thực tế của hồ sơ.
 *
 * Nội dung cố định sẽ không khớp với điểm sau khi áp cấu hình chấm điểm
 * (đặc biệt khi bị trừ điểm vì thiếu hóa đơn), nên phần đầu được sinh theo
 * `evaluation` thay vì viết cứng.
 */
const buildExplainItems = (
  evaluation: ConfidenceEvaluation,
  thresholds: VerificationThresholds,
  aiImagePenalty: number,
): ResultExplainItem[] => {
  const { baseScore, penalty, finalScore, hasBill, outcome } = evaluation;

  const baseExplanation =
    `Điểm số tổng hợp được tính toán dựa trên độ sắc nét vi mô của sợi dệt, ` +
    `độ đồng đều sắc thái và mức độ bám sát mô hình chuẩn ReWear Lab.`;
  const aiPenaltyNote =
    aiImagePenalty > 0
      ? ` Backend phát hiện ảnh được tạo bằng AI nên trừ thêm ${aiImagePenalty} điểm confidence.`
      : '';

  // Không bị trừ điểm — giải thích thẳng điểm cuối.
  if (penalty === 0) {
    // Không nhắc "đã vượt ngưỡng" khi thực tế còn dưới ngưỡng: điểm không bị
    // trừ không có nghĩa là được đăng. Nói đúng kết luận đang hiển thị.
    const thresholdNote =
      finalScore >= thresholds.autoPublishThreshold
        ? ` Điểm này đã vượt ngưỡng đăng tin tự động (${thresholds.autoPublishThreshold}%).`
        : finalScore <= thresholds.autoRejectThreshold
          ? ` Điểm này thấp hơn ngưỡng tối thiểu (${thresholds.autoRejectThreshold}%), hồ sơ bị từ chối tự động.`
          : ` Điểm này nằm trong vùng ${thresholds.autoRejectThreshold}% – ${thresholds.autoPublishThreshold}%, hệ thống chuyển chuyên viên đối soát.`;

    return [
      {
        title: `Tại sao điểm đạt ${finalScore.toFixed(1)}%?`,
        body: `${baseExplanation} Điểm AI gốc là ${baseScore}%, không bị trừ thêm vì ${
          hasBill ? 'hồ sơ đã có hóa đơn' : 'phân khúc thương hiệu này không yêu cầu hóa đơn'
        }.${aiPenaltyNote}${thresholdNote}`,
      },
      EXPLAIN_ITEM_NO_PERFECT_SCORE,
    ];
  }

  // Có trừ điểm — nói rõ điểm gốc, điểm trừ và kết quả.
  const outcomeText =
    outcome === 'auto-publish'
      ? `Điểm sau khi trừ vẫn đạt ngưỡng đăng tin tự động (${thresholds.autoPublishThreshold}%).`
      : outcome === 'manual-review'
        ? `Điểm sau khi trừ rơi vào vùng chuyển chuyên viên xem xét (${thresholds.autoRejectThreshold}% – ${thresholds.autoPublishThreshold}%).`
        : `Điểm sau khi trừ thấp hơn ngưỡng tối thiểu (${thresholds.autoRejectThreshold}%), hồ sơ bị từ chối tự động.`;

  return [
    {
      title: `Tại sao điểm là ${finalScore.toFixed(1)}%?`,
      body:
        `${baseExplanation} Điểm AI gốc ${baseScore}%, ` +
        `bị trừ ${penalty} điểm vì chưa tải hóa đơn hoặc bằng chứng mua hàng ` +
        `(mức trừ ${thresholds.missingBillPenaltyPercent}% theo nghiệp vụ).${aiPenaltyNote} ${outcomeText}`,
    },
    EXPLAIN_ITEM_NO_PERFECT_SCORE,
  ];
};

const PRODUCT_DEFAULT: Required<ResultProduct> = {
  image: trenchCoatImage,
  tier: 'Burberry Vintage',
  brand: '',
  verifiedLabel: '8 góc ảnh xác thực',
  statusLabel: 'Đã xác thực',
  name: 'Burberry Vintage Trench Coat Gabardine',
  sku: 'SKU: BUR-84729-LIQ',
  /* Giá Bước 01 — không có thì hai dòng giá được ẩn, không hiện số bịa. */
  price: '',
  marketLabel: 'Giá niêm yết bán:',
  /*
   * KHÔNG còn `deltaLabel` ('-297.500 đ') và `suggestedPrice` ('8.202.500 đ'):
   * hai con số này là số bịa cứng trong UI. Nay cả hai dòng đều hiện GIÁ GỐC
   * người bán nhập ở Bước 01 — không trừ phí 3,5% và không hiện delta giả.
   */
  marketPrice: '',
  suggestedLabel: 'Ước tính thực nhận:',
  /* Sẽ được suy ra từ `price` ở `resolvePriceRows` khi không truyền. */
  suggestedPrice: '',
  escrowNote: 'Được bảo vệ bởi ReWear Smart-Escrow: khóa thanh toán của người mua được bảo mật và được lưu trữ trên chuỗi dữ liệu an toàn.',
  certificateLabel: 'Chứng nhận mã định danh',
  certificateValue: 'BUR-84729-LIQ',
};

/**
 * Định dạng giá tiền Việt Nam từ chuỗi người bán nhập ("8500000" → "8.500.000 đ").
 * Trả `null` khi không đọc được số hợp lệ.
 */
const formatPriceVnd = (raw?: string): string | null => {
  const digits = (raw ?? '').replace(/\D/g, '');
  if (!digits) return null;

  const amount = Number(digits);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  return `${amount.toLocaleString('vi-VN')} ₫`;
};

/**
 * Giá hiển thị cho hai dòng "Giá niêm yết bán" và "Ước tính thực nhận".
 *
 * Cả hai dòng đều hiện GIÁ GỐC người bán nhập ở Bước 01 — không trừ phí
 * niêm yết và không hiện delta, vì backend chưa trả phí thực tế. Trước đây
 * hai dòng này lấy từ hằng số bịa ("8.500.000 đ" / "8.202.500 đ") nên mọi
 * tin đăng đều hiện cùng một con số dù người bán nhập giá khác.
 */
const resolvePriceRows = (
  product: Required<ResultProduct>,
): { listedPrice: string; netPrice: string } => {
  /* Ưu tiên giá thật ở Bước 01, sau đó mới tới giá truyền vào. */
  const formatted =
    formatPriceVnd(product.price) ?? formatPriceVnd(product.marketPrice);

  /* Không có giá nào đọc được thì ẩn hẳn hai dòng thay vì hiện số bịa. */
  const fallback = formatted ?? '';
  return {
    listedPrice: product.marketPrice || fallback,
    netPrice: product.suggestedPrice || fallback,
  };
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
  if (product.brand) merged.brand = product.brand;
  if (product.sku) merged.sku = product.sku;
  if (product.price) merged.price = product.price;
  if (product.marketLabel) merged.marketLabel = product.marketLabel;
  if (product.marketPrice) merged.marketPrice = product.marketPrice;
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
  /** Người bán đã tải hóa đơn hay chưa — quyết định có bị trừ điểm hay không. */
  hasBill?: boolean;
  /**
   * Kết quả `verify-and-decide` của Bước 04.
   *
   * Mang theo điểm ĐÃ áp trừ thiếu hoá đơn (`finalScore`) và phân khúc brand
   * (`requiresBillPhoto`). Bước 05 dùng luôn `decision.finalScore` để không
   * tính trừ lần thứ hai, và hiển thị cảnh báo brand lạ cho seller.
   *
   * Còn `null` (chưa xác thực, hoặc endpoint lỗi) thì bước này tự tính theo
   * `confidence` + `hasBill` như trước.
   */
  decision?: VerificationDecision | null;
  /** Kết quả phát hiện ảnh AI và mức penalty backend trả về. */
  aiImageDetection?: AiImageDetectionResult | null;
  /**
   * Kết quả `check-signals` của Bước 04 — nguồn THẬT cho thẻ "5 điều kiện
   * thẩm định thực thể".
   *
   * Trước đây thẻ này dùng danh sách số cứng (`RESULT_EVIDENCE_ROWS`) nên luôn
   * hiện "5/5 điều kiện đều đạt ngưỡng" với các con số 99.2% / 96.5% … bất kể
   * ảnh thật ra sao. Truyền `signals` vào để thẻ phản ánh đúng kết quả kiểm định.
   */
  signals?: SignalCheckResult | null;
  /** Có bị chặn đăng tin khi điểm dưới ngưỡng tự động. */
  canPublish?: boolean;
  /** Báo ra ngoài khi trạng thái đăng tin thay đổi, để khóa nút ở action bar. */
  onCanPublishChange?: (canPublish: boolean) => void;
  /**
   * Báo điểm cuối (đã trừ theo cấu hình) ra ngoài, để Bước 06 hiển thị
   * đúng kết quả thẩm định thay vì dùng con số mặc định.
   */
  onConfidenceChange?: (finalScore: number) => void;
}

const DONUT_RADIUS = 52;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

/** Nhãn và biểu tượng cho từng kết luận tự động. */
const DECISION_COPY = {
  'auto-publish': {
    tone: 'success' as const,
    icon: CircleCheck,
    title: 'Đạt điều kiện đăng tin tự động',
  },
  'auto-reject': {
    tone: 'danger' as const,
    icon: CircleX,
    title: 'Từ chối tự động',
  },
  'manual-review': {
    tone: 'warning' as const,
    icon: Timer,
    title: 'Chuyển chuyên viên xem xét',
  },
};

/* ─── Component ─────────────────────────────────────── */
export const ListingAiResultStep: React.FC<ListingAiResultStepProps> = ({
  eyebrow = 'CHỨNG THƯ GIÁM ĐỊNH KỸ THUẬT SỐ #AI-BB8941-VN',
  latencyLabel = 'Độ trễ phân tích: 1.84s',
  title = 'Kết quả kiểm định AI & Bằng chứng quang học',
  description = 'Hoàn tất phân tích nơ-ron đa tầng. Đánh giá khách quan dựa trên cơ sở dữ liệu lưu trữ 42.000 mẫu trang phục xa xỉ đối chiếu.',
  /**
   * Điểm dự phòng khi Bước 04 không trả `decision` (endpoint lỗi, mở thẳng
   * Bước 05). Chỉ dùng khi thiếu dữ liệu thật — có `decision` thì luôn lấy
   * `decision.baseScore` / `decision.finalScore`.
   */
  confidence = 94,
  scoreScaleLabel = 'XÁC THỰC',
  scoreHeadingLabel = 'Độ trùng khớp quang phổ cấu trúc:',
  scoreBadgePrimary,
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
  evidenceTitle: evidenceTitleProp,
  evidenceRows: evidenceRowsProp,
  evidenceBadge: evidenceBadgeProp,
  explainTitle = 'Minh bạch chẩn đoán AI (Explainable AI Engine)',
  explainSubtitle = 'Cơ sở lý luận & Thuật toán phân định rủi ro',
  explainBadge = 'Có sẵn để kiểm tra',
  explainItems,
  explainNote = 'Cần có sự đồng ý của người bán (tùy chọn) khi trích xuất dữ liệu giải trình.',
  explainLicense = 'LICENSE: REWEAR-XAI-1.0',
  showExplainFooter = false,
  product,
  nextListingTitle = 'Quy trình xử lý ngoại lệ',
  nextListingDesc,
  nextListingHighlight,
  nextListingNote = 'Bảo vệ danh tính và dữ liệu ĐỘNG lệch theo tiêu chuẩn cơ chế chấm điểm.',
  nextListingCert = 'Chứng thực giám định: License REWEAR-CERT-2024',
  hasBill = true,
  decision = null,
  aiImageDetection = null,
  signals = null,
  canPublish = true,
  onCanPublishChange,
  onConfidenceChange,
}) => {
  const {
    thresholds,
    status: thresholdsStatus,
    isFallback: isThresholdFallback,
    reload: reloadThresholds,
    evaluate,
  } = useVerificationThresholds();

  /**
   * Điểm cuối của hồ sơ.
   *
   * Khi Bước 04 đã trả `decision`, penalty đã được backend áp sẵn trong
   * `decision.finalScore` — dùng luôn điểm đó, KHÔNG trừ thêm ở đây (trừ hai
   * lần sẽ làm seller mất điểm gấp đôi).
   *
   * Chỉ khi chưa có `decision` (endpoint lỗi, hoặc mở thẳng bước này) mới tự
   * tính từ `confidence` + `hasBill` như trước.
   */
  const aiImagePenalty =
    aiImageDetection?.isAiGenerated &&
    Number.isFinite(aiImageDetection.penaltyPercent) &&
    aiImageDetection.penaltyPercent > 0
      ? Math.min(100, aiImageDetection.penaltyPercent)
      : 0;

  /*
   * Điểm gốc dùng để hiển thị ở Bước 05.
   *
   * Khi Bước 04 đã có `decision`, phải lấy `decision.baseScore` — đó là điểm AI
   * GỐC mà backend dùng để áp trừ. Trước đây truyền `confidence` (prop mặc
   * định 94 và còn là số bịa trong lúc dựng UI) nên `evaluateConfidence` giữ nguyên
   * baseScore = 94 và suy ra penalty = 94 − 70.1 = 24 điểm, hiển thị sai lệch với
   * Bước 04 (thực tế 82.5 → 70.1, mất 12.4 điểm do trừ 15%).
   *
   * Chỉ khi không có `decision` (Bước 04 lỗi / mở thẳng Bước 05) mới rơi về
   * `confidence`.
   */
  /*
   * Điểm gốc dùng để hiển thị ở Bước 05.
   *
   * Khi Bước 04 đã có `decision`, phải lấy `decision.baseScore` — đó là điểm AI
   * GỐC mà backend dùng để áp trừ. Trước đây truyền `confidence` (prop mặc
   * định 94 và còn là số bịa trong lúc dựng UI) nên `evaluateConfidence` giữ nguyên
   * baseScore = 94 và suy ra penalty = 94 − 67.5 = 26.5 điểm, hiển thị sai lệch với
   * Bước 04 (thực tế 82.5 − 15 điểm = 67.5).
   *
   * Chỉ khi không có `decision` (Bước 04 lỗi / mở thẳng Bước 05) mới rơi về
   * `confidence`.
   */
  const baseScoreSource = decision?.baseScore ?? confidence;

  /*
   * Thẻ "5 điều kiện thẩm định thực thể" — dựng từ kết quả `check-signals`
   * của Bước 04, KHÔNG dùng danh sách số cứng.
   *
   * `VisualSignal` chỉ có `signalName` / `isPassed` / `note` (không kèm điểm
   * số), nên ta hiển thị đúng những gì backend thật sự trả về: tên tín hiệu,
   * ghi chú, và kết luận đạt/trượt — thay vì bịa những con số 99.2%, 96.5%…
   */
  const resolvedSignals = signals?.signals ?? [];
  const resolvedPassed = signals?.passedSignals ?? resolvedSignals.filter((s) => s.isPassed).length;
  const resolvedTotal = signals?.totalSignals ?? resolvedSignals.length;

  const evidenceRows: ResultEvidenceRow[] = useMemo(() => {
    // Người gọi truyền danh sách riêng thì ưu tiên danh sách đó.
    if (evidenceRowsProp && evidenceRowsProp.length > 0) return evidenceRowsProp;
    if (resolvedSignals.length === 0) return [];

    return resolvedSignals.map((signal, index) => ({
      id: String(index + 1).padStart(2, '0'),
      label: signal.signalName,
      sub: signal.note,
      score: signal.isPassed ? 'Đạt' : 'Trượt',
      status: signal.isPassed ? 'Đạt ngưỡng' : 'Cần chụp lại',
    }));
  }, [evidenceRowsProp, resolvedSignals]);

  /*
   * Tiêu đề thẻ cũng phải theo dữ liệu thật. Trước đây viết cứng "Chỉ số 5 điều
   * kiện" trong khi `check-signals` chỉ trả về 3 tín hiệu — tiêu đề và nội dung
   * mâu thuẫn ngay trên cùng một thẻ. Số trong tiêu đề lấy từ `resolvedTotal`.
   */
  const evidenceTitle =
    evidenceTitleProp ??
    (resolvedTotal > 0
      ? `Chỉ số ${resolvedTotal} điều kiện thẩm định thực thể (Visual Evidence)`
      : 'Chỉ số điều kiện thẩm định thực thể (Visual Evidence)');

  const evidenceBadge =
    evidenceBadgeProp ??
    (resolvedTotal > 0
      ? `${resolvedPassed}/${resolvedTotal} điều kiện đạt ngưỡng`
      : 'Chưa có dữ liệu kiểm định');


  const scoreBeforeAiPenalty: ConfidenceEvaluation = useMemo(
    () =>
      evaluate(baseScoreSource, hasBill, {
        requiresBillPhoto: decision?.requiresBillPhoto,
        finalScoreFromDecision: decision?.finalScore,
      }),
    [evaluate, baseScoreSource, hasBill, decision],
  );
  const aiImagePenaltyApplied = Math.min(aiImagePenalty, scoreBeforeAiPenalty.finalScore);
  const evaluation: ConfidenceEvaluation = useMemo(
    () =>
      aiImagePenaltyApplied > 0
        ? evaluate(scoreBeforeAiPenalty.baseScore, hasBill, {
            requiresBillPhoto: decision?.requiresBillPhoto,
            finalScoreFromDecision: scoreBeforeAiPenalty.finalScore - aiImagePenaltyApplied,
          })
        : scoreBeforeAiPenalty,
    [evaluate, scoreBeforeAiPenalty, hasBill, decision, aiImagePenaltyApplied],
  );

  /**
   * Brand người bán nhập không nằm trong danh sách NeonDB nào.
   *
   * Chỉ cảnh báo để seller kiểm tra lại chính tả — KHÔNG chặn hồ sơ, vì hàng
   * local / không nhãn hiệu vẫn đăng bình thường.
   */
  const showBrandWarning = Boolean(decision?.isBrandUnrecognized);

  /** Bước 04 đã trừ điểm vì thiếu hoá đơn (điểm đã bị giảm ở Bước 04). */
  const showBillPenaltyNotice = Boolean(decision?.missingBillPenaltyApplied);

  /**
   * Điểm cuối có rơi vào khoảng cạnh biên không → tin sẽ bị gắn cờ.
   *
   * Dùng đúng ngưỡng mà backend dùng ở `ListingService.ResolveListingStatus`:
   *   >= autoPublish → đăng ngay
   *   >= autoReject  → FLAGGED, chờ Admin
   *   còn lại        → từ chối
   */
  const willBeFlagged =
    typeof thresholds?.autoRejectThreshold === 'number' &&
    typeof thresholds?.autoPublishThreshold === 'number' &&
    evaluation.finalScore >= thresholds.autoRejectThreshold &&
    evaluation.finalScore < thresholds.autoPublishThreshold;

  /**
   * Ảnh không khớp data set chuẩn của hãng.
   *
   * Chỉ cảnh báo, không chặn hồ sơ — nhưng điểm đã bị trừ ở Bước 04 nên nói rõ
   * để seller biết cần chụp lại góc nào, nếu không sẽ tưởng điểm tự nhiên giảm.
   */
  const showDatasetWarning = Boolean(decision?.datasetMatch?.hasMismatchWarning);
  const showAiImagePenalty = aiImagePenalty > 0;

  const productData = withProductDefaults(product);

  /* Hai dòng giá của thẻ tóm tắt — suy ra từ giá người bán nhập ở Bước 01. */
  const priceRows = resolvePriceRows(productData);
  const roundedConfidence = evaluation.finalScore;
  const arcLength = (evaluation.finalScore / 100) * DONUT_CIRCUMFERENCE;

  const DecisionIcon = DECISION_COPY[evaluation.outcome].icon;
  const isRejected = evaluation.outcome === 'auto-reject';

  /**
   * Nội dung giải thích phải khớp với điểm thực tế, nên sinh động theo
   * `evaluation`. Prop `explainItems` vẫn được ưu tiên nếu muốn ghi đè.
   */
  const resolvedExplainItems: ResultExplainItem[] = useMemo(
    () => explainItems ?? buildExplainItems(evaluation, thresholds, aiImagePenalty),
    [evaluation, explainItems, thresholds, aiImagePenalty],
  );

  /** Badge chính phản ánh kết luận thật, không viết cứng "đủ điều kiện đăng tin". */
  const resolvedScoreBadgePrimary =
    scoreBadgePrimary ??
    (evaluation.outcome === 'auto-publish'
      ? `Điểm đạt • Đủ điều kiện đăng tin tự động`
      : evaluation.outcome === 'manual-review'
        ? `Điểm đạt • Cần chuyên viên xem xét`
        : `Điểm chưa đạt • Từ chối tự động`);

  /** Mô tả quy trình xử lý tiếp theo, bám theo kết luận thực tế. */
  const resolvedNextListingDesc =
    nextListingDesc ??
    (evaluation.outcome === 'auto-publish'
      ? `Điểm cuối đã vượt ngưỡng đăng tin tự động (${thresholds.autoPublishThreshold}%), nên tin đăng được phát hành ngay. Nếu sau này điểm rơi xuống dưới ${thresholds.autoRejectThreshold}%, hệ thống sẽ tự động chuyển đối soát kèm bản log kiểm tra.`
      : evaluation.outcome === 'auto-reject'
        ? `Điểm cuối thấp hơn ngưỡng tối thiểu (${thresholds.autoRejectThreshold}%), hệ thống từ chối tự động và lưu lại bản log để đối chiếu khiếu nại.`
        : `Điểm cuối nằm trong vùng ${thresholds.autoRejectThreshold}% – ${thresholds.autoPublishThreshold}%, hệ thống chuyển chuyên viên đối soát thủ công kèm bản log kiểm tra.`);

  /** Khối nhấn mạnh trong card quy trình, cũng bám theo kết luận. */
  const resolvedNextListingHighlight =
    nextListingHighlight ??
    (evaluation.outcome === 'auto-publish'
      ? {
          badge: '✓',
          title: `Điểm cuối: ${evaluation.finalScore}%`,
          body: `Vượt ngưỡng đăng tin tự động (${thresholds.autoPublishThreshold}%) — không cần chuyên viên xem xét thêm.`,
        }
      : evaluation.outcome === 'auto-reject'
        ? {
            badge: '✕',
            title: `Điểm cuối: ${evaluation.finalScore}%`,
            body: `Dưới ngưỡng tối thiểu (${thresholds.autoRejectThreshold}%) — cần chụp lại ảnh hoặc bổ sung hóa đơn rồi chạy lại kiểm định.`,
          }
        : {
            badge: '•',
            title: `Điểm cuối: ${evaluation.finalScore}%`,
            body: `Thuộc vùng chuyển xem xét — đang chờ chuyên viên đối chiếu theo từng bước.`,
          });

  /**
   * Hồ sơ bị từ chối tự động thì không được phê duyệt đăng tin.
   * Biến này được nối ra ngoài để action bar khóa nút "Phê duyệt và Đăng tin".
   */
  useEffect(() => {
    onCanPublishChange?.(!isRejected && canPublish);
  }, [canPublish, isRejected, onCanPublishChange]);

  /**
   * Bước 06 hiển thị lại điểm đã thẩm định, nên phải truyền đúng điểm cuối
   * (đã áp trừ hóa đơn) ra ngoài thay vì để Bước 06 tự mặc định 94.
   */
  useEffect(() => {
    onConfidenceChange?.(evaluation.finalScore);
  }, [evaluation.finalScore, onConfidenceChange]);

  const isPublishBlocked = isRejected || !canPublish;

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

        {/* ══ CẢNH BÁO TỪ BƯỚC 04 ══
            Brand không có trong danh sách NeonDB (chỉ nhắc lại chính tả, KHÔNG
            chặn hồ sơ) và điểm đã bị trừ vì thiếu hoá đơn. */}
        {(showBrandWarning || showBillPenaltyNotice || showDatasetWarning || showAiImagePenalty) && (
          <div
            className="rw-lc-result-alerts"
            role="status"
            aria-live="polite"
          >
            {showBrandWarning && (
              <p className="rw-lc-result-alert is-warning">
                Thương hiệu <strong>{productData.brand || 'bạn chọn'}</strong>{' '}
                không có trong danh sách thương hiệu đã cấu hình. Hồ sơ vẫn được
                tiếp tục, nhưng bạn nên kiểm tra lại chính tả — thương hiệu có
                trong danh sách mới được áp dụng quy tắc bắt buộc ảnh hoá đơn và
                đối chiếu đúng phân khúc.
              </p>
            )}

            {showDatasetWarning && (
              <p className="rw-lc-result-alert is-dataset">
                Ảnh chưa khớp dữ liệu chuẩn của hãng: điểm đối chiếu{' '}
                <strong>{decision?.datasetMatch?.matchScore}</strong>/100, đã trừ{' '}
                <strong>{decision?.datasetMatch?.penaltyPercent}%</strong>.
                {decision?.datasetMatch?.mismatchedSignals.length
                  ? ' Các tín hiệu chưa đạt: '
                  : ''}
                {decision?.datasetMatch?.mismatchedSignals.join(', ')}
                . Hãy chụp lại các góc này rồi xác thực lại.
              </p>
            )}

            {showAiImagePenalty && (
              <p className="rw-lc-result-alert is-ai-generated">
                AI phát hiện ảnh có dấu hiệu được tạo bằng AI. Confidence score tổng đã
                bị trừ <strong>{aiImagePenalty} điểm</strong> theo mức backend trả về.
              </p>
            )}

            {showBillPenaltyNotice && (
              <p className="rw-lc-result-alert is-penalty">
                Bước 04 đã trừ điểm vì thương hiệu này bắt buộc phải có ảnh hoá
                đơn mà bạn chưa tải: điểm AI gốc <strong>{evaluation.baseScore}</strong>{' '}
                còn <strong>{evaluation.finalScore}</strong>.{' '}
                {/*
                  Điểm đã tụt vào khoảng cạnh biên thì hậu quả KHÔNG chỉ là mất
                  điểm mà tin đăng còn bị gắn cờ chờ Admin — nói rõ để seller biết
                  mình đang ở luồng unhappy case, không phải chỉ cần chụp lại ảnh.
                */}
                {willBeFlagged ? (
                  <>
                    Với điểm này, tin đăng sẽ được{' '}
                    <strong>gắn cờ và chuyển cho Admin xét duyệt thủ công</strong>,
                    chưa hiển thị công khai trên sàn.{' '}
                  </>
                ) : (
                  <>Tin đăng vẫn được đăng bình thường.{' '}</>
                )}
                Tải ảnh hoá đơn ở Bước 01 và xác thực lại để được hoàn điểm
                {willBeFlagged ? ' và tránh bị gắn cờ' : ''}.
              </p>
            )}
          </div>
        )}

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
                    aria-label={`Điểm tin cậy ${evaluation.finalScore}%`}
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
                    <span className="rw-lc-result-badge is-primary">{resolvedScoreBadgePrimary}</span>
                    <span className="rw-lc-result-badge">{scoreBadgeSecondary}</span>
                  </div>
                  <h3 className="rw-lc-result-score-heading">
                    {scoreHeadingLabel} {evaluation.finalScore.toFixed(1)} / 100
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

              {/* ═══ Cấu hình confidence score từ API ═══ */}
              <div className="rw-lc-result-config">
                <div className="rw-lc-result-config-head">
                  <h3 className="rw-lc-result-config-title">
                    <SlidersHorizontal width={15} height={15} aria-hidden="true" />
                    Cấu hình chấm điểm tự động
                  </h3>

                  <span className="rw-lc-result-config-source">
                    {thresholdsStatus === 'loading' ? (
                      <>
                        <Loader width={11} height={11} aria-hidden="true" />
                        Đang tải
                      </>
                    ) : isThresholdFallback ? (
                      <>
                        <AlertTriangle width={11} height={11} aria-hidden="true" />
                        Dùng cấu hình dự phòng
                      </>
                    ) : (
                      <>
                        <BadgeCheck width={11} height={11} aria-hidden="true" />
                        Đồng bộ từ máy chủ
                      </>
                    )}
                  </span>
                </div>

                {/* Bảng ngưỡng */}
                <div className="rw-lc-result-config-grid">
                  <div className="rw-lc-result-config-cell is-reject">
                    <span>Điểm từ chối</span>
                    <strong>≤ {thresholds.autoRejectThreshold}%</strong>
                  </div>
                  <div className="rw-lc-result-config-cell is-review">
                    <span>Chuyển xem xét</span>
                    <strong>
                      {thresholds.autoRejectThreshold}&ndash;{thresholds.autoPublishThreshold}%
                    </strong>
                  </div>
                  <div className="rw-lc-result-config-cell is-publish">
                    <span>Điểm đăng tin</span>
                    <strong>≥ {thresholds.autoPublishThreshold}%</strong>
                  </div>
                  <div className="rw-lc-result-config-cell is-penalty">
                    <span>Thiếu hóa đơn</span>
                    <strong>−{thresholds.missingBillPenaltyPercent}%</strong>
                  </div>
                </div>

                {isThresholdFallback && (
                  <button
                    type="button"
                    className="rw-lc-result-config-retry"
                    onClick={reloadThresholds}
                  >
                    Không tải được cấu hình — bấm để thử lại
                  </button>
                )}

                {/* Bảng tính điểm của hồ sơ này */}
                <div className="rw-lc-result-config-calc">
                  <div className="rw-lc-result-config-calc-row">
                    <span>Điểm AI gốc</span>
                    <b>{evaluation.baseScore}%</b>
                  </div>

                  {/*
                   * KHÔNG tách dòng "Ảnh tạo bởi AI" riêng nữa — mọi khoản điều
                   * chỉnh (thiếu hoá đơn, đối chiếu hãng, ảnh AI) đều đã nằm
                   * trong `evaluation.penalty`. Tách riêng làm bảng dài thêm mà
                   * người bán không cần biết chi tiết từng khoản, và dễ lệch
                   * với điểm cuối khi có sai số làm tròn.
                   * Muốn biết VÌ SAO bị trừ: xem khối cảnh báo phía trên.
                   */}
                  <div className={`rw-lc-result-config-calc-row${evaluation.penalty > 0 ? ' is-penalty' : ''}`}>
                    <span>
                      Điểm chính khác
                      <em>
                        {evaluation.penalty > 0
                          ? 'Theo đối chiếu hãng / hóa đơn từ máy chủ'
                          : 'Không có khoản điều chỉnh khác'}
                      </em>
                    </span>
                    <b>{evaluation.penalty > 0 ? `−${evaluation.penalty}%` : '0'}</b>
                  </div>

                  <div className="rw-lc-result-config-calc-row is-total">
                    <span>Điểm cuối cùng</span>
                    <b>{evaluation.finalScore}%</b>
                  </div>
                </div>

                {/* Kết luận */}
                <div
                  className={`rw-lc-result-decision is-${DECISION_COPY[evaluation.outcome].tone}`}
                  role="status"
                >
                  <DecisionIcon width={17} height={17} aria-hidden="true" />
                  <div>
                    <strong>{DECISION_COPY[evaluation.outcome].title}</strong>
                    <p>
                      {evaluation.outcome === 'auto-publish' &&
                        `Điểm cuối ${evaluation.finalScore}% từ ngưỡng đăng tin tự động (${thresholds.autoPublishThreshold}%). Tin đăng sẽ được phát hành ngay.`}
                      {evaluation.outcome === 'auto-reject' &&
                        `Điểm cuối ${evaluation.finalScore}% không đạt ngưỡng tối thiểu (${thresholds.autoRejectThreshold}%). Hồ sơ bị từ chối và không thể đăng tin.`}
                      {evaluation.outcome === 'manual-review' &&
                        `Điểm cuối ${evaluation.finalScore}% nằm trong vùng chuyển xem xét. Hồ sơ sẽ được gửi chuyên viên đối chiếu thủ công.`}
                    </p>
                  </div>
                </div>

                {evaluation.penalty > 0 && (
                  <p className="rw-lc-result-config-tip">
                    <FileText width={13} height={13} aria-hidden="true" />
                    Điểm tổng có thể bao gồm điều chỉnh đối chiếu hãng hoặc hóa đơn
                    từ máy chủ.
                  </p>
                )}

                {isPublishBlocked && (
                  <div className="rw-lc-result-config-blocked">
                    <AlertTriangle width={14} height={14} aria-hidden="true" />
                    <span>
                      Không thể phê duyệt đăng tin khi hồ sơ bị từ chối tự
                      động. Hãy chụp lại ảnh rõ hơn hoặc bổ sung hóa đơn rồi
                      chạy lại kiểm định.
                    </span>
                  </div>
                )}
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
                <span
                  className={`rw-lc-result-chip ${
                    resolvedTotal > 0 && resolvedPassed === resolvedTotal ? 'green' : 'warn'
                  }`}
                >
                  {evidenceBadge}
                </span>
              </div>

              {evidenceRows.length > 0 ? (
                <div className="rw-lc-result-evidence">
                  {evidenceRows.map((row) => {
                    const failed = row.status !== 'Đạt ngưỡng';
                    return (
                      <div
                        className={`rw-lc-result-evidence-row${failed ? ' is-failed' : ''}`}
                        key={row.id}
                      >
                        <span className="rw-lc-result-evidence-idx">{row.id}</span>
                        <div className="rw-lc-result-evidence-text">
                          <div className="rw-lc-result-evidence-title">{row.label}</div>
                          {row.sub && <div className="rw-lc-result-evidence-sub">{row.sub}</div>}
                        </div>
                        <div className="rw-lc-result-evidence-score">
                          <span className="rw-lc-result-evidence-pct">{row.score}</span>
                          <span className="rw-lc-result-evidence-status">
                            {failed ? (
                              <CircleX width={12} height={12} aria-hidden="true" />
                            ) : (
                              <CircleCheck width={12} height={12} aria-hidden="true" />
                            )}
                            {row.status}
                          </span>
                          {typeof row.progress === 'number' && (
                            <span className="rw-lc-result-evidence-bar" aria-label={`Tiến độ ${row.progress}%`}>
                              <span style={{ width: `${Math.max(0, Math.min(100, row.progress))}%` }} />
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="rw-lc-result-evidence-empty">
                  Chưa có kết quả kiểm định tín hiệu từ Bước 04. Hãy quay lại Bước 04
                  chạy xác thực AI để xem các điều kiện thẩm định thực tế.
                </p>
              )}
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
                {resolvedExplainItems.map((item) => (
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

              {/* Khối giá ẩn hoàn toàn khi không đọc được giá người bán nhập ở Bước 01. */}
              {priceRows.listedPrice && (
                <div className="rw-lc-result-price-rows">
                  <div className="rw-lc-result-price-row">
                    <span className="rw-lc-result-price-label">{productData.marketLabel}</span>
                    <span className="rw-lc-result-price-value">{priceRows.listedPrice}</span>
                  </div>
                  <div className="rw-lc-result-price-row is-strong">
                    <span className="rw-lc-result-price-label">{productData.suggestedLabel}</span>
                    <span className="rw-lc-result-price-value">{priceRows.netPrice}</span>
                  </div>
                </div>
              )}

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
              <p className="rw-lc-result-next-desc">{resolvedNextListingDesc}</p>

              <div className="rw-lc-result-highlight">
                <span className="rw-lc-result-highlight-badge">{resolvedNextListingHighlight.badge}</span>
                <div>
                  <div className="rw-lc-result-highlight-title">{resolvedNextListingHighlight.title}</div>
                  <p className="rw-lc-result-highlight-body">{resolvedNextListingHighlight.body}</p>
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
