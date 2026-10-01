import axiosClient from '../axiosClient';
import { ApiResponse } from '../../types/apiResponse.type';
import { CreateListingPayload, CreateListingResult, ListingItem } from '../../types/listing.type';
import {
  VerificationThresholds,
  PhotoQualityCheckPayload,
  PhotoQualityCheckResult,
} from '../../types/verification.type';
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
   *
   * PHẢI trả thẳng giá trị của `axiosClient`, KHÔNG `.data`: interceptor đã
   * `response => response.data`, nên giá trị await được chính là body, và
   * backend trả thẳng DTO chứ không bọc `{ success, data }`.
   */
  createListing: async (userId: string, data: CreateListingPayload) => {
    const guid = normalizeGuid(userId);

    if (!guid) {
      throw new Error(
        'Không xác định được mã người dùng (userId) hợp lệ. Vui lòng đăng nhập lại rồi thử.',
      );
    }

    return axiosClient.post<never, CreateListingResult>(
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
   * Bước 03 — Kiểm tra ảnh: `POST /api/ListingsExample/photo-quality`.
   *
   * Backend đo thật độ nét (Laplacian variance) và độ sáng trên pixel ảnh,
   * kiểm tra đủ 4 góc bắt buộc. KHÔNG kiểm tra kích thước ảnh.
   * Endpoint chạy độc lập, KHÔNG trừ token, nên gọi nhiều lần để chụp lại
   * ảnh cho đến khi đạt rồi mới bấm đăng tin ở Bước 06.
   *
   * PHẢI trả thẳng giá trị của `axiosClient`, KHÔNG `.data`:
   * interceptor ở axiosClient đã `response => response.data`, nghĩa là giá trị
   * await được CHÍNH LÀ body rồi. Backend cũng trả thẳng DTO, không bọc trong
   * `{ success, data }`. Trước đây code lấy `response?.data` → luôn `undefined`
   * → hook `if (data) setResult(data)` không bao giờ chạy → Bước 03 hiện
   * "Chưa đo" dù server đã trả kết quả đầy đủ.
   */
  checkPhotoQuality: (data: PhotoQualityCheckPayload) =>
    axiosClient.post<never, PhotoQualityCheckResult>(
      '/api/ListingsExample/photo-quality',
      data,
      { baseURL: '' },
    ),
  /**
   * Lấy danh sách thương hiệu bảo chứng (Luxury / Major Brand) từ backend.
   * Endpoint trả về mảng string thuần, ví dụ: ["Nike","Adidas","Gucci",...].
   *
   * Gọi bằng đường dẫn tương đối và `baseURL: ''` để bỏ qua baseURL mặc định
   * (http://localhost:8000/api/v1) và đi qua proxy của Vite dev server.
   */
  /**
   * Nhóm "Luxury / Major Brand" của hàng Secondhand:
   * `GET /api/ListingsExample/premium-brands`.
   *
   * Backend đọc thẳng hàng cấu hình trong NeonDB, nên admin sửa JSON ở đó
   * (rồi Save) là danh sách này đổi theo — không có danh sách phía client để
   * phải đồng bộ thủ công.
   */
  getPremiumBrands: () =>
    axiosClient.get<never, string[]>('/api/ListingsExample/premium-brands', {
      baseURL: '',
    }),

  /**
   * Danh sách thương hiệu PHỔ THÔNG (nhóm Popular / Mass-market):
   * `GET /api/ListingsExample/popular-brands`.
   *
   * Endpoint trả về mảng string thuần, ví dụ: ["Uniqlo","Zara",...]. Đọc từ
   * SystemConfig `POPULAR_BRANDS_LIST` nên admin sửa trên NeonDB là API đổi
   * theo, không cần deploy lại.
   */
  getPopularBrands: () =>
    axiosClient.get<never, string[]>('/api/ListingsExample/popular-brands', {
      baseURL: '',
    }),

  /**
   * Danh sách thương hiệu NỘI ĐỊA / không nhãn hiệu (nhóm Local / No-brand):
   * `GET /api/ListingsExample/local-brands`.
   *
   * Đọc từ SystemConfig `LOCAL_BRANDS_LIST`. Danh sách này chỉ phục vụ GỢI Ý
   * cho UI — mọi thương hiệu không khớp luxury và popular đều tự động thuộc
   * nhóm local, nên bỏ sót tên ở đây không làm sai kết luận phân khúc.
   */
  getLocalBrands: () =>
    axiosClient.get<never, string[]>('/api/ListingsExample/local-brands', {
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
