import { useCallback, useEffect, useState } from 'react';
import listingApi from '../../../services/api/listing.api';
import {
  ConfidenceEvaluation,
  evaluateConfidence,
  VerificationThresholds,
} from '../../../types/verification.type';

/** Giá trị dự phòng khi API lỗi, khớp với cấu hình mặc định của backend. */
const FALLBACK_THRESHOLDS: VerificationThresholds = {
  autoPublishThreshold: 75,
  autoRejectThreshold: 50,
  missingBillPenaltyPercent: 15,
};

export type ThresholdsStatus = 'loading' | 'success' | 'error';

export interface UseVerificationThresholdsResult {
  thresholds: VerificationThresholds;
  status: ThresholdsStatus;
  /** true nếu đang dùng cấu hình dự phòng vì API lỗi. */
  isFallback: boolean;
  reload: () => void;
  /** Áp dụng cấu hình lên điểm AI gốc để ra điểm cuối và kết luận. */
  evaluate: (baseScore: number, hasBill: boolean) => ConfidenceEvaluation;
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
    (baseScore: number, hasBill: boolean) =>
      evaluateConfidence(baseScore, hasBill, thresholds),
    [thresholds],
  );

  return { thresholds, status, isFallback, reload: fetchThresholds, evaluate };
};

export default useVerificationThresholds;