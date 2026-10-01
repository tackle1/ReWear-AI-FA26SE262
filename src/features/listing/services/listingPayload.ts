import storage from '../../../utils/storage';
import {
  CreateListingPayload,
  CreateListingPhoto,
  REQUIRED_ANGLE_TYPES,
} from '../../../types/listing.type';
import { LoginResponseData } from '../../../features/auth/types/auth.type';
import { normalizeGuid } from '../../../utils/uuid';

/**
 * Body của `POST /api/ListingsExample/create` yêu cầu `photos` là mảng
 * `{ angleType, imageUrl }`. Bước 02 đã dùng chính `angleType` của backend làm
 * khoá lưu ảnh nên khi gửi lên không cần bảng tra — gửi thẳng khoá ảnh.
 */

/** Trả về các `angleType` bắt buộc còn thiếu, dùng để chặn trước khi gọi API. */
export const findMissingAngles = (photos: Record<string, string>): string[] =>
  REQUIRED_ANGLE_TYPES.filter((angleType) => !photos[angleType]);

export interface BuildListingPayloadInput {
  productInfo: {
    name: string;
    categoryId: string;
    brand: string;
    size: string;
    pattern: string;
    /** Chất liệu — gửi lên API ở field `material`. */
    material: string;
    price: string;
    /** Giới tính đã chọn ở Bước 01: 'male' | 'female'. */
    gender: string;
  };
  /** Ảnh chụp ở Bước 02, key là id góc ('01'…'05'). */
  photos: Record<string, string>;
  /** Ảnh hóa đơn ở Bước 01 (nếu có). */
  billPhoto?: string;
  /** Hình thức sản phẩm: 'clearance' | 'secondhand'. */
  condition: string;
}

/** Bỏ ký tự không phải số, trả về 0 nếu rỗng/không hợp lệ. */
const toPriceNumber = (raw: string): number => {
  const digits = (raw ?? '').replace(/\D/g, '');
  const amount = Number(digits);
  return Number.isFinite(amount) ? amount : 0;
};

/**
 * Gom ảnh Bước 02 thành mảng `photos` của body.
 * Khoá ảnh chính là `angleType` của backend nên gửi thẳng, không cần tra.
 * Góc chưa chụp thì bỏ qua, không gửi gốc rỗng.
 */
export const buildPhotos = (photos: Record<string, string>): CreateListingPhoto[] =>
  Object.entries(photos)
    .filter(([, url]) => Boolean(url))
    .map(([angleType, url]) => ({ angleType, imageUrl: url }));

/**
 * Chuyển dữ liệu Bước 01 + Bước 02 thành body đúng schema backend.
 *
 * Ánh xạ field:
 * - title     ← tên sản phẩm (Bước 01)
 * - categoryId← mã danh mục ổn định (vd: 'apparel')
 * - brand/size← nhập ở Bước 01
 * - color     ← trường "Màu sắc / hoạ tiết" của Bước 01
 * - material  ← trường "Chất liệu" của Bước 01
 * - gender     ← giới tính chọn ở Bước 01
 * - price     ← giá ở Bước 01, đổi sang number
 * - itemType  ← hình thức sản phẩm đang chọn
 * - photos    ← ảnh đã chụp ở Bước 02
 */
export const buildListingPayload = ({
  productInfo,
  photos,
  billPhoto,
  condition,
}: BuildListingPayloadInput): CreateListingPayload => ({
  title: productInfo.name,
  categoryId: productInfo.categoryId,
  brand: productInfo.brand,
  size: productInfo.size,
  color: productInfo.pattern,
  material: productInfo.material,
  gender: productInfo.gender,
  price: toPriceNumber(productInfo.price),
  itemType: condition,
  billPhotoUrl: billPhoto ?? '',
  photos: buildPhotos(photos),
});

/**
 * Lấy userId của seller đang đăng nhập, hoặc `null` nếu chưa đăng nhập / mã
 * không phải GUID hợp lệ.
 *
 * Backend nhận `userId` kiểu `string($guid)` nên chỉ trả về khi chuẩn hoá
 * thành công; nhận thêm `id` phòng khi phiên lưu mã ở trường khác.
 */
export const readSellerUserId = (): string | null => {
  const user = storage.getItem<LoginResponseData & { id?: string }>('rewear_current_user');
  return normalizeGuid(user?.userId) ?? normalizeGuid(user?.id);
};

export default buildListingPayload;