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
   * Số điểm bị trừ khi người bán không tải hóa đơn (15 = trừ 15 điểm).
   *
   * Backend đặt tên trường là `missingBillPenaltyPercent` và UI hiển thị kèm
   * dấu "%", nhưng nghiệp vụ áp dụng là trừ cố định theo điểm, KHÔNG phải
   * theo phần trăm của điểm gốc (94 - 15 = 79, không phải 94 × 15% = 80).
   */
  missingBillPenaltyPercent: number;
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

/**
 * Tính điểm cuối và kết luận tự động.
 *
 * Quy tắc:
 * - Không có hóa đơn → trừ cố định `missingBillPenaltyPercent` ĐIỂM
 *   (không phải phần trăm của điểm gốc)
 * - `finalScore >= autoPublishThreshold` → đăng tin tự động
 * - `finalScore <= autoRejectThreshold` → từ chối tự động
 * - còn lại → chuyển chuyên viên xem xét thủ công
 *
 * Điểm được kẹp trong khoảng 0–100 và làm tròn về số nguyên.
 */
export const evaluateConfidence = (
  baseScore: number,
  hasBill: boolean,
  thresholds: VerificationThresholds,
): ConfidenceEvaluation => {
  const clampedBase = Math.max(0, Math.min(100, Math.round(baseScore)));
  // Trừ cố định theo điểm: 94 - 15 = 79.
  const penalty = hasBill
    ? 0
    : Math.max(0, Math.round(thresholds.missingBillPenaltyPercent));
  const finalScore = Math.max(0, Math.min(100, clampedBase - penalty));

  const outcome: ConfidenceEvaluation['outcome'] =
    finalScore >= thresholds.autoPublishThreshold
      ? 'auto-publish'
      : finalScore <= thresholds.autoRejectThreshold
        ? 'auto-reject'
        : 'manual-review';

  return { baseScore: clampedBase, penalty, finalScore, hasBill, outcome };
};

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
}

/** Một tín hiệu thị giác AI phát hiện. Khớp `VisualSignalDto`. */
export interface VisualSignal {
  signalName: string;
  isPassed: boolean;
  note?: string;
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
}

/** Tổng hợp tín hiệu đạt/trượt. Khớp `SignalCheckResultDto`. */
export interface SignalCheckResult {
  totalSignals: number;
  passedSignals: number;
  failedSignals: number;
  allSignalsPassed: boolean;
  signals: VisualSignal[];
}
