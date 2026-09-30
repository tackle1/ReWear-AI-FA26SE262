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
