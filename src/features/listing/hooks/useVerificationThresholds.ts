import { useCallback, useEffect, useState } from 'react';
import listingApi from '../../../services/api/listing.api';
import {
  ConfidenceEvaluation,
  EvaluateConfidenceOptions,
  evaluateConfidence,
  VerificationThresholds,
} from '../../../types/verification.type';

/** Giá trị dự phòng khi API lỗi, khớp với cấu hình mặc định của backend. */
const FALLBACK_THRESHOLDS: VerificationThresholds = {
  autoPublishThreshold: 75,
  autoRejectThreshold: 50,
  missingBillPenaltyPercent: 15,
  aiAnalysisTokenCost: 1,
  sellerDefaultAiTokenQuota: 10,
};

export type ThresholdsStatus = 'loading' | 'success' | 'error';

export interface UseVerificationThresholdsResult {
  thresholds: VerificationThresholds;
  status: ThresholdsStatus;
  /** true nếu đang dùng cấu hình dự phòng vì API lỗi. */
  isFallback: boolean;
  reload: () => void;
  /**
   * Áp dụng cấu hình lên điểm của hồ sơ để ra điểm cuối và kết luận.
   *
   * `options` cho phép truyền điểm ĐÃ áp penalty ở Bước 04 (`finalScoreFromDecision`)
   * cùng phân khúc brand (`requiresBillPhoto`) để không tính trừ hai lần.
   */
  evaluate: (
    baseScore: number,
    hasBill: boolean,
    options?: EvaluateConfidenceOptions,
  ) => ConfidenceEvaluation;
}

/**
 * Lấy cấu hình ngưỡng tự động từ `GET /api/ListingsExample/thresholds`.
 *
 * Nếu API lỗi hoặc trả dữ liệu không hợp lệ thì dùng cấu hình dự phòng,
 * để luồng kiểm định vẫn chạy được thay vì chặn người bán vô lý.
 */
export const useVerificationThresholds = (): UseVerificationThresholdsResult => {
  const [thresholds, setThresholds] = useState<VerificationThresholds>(
    FALLBACK_THRESHOLDS,
  );
  const [status, setStatus] = useState<ThresholdsStatus>('loading');
  const [isFallback, setIsFallback] = useState(false);

  const fetchThresholds = useCallback(async () => {
    setStatus('loading');

    try {
      const response = await listingApi.getThresholds();

      const isValid =
        typeof response?.autoPublishThreshold === 'number' &&
        typeof response?.autoRejectThreshold === 'number' &&
        typeof response?.missingBillPenaltyPercent === 'number';

      if (!isValid) {
        throw new Error('Cấu hình ngưỡng không hợp lệ');
      }

      setThresholds({
        autoPublishThreshold: response.autoPublishThreshold,
        autoRejectThreshold: response.autoRejectThreshold,
        missingBillPenaltyPercent: response.missingBillPenaltyPercent,
        // Tuỳ chọn: backend cũ chưa trả trường này thì vẫn chạy bình thường,
        // chỉ thiếu con số "mỗi lần tốn mấy token" trên UI.
        aiAnalysisTokenCost:
          typeof response.aiAnalysisTokenCost === 'number'
            ? response.aiAnalysisTokenCost
            : FALLBACK_THRESHOLDS.aiAnalysisTokenCost,
        // Hạn mức token khởi tạo của SELLER mới (`SELLER_DEFAULT_AI_TOKEN_QUOTA`).
        // Đây là số MẶC ĐỊNH của hệ thống, KHÔNG phải số dư hiện tại —
        // số dư nằm ở `remainingTokens` của `verify-and-decide`.
        sellerDefaultAiTokenQuota:
          typeof response.sellerDefaultAiTokenQuota === 'number'
            ? response.sellerDefaultAiTokenQuota
            : FALLBACK_THRESHOLDS.sellerDefaultAiTokenQuota,
      });
      setIsFallback(false);
      setStatus('success');
    } catch {
      setThresholds(FALLBACK_THRESHOLDS);
      setIsFallback(true);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void fetchThresholds();
  }, [fetchThresholds]);

  const evaluate = useCallback(
    (
      baseScore: number,
      hasBill: boolean,
      options?: EvaluateConfidenceOptions,
    ) => evaluateConfidence(baseScore, hasBill, thresholds, options),
    [thresholds],
  );

  return { thresholds, status, isFallback, reload: fetchThresholds, evaluate };
};

export default useVerificationThresholds;