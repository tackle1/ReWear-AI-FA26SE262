import axiosClient from '../axiosClient';
import { ApiResponse } from '../../types/apiResponse.type';
import { CreateListingPayload, CreateListingResult, ListingItem } from '../../types/listing.type';
import { VerificationThresholds } from '../../types/verification.type';
import { normalizeGuid } from '../../utils/uuid';

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
   * Dùng `params` của axios thay vì nối tay vào URL để axios tự encode giá trị,
   * và kiểm tra GUID ngay ở đây: backend sẽ trả 400 với thông báo khó hiểu nếu
   * `userId` sai định dạng, nên báo lỗi tiếng Việt rõ ràng ngay tại đây hơn.
   *
   * Dùng `baseURL: ''` để đi qua proxy của Vite dev server giống các endpoint
   * `/api/ListingsExample/*` khác (backend .NET chạy HTTPS self-signed).
   */
  createListing: async (userId: string, data: CreateListingPayload) => {
    const guid = normalizeGuid(userId);

    if (!guid) {
      throw new Error(
        'Không xác định được mã người dùng (userId) hợp lệ. Vui lòng đăng nhập lại rồi thử.',
      );
    }

    return axiosClient.post<never, ApiResponse<CreateListingResult>>(
      '/api/ListingsExample/create',
      data,
      { baseURL: '', params: { userId: guid } },
    );
  },
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
