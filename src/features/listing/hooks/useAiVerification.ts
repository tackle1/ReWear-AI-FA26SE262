import { useCallback, useEffect, useState } from 'react';
import aiVerificationApi, { buildAnalyzeRequest } from '../../../services/api/aiVerification.api';
import {
  AiScanResult,
  DatasetMatchResult,
  SignalCheckResult,
  VerificationDecision,
} from '../../../types/verification.type';
import { readApiErrorMessage } from '../utils/errorMessage';

export interface UseAiVerification {
  /** Kết quả `analyze-photos`: điểm chính hãng + điểm thành phần. */
  analysis: AiScanResult | null;
  /** Mức độ khớp data set + mức trừ tương ứng (từ `analyze-photos`). */
  datasetMatch: DatasetMatchResult | null;
  /** Token AI còn lại sau lần phân tích gần nhất; null khi không trừ. */
  remainingTokens: number | null;
  /** Kết quả `verify-and-decide`: APPROVED / REVIEW_NEEDED / REJECTED. */
  decision: VerificationDecision | null;
  /** Kết quả `check-signals`: tổng hợp tín hiệu đạt/trượt. */
  signals: SignalCheckResult | null;
  isLoading: boolean;
  error: string | null;
  /** Gọi lại cả 3 endpoint (dùng sau khi chụp lại ảnh ở Bước 02/03). */
  reverify: () => void;
}

/**
 * Bước 04 — Xác thực AI & đối soát chính hãng.
 *
 * Gọi SONG SONG 3 endpoint của `AiVerificationExample`:
 *   • `analyze-photos`   → điểm chính hãng và các điểm thành phần
 *   • `verify-and-decide`→ đối chiếu brand với danh sách NeonDB, áp trừ điểm
 *                         nếu hồ sơ luxury thiếu hoá đơn, rồi ra quyết định
 *   • `check-signals`    → bảng đối chiếu từng tín hiệu thị giác
 *
 * `hasBillPhoto` được truyền vào để backend biết có cần trừ điểm hay không.
 * Thay đổi nó sẽ chạy lại xác thực, nên seller tải/xoá hoá đơn ở Bước 01 thấy
 * điểm ở Bước 05 cập nhật theo ngay.
 *
 * Cả 3 cùng nhận một body `{ brand, photos }` và đều là endpoint chỉ-đọc (không
 * trừ token, không ghi database — việc trừ token thuộc Bước 06 khi đăng tin),
 * nên gọi song song không gây tranh chấp.
 *
 * Vì dùng `Promise.allSettled` chứ không `Promise.all`: một endpoint lỗi
 * không được làm mất kết quả của hai endpoint còn lại. Endpoint nào hỏng thì
 * giữ `null` và báo lỗi, phần còn lại vẫn hiển thị được.
 */
export const useAiVerification = (
  photos: Record<string, string>,
  brand: string,
  hasBillPhoto = false,
): UseAiVerification => {
  const [analysis, setAnalysis] = useState<AiScanResult | null>(null);
  const [datasetMatch, setDatasetMatch] = useState<DatasetMatchResult | null>(null);
  const [remainingTokens, setRemainingTokens] = useState<number | null>(null);
  const [decision, setDecision] = useState<VerificationDecision | null>(null);
  const [signals, setSignals] = useState<SignalCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // `JSON.stringify` làm khoá phụ thuộc: cùng key angleType nhưng ảnh đã đổi
  // nội dung thì phải xác thực lại.
  const photosKey = JSON.stringify(photos);
  const photoCount = Object.keys(photos).length;
  const brandKey = brand?.trim() ?? '';

  const run = useCallback(async () => {
    if (photoCount === 0) {
      setAnalysis(null);
      setDatasetMatch(null);
      setDecision(null);
      setSignals(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const body = buildAnalyzeRequest(photos, brandKey, hasBillPhoto);

    const [a, d, s] = await Promise.allSettled([
      aiVerificationApi.analyzePhotos(body),
      aiVerificationApi.verifyAndDecide(body),
      aiVerificationApi.checkSignals(body),
    ]);

    // `analyze-photos` trả về `{ aiResult, datasetMatch, remainingTokenBalance }`.
    // Số dư đọc từ đây có thể chưa phản ánh lần trừ của `verify-and-decide`
    // vì hai endpoint chạy SONG SONG — nên ưu tiên con số của `decision` (nơi
    // thực sự trừ) và chỉ fallback sang giá trị này khi `decision` chưa về.
    if (a.status === 'fulfilled') {
      setAnalysis(a.value.aiResult ?? null);
      setDatasetMatch(a.value.datasetMatch ?? null);
      setRemainingTokens(
        d.status === 'fulfilled' && typeof d.value?.remainingTokenBalance === 'number'
          ? d.value.remainingTokenBalance
          : (a.value.remainingTokenBalance ?? null),
      );
    } else {
      setAnalysis(null);
      setDatasetMatch(null);
      setRemainingTokens(
        d.status === 'fulfilled' && typeof d.value?.remainingTokenBalance === 'number'
          ? d.value.remainingTokenBalance
          : null,
      );
    }

    setDecision(d.status === 'fulfilled' ? d.value : null);
    setSignals(s.status === 'fulfilled' ? s.value : null);

    // Gom lý do của endpoint nào hỏng để người dùng biết vì sao thiếu dữ liệu.
    const failures = [a, d, s]
      .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
      .map((r) => readApiErrorMessage(r.reason));

    setError(failures.length > 0 ? failures.join(' • ') : null);
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photosKey, brandKey, hasBillPhoto]);

  useEffect(() => {
    void run();
  }, [run]);

  return {
    analysis,
    datasetMatch,
    remainingTokens,
    decision,
    signals,
    isLoading,
    error,
    reverify: run,
  };
};

export default useAiVerification;