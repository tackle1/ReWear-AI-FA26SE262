import { AIGradeType } from '../constants/aiGrade';

export interface ListingItem {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  category: string;
  price: number;
  images: string[];
  aiGrade: AIGradeType;
  aiVerificationScore: number;
  isVerified: boolean;
  status: 'ACTIVE' | 'PENDING_REVIEW' | 'SOLD' | 'REMOVED';
  createdAt: string;
  updatedAt: string;
}

/**
 * Một góc ảnh bằng chứng gửi kèm khi tạo tin đăng.
 *
 * `angleType` là mã góc do backend quy định: OVERALL, BRAND_TAG, WASH_TAG,
 * STITCHING_ZIPPER. `imageUrl` là URL ảnh (hoặc data URL) của góc đó.
 */
export interface CreateListingPhoto {
  angleType: string;
  imageUrl: string;
}

/** 4 góc ảnh bắt buộc — backend trả `missingAngles` nếu thiếu góc nào. */
export const REQUIRED_ANGLE_TYPES = [
  'OVERALL',
  'BRAND_TAG',
  'WASH_TAG',
  'STITCHING_ZIPPER',
] as const;

export type RequiredAngleType = (typeof REQUIRED_ANGLE_TYPES)[number];

/**
 * Body của `POST /api/ListingsExample/create?userId={guid}`.
 *
 * `userId` KHÔNG nằm trong body mà truyền ở query string (kiểu GUID),
 * nên xem `CreateListingPayload` là phần body còn lại.
 */
export interface CreateListingPayload {
  title: string;
  categoryId: string;
  brand: string;
  size: string;
  color: string;
  material: string;
  gender: string;
  price: number;
  itemType: string;
  billPhotoUrl: string;
  photos: CreateListingPhoto[];
}

/**
 * Kết quả trả về của `POST /api/ListingsExample/create`,
 * khớp `ListingResponseDto` của backend (`text/json`).
 *
 * Backend trả về kết quả kiểm định ngay khi tạo tin, nên đây là nguồn dữ liệu
 * thật duy nhất hiện có cho tổng quan người bán — mọi trường đều có thể vắng
 * mặt nên khai báo optional thay vì bắt buộc.
 */
export interface CreateListingResult {
  /** Mã tin đăng vừa tạo. */
  listingId?: string;
  /** Trạng thái do backend quyết định, ví dụ `Published` / `PendingReview`. */
  status?: string;
  /** Lý do kèm theo trạng thái (VD: vì sao cần chuyên viên xem xét). */
  statusReason?: string | null;
  /** Điểm AI gốc, chưa trừ điểm thiếu hóa đơn. */
  rawAiScore?: number;
  /** Điểm cuối cùng sau khi đã áp dụng quy tắc thiếu hóa đơn. */
  finalAiScore?: number;
  /** true nếu hồ sơ bị trừ điểm vì người bán không tải hóa đơn. */
  missingBillPenaltyApplied?: boolean;
  /** Phân cấp tình trạng do AI chấm, ví dụ `Like New`. */
  conditionGrade?: string | null;
  /** Điểm độ tin cậy nhãn thương hiệu. */
  tagLegitScore?: number;
  /** Điểm đường may / cấu trúc. */
  stitchingScore?: number;
  /**
   * Phân khúc thương hiệu do BACKEND quyết định: `LUXURY` / `POPULAR` /
   * `LOCAL_NO_BRAND`.
   *
   * Không phải giá trị người bán chọn ở Bước 01 — backend tự suy ra từ tên
   * thương hiệu để chống khai sai né hóa đơn. Phân khúc này quyết định có bắt
   * buộc hóa đơn hay không, nên UI cần hiện lại để người bán biết mình đang ở
   * phân khúc nào.
   */
  brandSegment?: string;
  /** Số token AI còn lại — backend dùng để giới hạn 20 lần kiểm định. */
  remainingTokens?: number;
  [key: string]: unknown;
}
