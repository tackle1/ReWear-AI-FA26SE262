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
 * Kết quả trả về của `POST /api/ListingsExample/create`.
 *
 * Backend chưa công bố schema chính thức nên khai báo tối thiểu và cho phép
 * thêm field; không nên đặt mọi thứ là bắt buộc để không vỡ khi backend đổi.
 */
export interface CreateListingResult {
  /** Mã tin đăng vừa tạo, nếu backend có trả về. */
  id?: string;
  listingId?: string;
  message?: string;
  [key: string]: unknown;
}
