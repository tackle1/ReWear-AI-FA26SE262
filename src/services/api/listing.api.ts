import axiosClient from '../axiosClient';
import { ApiResponse } from '../../types/apiResponse.type';
import { CreateListingPayload, CreateListingResult, ListingItem } from '../../types/listing.type';
import { VerificationThresholds } from '../../types/verification.type';

export const listingApi = {
  getListingById: (id: string) =>
    axiosClient.get<never, ApiResponse<ListingItem>>(`/listings/${id}`),
  /**
   * Tạo tin đăng mới: `POST /api/ListingsExample/create?userId={guid}`.
   *
   * `userId` là GUID của seller đã đăng nhập và truyền ở QUERY STRING
   * (backend khai báo `string($guid)` dạng query param), phần còn lại nằm
   * trong body.
   *
   * Dùng `baseURL: ''` để đi qua proxy của Vite dev server giống các endpoint
   * `/api/ListingsExample/*` khác (backend .NET chạy HTTPS self-signed).
   */
  createListing: (userId: string, data: CreateListingPayload) =>
    axiosClient.post<never, ApiResponse<CreateListingResult>>(
      `/api/ListingsExample/create?userId=${encodeURIComponent(userId)}`,
      data,
      { baseURL: '' },
    ),
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
