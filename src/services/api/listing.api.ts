import axiosClient from '../axiosClient';
import { ApiResponse } from '../../types/apiResponse.type';
import { ListingItem } from '../../types/listing.type';
import { VerificationThresholds } from '../../types/verification.type';

export const listingApi = {
  createListing: (data: Partial<ListingItem>) =>
    axiosClient.post<never, ApiResponse<ListingItem>>('/listings', data),
  getListingById: (id: string) =>
    axiosClient.get<never, ApiResponse<ListingItem>>(`/listings/${id}`),
  verifyPhotosWithAI: (formData: FormData) =>
    axiosClient.post<never, ApiResponse<{ grade: string; confidence: number }>>('/listings/ai-verify', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  /**
   * Lấy danh sách thương hiệu bảo chứng (Luxury / Major Brand) từ backend.
   * Endpoint trả về mảng string thuần, ví dụ: ["Nike","Adidas","Gucci",...].
   *
   * Gọi bằng đường dẫn tương đối và `baseURL: ''` để bỏ qua baseURL mặc định
   * (http://localhost:8000/api/v1) và đi qua proxy của Vite dev server.
   */
  getPremiumBrands: () =>
    axiosClient.get<never, string[]>('/api/ListingsExample/premium-brands', {
      baseURL: '',
    }),
  /**
   * Lấy cấu hình ngưỡng tự động của bước kiểm định:
   * - autoPublishThreshold: điểm từ đây trở lên được đăng tin ngay
   * - autoRejectThreshold: điểm dưới ngưỡng này bị từ chối tự động
   * - missingBillPenaltyPercent: số điểm trừ thêm khi thiếu hóa đơn
   */
  getThresholds: () =>
    axiosClient.get<never, VerificationThresholds>('/api/ListingsExample/thresholds', {
      baseURL: '',
    }),
};

export default listingApi;
