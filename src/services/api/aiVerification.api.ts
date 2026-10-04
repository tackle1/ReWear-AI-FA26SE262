import axiosClient from '../axiosClient';
import {
  AnalyzePhotosRequest,
  AnalyzePhotosResult,
  SignalCheckResult,
  VerificationDecision,
} from '../../types/verification.type';
import { buildPhotos } from '../../features/listing/services/listingPayload';

/**
 * Bước 04 — Xác thực AI & Đối soát chính hãng.
 *
 * Ba endpoint thuộc `AiVerificationExampleController` và đều nhận CHUNG một
 * body `{ brand, photos }`. Tất cả trả thẳng DTO (không bọc `{success,data}`),
 * nên phải trả thẳng giá trị của `axiosClient` — interceptor đã unwrap sẵn về
 * body. Lấy thêm `.data` là `undefined`.
 */
export const aiVerificationApi = {
  /**
 * `POST /api/AiVerificationExample/analyze-photos`
 *
 * Chấm điểm chính hãng, đánh giá mức độ KHỚP DATA SET (kèm mức trừ điểm tương
 * ứng) và trừ token AI của seller cho lần phân tích này.
 *
 * Trả về `{ aiResult, datasetMatch, remainingTokenBalance }` — khác với bản
 * cũ chỉ trả thẳng `AiScanResult`.
 */
  analyzePhotos: (data: AnalyzePhotosRequest) =>
    axiosClient.post<never, AnalyzePhotosResult>(
      '/api/AiVerificationExample/analyze-photos',
      data,
      { baseURL: '' },
    ),

  /**
   * `POST /api/AiVerificationExample/verify-and-decide`
   *
   * Phân tích, đối chiếu brand với danh sách NeonDB, áp trừ điểm nếu hồ sơ
   * luxury thiếu hoá đơn, rồi mới ra quyết định:
   * APPROVED (≥ ngưỡng đăng tin), REVIEW_NEEDED (khoảng giữa), REJECTED (dưới
   * ngưỡng).
   *
   * Điểm để hiển thị ở Bước 05 là `finalScore` (đã trừ), KHÔNG phải
   * `aiScores.rawScore`.
   */
  verifyAndDecide: (data: AnalyzePhotosRequest) =>
    axiosClient.post<never, VerificationDecision>(
      '/api/AiVerificationExample/verify-and-decide',
      data,
      { baseURL: '' },
    ),

  /**
   * `POST /api/AiVerificationExample/check-signals`
   *
   * Tổng hợp các tín hiệu AI tìm được: tổng số, số đạt, số trượt và chi tiết
   * từng tín hiệu để hiển thị dạng bảng đối chiếu.
   */
  checkSignals: (data: AnalyzePhotosRequest) =>
    axiosClient.post<never, SignalCheckResult>('/api/AiVerificationExample/check-signals', data, {
      baseURL: '',
    }),
};

/**
 * Gom ảnh Bước 02 thành body `{ brand, photos, hasBillPhoto }` cho cả 3 endpoint.
 *
 * `hasBillPhoto` chỉ có tác dụng với `verify-and-decide`: backend cần biết
 * người bán đã tải hoá đơn chưa để áp (hoặc không áp) trừ điểm trước khi so
 * ngưỡng. `analyze-photos` và `check-signals` bỏ qua trường này.
 *
 * KHÔNG gửi sellerId: các endpoint Bước 04 đã có `[Authorize]`, backend tự lấy
 * mã người bán từ Bearer token (claim `sub`) do interceptor `axiosClient` gửi
 * kèm. Đưa mã vào body nghĩa là tin vào client — client có thể giả mạo để tiêu
 * token của người khác.
 */
export const buildAnalyzeRequest = (
  photos: Record<string, string>,
  brand: string,
  hasBillPhoto = false,
  itemType = '',
): AnalyzePhotosRequest => ({
  brand: brand?.trim() ?? '',
  photos: buildPhotos(photos),
  hasBillPhoto,
  // `itemType` chỉ có ý nghĩa với `verify-and-decide`: backend dùng để mở rộng
  // điều kiện bắt buộc hoá đơn (luxury HOẶC SECONDHAND) cho khớp với create.
  itemType: itemType?.trim() || undefined,
});

export default aiVerificationApi;