import { CreateListingPhoto } from './listing.type';

/**
 * Kết quả kiểm tra chất lượng MỘT ảnh — Bước 03.
 *
 * Khớp `ImageQualityResultDto` của backend, đo thật trên pixel ảnh.
 */
export interface PhotoQualityImageResult {
  angleType: string;
  isAcceptable: boolean;
  /** Lý do không đạt, bằng tiếng Việt, để hiện cho seller. */
  issues: string[];
  width: number;
  height: number;
  /** Điểm độ nét (Laplacian variance) — càng cao càng nét. */
  sharpnessScore: number;
  /** Độ sáng trung bình (0-255). */
  brightness: number;
}

/** Kết quả kiểm tra cả bộ ảnh — Bước 03. Khớp `PhotoQualityCheckResultDto`. */
export interface PhotoQualityCheckResult {
  /** Chỉ khi true mới nên qua Bước 04. */
  isAcceptable: boolean;
  /** Các góc ảnh trượt chất lượng (mờ / tối / quá nhỏ). */
  failedAngles: string[];
  /** Các góc bắt buộc mà seller chưa gửi ảnh. */
  missingAngles: string[];
  /** Hướng dẫn cụ thể, gộp mọi lý do để hiện một lần cho dễ đọc. */
  recommendation: string;
  results: PhotoQualityImageResult[];
}

/** Body của `POST /api/ListingsExample/photo-quality`. */
export interface PhotoQualityCheckPayload {
  photos: CreateListingPhoto[];
  billPhotoUrl?: string;
}

/**
 * Cấu hình ngưỡng tự động của bước kiểm định, lấy từ
 * `GET /api/ListingsExample/thresholds`.
 */
export interface VerificationThresholds {
  /** Điểm trở lên (bao gồm) được phép đăng tin ngay. */
  autoPublishThreshold: number;
  /** Điểm dưới ngưỡng này bị từ chối tự động. */
  autoRejectThreshold: number;
  /**
   * Số điểm bị trừ vì thiếu hóa đơn (15 = trừ 15 điểm).
   *
   * Tên khoá là `MISSING_BILL_PENALTY_PERCENT` nhưng nghiệp vụ áp dụng là trừ
   * CỐ ĐỊNH theo điểm, KHÔNG phải theo phần trăm của điểm gốc:
   * 82.5 − 15 = 67.5, không phải 82.5 × 85% = 70.13.
   */
  missingBillPenaltyPercent: number;

  /**
   * Số token AI bị trừ cho MỖI lần Bước 04 phân tích.
   *
   * Dùng để giải thích cho seller: chỉ hiện "còn N token" thì số dư tụt dần
   * mà không biết tốn bao nhiêu mỗi lần. Đọc từ khoá cấu hình
   * `AI_ANALYSIS_TOKEN_COST` nên admin chỉnh được không cần deploy.
   */
  aiAnalysisTokenCost?: number;

  /**
   * Hạn mức token khởi tạo cho tài khoản SELLER mới, đọc từ khoá cấu hình
   * `SELLER_DEFAULT_AI_TOKEN_QUOTA`.
   *
   * Đây là số MẶC ĐỊNH của hệ thống, KHÔNG phải số dư hiện tại của người gọi —
   * số dư đó nằm ở `remainingTokens` của `verify-and-decide`. Nhờ tách hai khái
   * niệm này, UI hiển thị được dạng "còn 7/10 token" mà không cần thêm lời gọi
   * API nào.
   */
  sellerDefaultAiTokenQuota?: number;
}

/** Kết quả áp dụng cấu hình lên điểm kiểm định của một hồ sơ. */
export interface ConfidenceEvaluation {
  /** Điểm AI gốc, chưa áp dụng trừ điểm. */
  baseScore: number;
  /** Điểm bị trừ do thiếu hóa đơn (0 nếu đã có hóa đơn). */
  penalty: number;
  /** Điểm cuối cùng sau khi trừ. */
  finalScore: number;
  /** Người bán đã tải hóa đơn hay chưa. */
  hasBill: boolean;
  /** Kết luận tự động dựa trên `finalScore`. */
  outcome: 'auto-publish' | 'auto-reject' | 'manual-review';
}

/** Tuỳ chọn cho `evaluateConfidence`. */
export interface EvaluateConfidenceOptions {
  /** Phân khúc brand có bắt buộc hoá đơn hay không. Mặc định: coi như có. */
  requiresBillPhoto?: boolean;
  /** Điểm backend đã trừ sẵn — khi có, bỏ qua việc trừ ở client. */
  finalScoreFromDecision?: number;
}

/**
 * Tính điểm cuối và kết luận tự động cho Bước 05.
 *
 * QUAN TRỌNG — penalty đã được backend áp sẵn:
 * `verify-and-decide` (Bước 04) đã trừ `missingBillPenaltyPercent` vào điểm và
 * trả kết quả ở `decision.finalScore`. Vì vậy khi có `decision`, hàm này KHÔNG
 * trừ thêm lần nữa mà chỉ dùng `decision.finalScore` rồi kẹp về 0–100.
 * Trừ hai lần sẽ làm seller mất điểm gấp đôi so với nghiệp vụ.
 *
 * Còn khi chưa có `decision` (ví dụ mở thẳng Bước 05, hoặc endpoint hỏng) thì
 * mới tính tại chỗ theo công thức của backend: `score * (1 - penalty / 100)`,
 * và chỉ trừ khi phân khúc thực sự BẮT BUỘC hoá đơn mà người bán không tải.
 *
 * - `requiresBillPhoto`: phân khúc có bắt buộc hoá đơn hay không (quyết định
 *   việc có được trừ hay không — hàng popular/local không bị trừ).
 * - `finalScoreFromDecision`: điểm backend đã trừ sẵn.
 *
 * `finalScore >= autoPublishThreshold` → đăng tin tự động
 * `finalScore <= autoRejectThreshold` → từ chối tự động
 * còn lại → chuyển chuyên viên xem xét thủ công
 */
export const evaluateConfidence = (
  baseScore: number,
  hasBill: boolean,
  thresholds: VerificationThresholds,
  options?: EvaluateConfidenceOptions,
): ConfidenceEvaluation => {
  const clampedBase = Math.max(0, Math.min(100, Math.round(baseScore)));
  const requiresBill = options?.requiresBillPhoto ?? true;

  // Backend đã trừ rồi: lấy nguyên điểm đó, chỉ kẹp khoảng cho an toàn.
  const alreadyAdjusted = options?.finalScoreFromDecision;

  if (typeof alreadyAdjusted === 'number' && Number.isFinite(alreadyAdjusted)) {
    /*
     * Nhánh có `decision`: giữ nguyên độ chính xác backend trả về (1 chữ số
     * thập phân) thay vì làm tròn. Bước 04 hiển thị 82.5 → 70.1, nếu ở đây
     * làm tròn thành 83 → 70 thì seller thấy hai bước khác nhau dù cùng một kết
     * quả. Chỉ kẹp khoảng 0–100 để an toàn.
     */
    const finalScore = Math.max(0, Math.min(100, alreadyAdjusted));
    const outcome = resolveOutcome(finalScore, thresholds);

    return {
      baseScore: Math.max(0, Math.min(100, baseScore)),
      penalty: Math.max(0, baseScore - finalScore),
      finalScore,
      hasBill,
      outcome,
    };
  }

  /*
   * Chưa có kết quả backend: tự tính theo ĐÚNG công thức của backend.
   *
   * Trừ thiếu hoá đơn là SỐ ĐIỂM CỐ ĐỊNH: 82.5 − 15 = 67.5, KHÔNG phải
   * 82.5 × (1 − 15%) = 70.13. Xem `AiVerificationExampleController`.
   */
  const shouldPenalize = requiresBill && !hasBill;
  const penaltyPoints = shouldPenalize
    ? Math.max(0, thresholds.missingBillPenaltyPercent)
    : 0;

  const finalScore = Math.max(0, Math.round(clampedBase - penaltyPoints));

  return {
    baseScore: clampedBase,
    // `penalty` được hiển thị là "mất bao nhiêu điểm", nên tính từ chênh
    // lệch thực tế thay vì lấy thẳng phần trăm.
    penalty: Math.max(0, clampedBase - finalScore),
    finalScore,
    hasBill,
    outcome: resolveOutcome(finalScore, thresholds),
  };
};

const resolveOutcome = (
  finalScore: number,
  thresholds: VerificationThresholds,
): ConfidenceEvaluation['outcome'] =>
  finalScore >= thresholds.autoPublishThreshold
    ? 'auto-publish'
    : finalScore <= thresholds.autoRejectThreshold
      ? 'auto-reject'
      : 'manual-review';

/* ═══════════════════════════════════════════════════════════════════════════
 * BƯỚC 04 — Xác thực AI & Đối soát chính hãng
 * Ba endpoint dùng ở đây đều thuộc `AiVerificationExampleController` và đều
 * nhận CHUNG một body `AnalyzePhotosRequest` ({ brand, photos }).
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Body chung cho cả 3 endpoint của Bước 04. Khớp `AnalyzePhotosRequest`. */
export interface AnalyzePhotosRequest {
  /** Thương hiệu sản phẩm, dùng để AI đối chiếu đặc trưng thương hiệu. */
  brand: string;
  photos: CreateListingPhoto[];
  /**
   * Người bán đã tải ảnh hoá đơn hay chưa.
   *
   * Chỉ `verify-and-decide` dùng: khi brand thuộc phân khúc LUXURY mà
   * `hasBillPhoto` là false, backend trừ `missingBillPenaltyPercent` khỏi điểm
   * TRƯỚC khi so ngưỡng, rồi trả điểm đã trừ ở `decision.finalScore`.
   */
  hasBillPhoto?: boolean;
  /**
   * Loại hàng: SECONDHAND / CLEARANCE (chỉ `verify-and-decide` dùng).
   *
   * Backend cần để điều kiện "bắt buộc hoá đơn" ở Bước 04 TRÙNG với
   * `POST /api/ListingsExample/create` (luxury HOẶC SECONDHAND), nếu không
   * điểm hiển thị ở Bước 05 sẽ khác điểm lưu vào DB.
   */
  itemType?: string;
}

/** Một tín hiệu thị giác AI phát hiện. Khớp `VisualSignalDto`. */
export interface VisualSignal {
  signalName: string;
  isPassed: boolean;
  note?: string;
}

/**
 * Mức độ khớp với data set chuẩn của hãng. Khớp `DatasetMatchResultDto`.
 *
 * Tách riêng khỏi `AiScanResult.rawScore`: đó là điểm chính hãng tổng thể, còn
 * đây là mức độ TIN CẬY của kết quả so khớp — ảnh đẹp mà không thuộc bộ dữ
 * liệu thì vẫn bị trừ.
 */
export interface DatasetMatchResult {
  /** Điểm khớp dataset tổng hợp (0-100). 100 = khớp hoàn toàn. */
  matchScore: number;
  /** Phần trăm điểm đã bị trừ vì mức khớp thấp (0 khi đạt). */
  penaltyPercent: number;
  /** Có nên hiển thị cảnh báo cho seller không. */
  hasMismatchWarning: boolean;
  /** Cảnh báo bằng tiếng Anh từ backend, hiển thị nguyên văn. */
  warning: string;
  /** Các tín hiệu AI báo trượt — gợi ý góc ảnh cần chụp lại. */
  mismatchedSignals: string[];
  /** Cách tính, để seller thấy công khai vì sao bị trừ. */
  explanation: string;
}

/** Kết quả backend phát hiện ảnh được tạo bởi AI và mức trừ confidence tương ứng. */
export interface AiImageDetectionResult {
  isAiGenerated: boolean;
  /** Số điểm confidence backend yêu cầu trừ khi phát hiện ảnh AI. */
  penaltyPercent: number;
  confidence?: number;
  reason?: string;
}

/** Response của `analyze-photos`. Khớp `AnalyzePhotosResponseDto`. */
export interface AnalyzePhotosResult {
  aiResult: AiScanResult;
  datasetMatch: DatasetMatchResult;
  aiImageDetection?: AiImageDetectionResult | null;
  /** Token còn lại sau lần phân tích; null khi gọi không xác thực. */
  remainingTokenBalance: number | null;
}

/** Kết quả phân tích ảnh. Khớp `AiScanResultDto`. */
export interface AiScanResult {
  /** Điểm chính hãng 0-100 do AI chấm. */
  rawScore: number;
  /** GRADE_S_LIKE_NEW / A_EXCELLENT / B_GOOD / C_FAIR. */
  conditionGrade: string;
  /** true nghĩa là AI cho rằng ảnh không đủ chất lượng để chấm. */
  isBlur: boolean;
  failedImageAngles: string[];
  /** Điểm kiểm tra mác / nhãn giặt (0-100). */
  tagLegitScore: number;
  /** Điểm kiểm tra đường may / khóa kéo (0-100). */
  stitchingScore: number;
  visualSignals: VisualSignal[];
}

/** Quyết định của engine. Khớp `VerificationDecisionDto`. */
export interface VerificationDecision {
  /** APPROVED / REVIEW_NEEDED / REJECTED. */
  status: string;
  reason: string;
  aiScores: AiScanResult;
  recommendation: string;

  /**
   * Điểm AI GỐC, chưa trừ thiếu hoá đơn.
   *
   * Bước 05 phải hiển thị `finalScore`, KHÔNG dùng `aiScores.rawScore`: với
   * hồ sơ luxury thiếu hoá đơn, hai điểm này khác nhau.
   */
  baseScore: number;
  /** Phần trăm quy đương đã trừ (0 khi không bị trừ) — chỉ để hiển thị tương đối. */
  penaltyPercent: number;
  /**
   * Số ĐIỂM thực sự bị trừ (thiếu hoá đơn + lệch dataset).
   *
   * Đây là con số chuẩn xác theo nghiệp vụ: điểm gốc 82.5 thiếu hoá đơn luxury
   * → trừ 15 điểm → 67.5. Backend trả thêm từ DTO `PenaltyPoints`.
   */
  penaltyPoints?: number;
  /** Điểm CUỐI CÙNG sau khi trừ — backend đã áp trừ trước khi so ngưỡng. */
  finalScore: number;
  /** Phân khúc brand: LUXURY / POPULAR / LOCAL_NO_BRAND. */
  brandSegment: string;
  /** Phân khúc này có bắt buộc ảnh hoá đơn không. */
  requiresBillPhoto: boolean;
  /** Người bán đã tải ảnh hoá đơn hay chưa. */
  hasBillPhoto: boolean;
  /** true nếu điểm đã bị trừ vì thiếu hoá đơn. */
  missingBillPenaltyApplied: boolean;
  /**
   * true nếu brand người bán nhập không nằm trong danh sách NeonDB nào.
   *
   * CHỈ là cảnh báo để seller kiểm tra lại chính tả, không chặn hồ sơ — hàng
   * local / không nhãn hiệu vẫn đăng bình thường.
   */
  isBrandUnrecognized: boolean;
  /**
   * Chi tiết mức độ khớp với data set chuẩn của hãng và mức trừ đã áp.
   *
   * `penaltyPercent` của chính nó đã CỘNG DỒN cả trừ thiếu hoá đơn lẫn trừ
   * lệch dataset, nên Bước 05 không trừ thêm lần nữa.
   */
  datasetMatch: DatasetMatchResult;
  /** Kết quả phát hiện ảnh AI nếu backend đã chạy kiểm tra này. */
  aiImageDetection?: AiImageDetectionResult | null;

  /**
   * Số token AI còn lại sau lượt kiểm định.
   *
   * Ưu tiên hơn `analyze-photos.remainingTokenBalance` vì endpoint này là nơi
   * thực sự trừ token.
   */
  remainingTokenBalance?: number | null;
}

/** Tổng hợp tín hiệu đạt/trượt. Khớp `SignalCheckResultDto`. */
export interface SignalCheckResult {
  totalSignals: number;
  passedSignals: number;
  failedSignals: number;
  allSignalsPassed: boolean;
  signals: VisualSignal[];
}
