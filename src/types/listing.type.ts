import { AIGradeType } from '../constants/aiGrade';

/**
 * Ảnh của tin kèm góc chụp — từ bảng `ListingMedia`.
 *
 * `angleType` do backend quy định: OVERALL, BRAND_TAG, WASH_TAG,
 * STITCHING_ZIPPER, DEFECT_DETAIL, BILL_PHOTO.
 */
export interface ListingMediaItem {
  angleType: string;
  imageUrl: string;
}

/** Một tín hiệu thị giác AI phát hiện — từ `AiEvaluation.VisualSignalsJson`. */
export interface VisualSignal {
  signalName: string;
  isPassed: boolean;
  note?: string | null;
}

/**
 * Chi tiết đầy đủ một tin: `Listing` + `AiEvaluation` + `ListingMedia`.
 *
 * Kế thừa `ListingSummaryDto` phía backend, nên có thêm các trường chỉ có
 * nghĩa khi xem chi tiết: điểm theo từng tiêu chí, tín hiệu thị giác, bộ ảnh.
 */
export interface ListingDetail extends ListingSummary {
  tagLegitScore: number | null;
  stitchingScore: number | null;
  evaluatedAt: string | null;
  gender: string | null;
  visualSignals: VisualSignal[];
  media: ListingMediaItem[];
}

/** Một dòng trong danh sách tin của seller / sàn người mua. */
export interface ListingSummary {
  listingId: string;
  skuCode: string;
  title: string;
  categoryId: string;
  brand: string;
  brandSegment: string | null;
  size: string;
  color: string | null;
  material: string | null;
  price: number;
  itemType: string;
  status: string;
  statusReason: string | null;
  finalAiScore: number | null;
  rawAiScore: number | null;
  missingBillPenaltyApplied: boolean;
  conditionGrade: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
  createdAtIso: string;
}

export interface ListingItem {
  id: string;
  sku?: string;
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
 * Trạng thái tin đăng do backend quyết định lúc tạo
 * (xem `ListingService.ResolveListingStatus` của backend).
 *
 * `FLAGGED` = tin ĐÃ được tạo nhưng đang CHỜ chuyên viên đối soát — CHƯA
 * được phép hiện trên sàn người mua.
 */
export type ListingPublicationStatus = 'ACTIVE' | 'FLAGGED' | 'REJECTED';

/**
 * Tin có được hiện công khai trên sàn người mua hay không.
 *
 * CHỈ `ACTIVE` mới lên sàn; `FLAGGED` (chờ đối soát) và `REJECTED` phải ẩn.
 * Khi backend không trả `status` thì coi như CHƯA công khai — để lộ tin chờ
 * duyệt ra sàn còn tệ hơn là ẩn nhầm.
 *
 * Đây là ranh giới phía CLIENT. Backend vẫn PHẢI lọc ở tầng query, nếu không
 * thì gọi API trực tiếp vẫn lấy được tin đang chờ duyệt.
 */
export const isListingPublic = (status?: string | null): boolean => {
  const normalized = (status ?? '').trim().toLowerCase();

  /* Không có trạng thái → không đủ căn cứ để công khai. */
  if (!normalized) return false;

  return normalized.includes('active') || normalized.includes('publish');
};

/**
 * Body của `POST /api/ListingsExample/create?userId={guid}`.
 *
 * `userId` KHÔNG nằm trong body mà truyền ở query string (kiểu GUID),
 * nên xem `CreateListingPayload` là phần body còn lại.
 */
export interface CreateListingPayload {
  sku: string;
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
