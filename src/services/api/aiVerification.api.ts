import axiosClient from '../axiosClient';
import {
  AnalyzePhotosRequest,
  AiScanResult,
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
   * Chấm điểm chính hãng và đánh giá tình trạng sản phẩm. Trả về điểm tổng
   * `rawScore`, điểm mác/nhãn `tagLegitScore`, điểm đường may `stitchingScore`
   * và danh sách tín hiệu thị giác.
   */
  analyzePhotos: (data: AnalyzePhotosRequest) =>
    axiosClient.post<never, AiScanResult>('/api/AiVerificationExample/analyze-photos', data, {
      baseURL: '',
    }),

  /**
   * `POST /api/AiVerificationExample/verify-and-decide`
   *
   * Phân tích rồi ra quyết định: APPROVED (≥ ngưỡng đăng tin),
   * REVIEW_NEEDED (khoảng giữa), REJECTED (dưới ngưỡng).
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

/** Gom ảnh Bước 02 thành body `{ brand, photos }` mà cả 3 endpoint đều nhận. */
export const buildAnalyzeRequest = (
  photos: Record<string, string>,
  brand: string,
): AnalyzePhotosRequest => ({ brand: brand?.trim() ?? '', photos: buildPhotos(photos) });

export default aiVerificationApi;