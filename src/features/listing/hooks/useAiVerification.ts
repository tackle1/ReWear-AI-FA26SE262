import { useCallback, useEffect, useRef, useState } from 'react';
import aiVerificationApi, { buildAnalyzeRequest } from '../../../services/api/aiVerification.api';
import {
  AiScanResult,
  AiImageDetectionResult,
  DatasetMatchResult,
  SignalCheckResult,
  VerificationDecision,
} from '../../../types/verification.type';
import { isTokenQuotaError, readApiErrorMessage, summarizeFailures } from '../utils/errorMessage';

export interface UseAiVerification {
  /** Kết quả `analyze-photos`: điểm chính hãng + điểm thành phần. */
  analysis: AiScanResult | null;
  /** Mức độ khớp data set + mức trừ tương ứng (từ `analyze-photos`). */
  datasetMatch: DatasetMatchResult | null;
  aiImageDetection: AiImageDetectionResult | null;
  /** Token AI còn lại sau lần phân tích gần nhất; null khi không trừ. */
  remainingTokens: number | null;
  /** Kết quả `verify-and-decide`: APPROVED / REVIEW_NEEDED / REJECTED. */
  decision: VerificationDecision | null;
  /** Kết quả `check-signals`: tổng hợp tín hiệu đạt/trượt. */
  signals: SignalCheckResult | null;
  isLoading: boolean;
  error: string | null;
  quotaExceeded: boolean;
  /** Gọi lại cả 3 endpoint (dùng sau khi chụp lại ảnh ở Bước 02/03). */
  reverify: () => void;
  /** true khi hiệu ứng auto-run bị chặn vì chưa vào Bước 04. */
  isIdle: boolean;
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
  itemType = '',
  enabled = true,
): UseAiVerification => {
  const [analysis, setAnalysis] = useState<AiScanResult | null>(null);
  const [datasetMatch, setDatasetMatch] = useState<DatasetMatchResult | null>(null);
  const [aiImageDetection, setAiImageDetection] = useState<AiImageDetectionResult | null>(null);
  const [remainingTokens, setRemainingTokens] = useState<number | null>(null);
  const [decision, setDecision] = useState<VerificationDecision | null>(null);
  const [signals, setSignals] = useState<SignalCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  // `JSON.stringify` làm khoá phụ thuộc: cùng key angleType nhưng ảnh đã đổi
  // nội dung thì phải xác thực lại.
  const photosKey = JSON.stringify(photos);
  const photoCount = Object.keys(photos).length;
  const brandKey = brand?.trim() ?? '';

  // True khi trang đang ở Bước 04 — chỉ lúc này mới được chạm vào API trừ
  // token. Các bước trước hook vẫn mount nhưng giữ im lặng.
  const isIdle = !enabled || photoCount === 0 || !brandKey;

  /*
   * CHỐNG TRỪ TRÙNG — nền tảng của việc "mỗi lần xác thực chỉ trừ 1 token".
   *
   * Backend CHỈ trừ token trong `verify-and-decide` (`AiVerificationExampleController`
   * dòng 125), nên về lý thuyết mỗi lần bấm xác thực sẽ trừ đúng 1. Nhưng trước
   * đây `useEffect` gọi `run()` ngay mỗi khi `photos`/`brand`/`hasBill` đổi, và
   * trong React StrictMode effect bị mount 2 lần — mỗi lần đều bắn lại cả 3
   * endpoint, khiến seller mất 4 token cho một lần xác thực.
   *
   * Hai cơ chế bổ sung:
   *   • `inFlightRef` — chặn hai lần gọi chồng nhau (bấm nút liên tục, hoặc
   *     StrictMode mount 2 lần liên tiếp khi lần trước chưa xong).
   *   • `lastChargedKeyRef` — cùng một bộ ảnh + brand + bill thì không gọi lại,
   *     tránh mất token vì chỉ đổi state không liên quan.
   *
   * Ghi chú: nếu endpoint bị lỗi mạng, `lastChargedKeyRef` KHÔNG được ghi nên
   * seller bấm xác thực lại vẫn chạy được (đánh đổi: có thể trừ 2 token cho 1
   * lần bấm lại khi lần trước đã lỗi sau khi backend đã trừ — chấp nhận được,
   * vì chặn luôn thì seller không bao giờ thoát được khỏi vòng lặp lỗi).
   */
  const inFlightRef = useRef(false);
  const lastChargedKeyRef = useRef<string | null>(null);

  const run = useCallback(async () => {
    if (photoCount === 0) {
      setAnalysis(null);
      setDatasetMatch(null);
      setAiImageDetection(null);
      setDecision(null);
      setSignals(null);
      setRemainingTokens(null);
      setQuotaExceeded(false);
      // Không có ảnh thì xoá cả khoá, để khi ảnh về lại được tính phí như cũ.
      lastChargedKeyRef.current = null;
      return;
    }

    // Khoá chống gọi chồng: bỏ qua nếu một lần xác thực khác đang bay.
    if (inFlightRef.current) return;

    const runKey = `${photosKey}|${brandKey}|${hasBillPhoto}|${itemType}`;
    // Cùng dữ liệu đã xác thực rồi thì khỏi tốn thêm token.
    if (lastChargedKeyRef.current === runKey) return;

    inFlightRef.current = true;
    setIsLoading(true);
    try {
      setError(null);
      setRemainingTokens(null);
      setQuotaExceeded(false);
      setAiImageDetection(null);
      setDatasetMatch(null);

      const body = buildAnalyzeRequest(photos, brandKey, hasBillPhoto, itemType);

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
        setAiImageDetection(a.value.aiImageDetection ?? null);
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

      if (d.status === 'fulfilled') {
        setDatasetMatch(d.value?.datasetMatch ?? null);
        if (d.value?.aiImageDetection) {
          setAiImageDetection(d.value.aiImageDetection);
        }
        /*
         * Chỉ khoá lại khi `verify-and-decide` — endpoint duy nhất trừ token — đã
         * thành công. Nếu nó lỗi thì KHÔNG ghi khoá, để seller bấm xác thực lại được
         * (đừng khoá khi lỗi vì người dùng sẽ không bao giờ thoát ra khỏi trạng
         * thái lỗi, còn nếu backend đã trừ rồi thì chấp nhận trừ thêm 1).
         */
        lastChargedKeyRef.current = runKey;
      }
      setDecision(d.status === 'fulfilled' ? d.value : null);
      setSignals(s.status === 'fulfilled' ? s.value : null);

      // Gom lý do của endpoint nào hỏng để người dùng biết vì sao thiếu dữ liệu.
      // `summarizeFailures` bỏ lỗi trùng: 3 endpoint cùng 401 sẽ ra MỘT câu thay vì
      // "401 • Network Error • Network Error" như trước.
      const failures = [a, d, s]
        .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
        .map((r) => readApiErrorMessage(r.reason));
      setQuotaExceeded(
        [a, d, s].some((result) => result.status === 'rejected' && isTokenQuotaError(result.reason)),
      );

      setError(summarizeFailures(failures));
    } finally {
      // Luôn nhả khoá kể cả khi có ngoại lệ, để seller không bị kẹt ở
      // trạng thái "đang xác thực" và không thể bấm lại lần nữa.
      setIsLoading(false);
      inFlightRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photosKey, brandKey, hasBillPhoto, itemType]);

  useEffect(() => {
    if (isIdle) return;
    // Debounce 800ms: gõ brand từng ký tự ("G" -> "Gu" -> "Guc"...) mỗi ký tự
    // đổi `brandKey` và trước đây mỗi giá trị trung gian gọi 1 lần
    // `verify-and-decide` = trừ 1 token/lần -> mới vào Bước 04 đã mất 3-4
    // token. Chờ seller ngừng gõ mới gọi 1 lần duy nhất.
    const timer = window.setTimeout(() => {
      void run();
    }, 800);
    return () => window.clearTimeout(timer);
  }, [run, isIdle]);

  return {
    analysis,
    datasetMatch,
    aiImageDetection,
    remainingTokens,
    decision,
    signals,
    isLoading,
    error,
    quotaExceeded,
    reverify: run,
    isIdle,
  };
};

export default useAiVerification;
