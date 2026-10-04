import storage from '../../../utils/storage';
import {
  CreateListingPayload,
  CreateListingPhoto,
  REQUIRED_ANGLE_TYPES,
} from '../../../types/listing.type';
import { LoginResponseData } from '../../../features/auth/types/auth.type';
import { normalizeGuid } from '../../../utils/uuid';

/**
 * Cạnh dài tối đa (px) của ảnh gửi lên backend.
 *
 * Camera mặc định trả khung 1920px. Giữ 1600px thay vì 1280px vì Bước 03 chấm
 * điểm kích thước theo CẠNH NGẮN: ảnh ngang 16:9 ở 1280px chỉ còn cao 720px,
 * sát ngưỡng tối thiểu 640px và dễ bị backend từ chối oan. Ở 1600px, cạnh ngắn
 * còn ~900px — thoải mái vượt ngưỡng mà request vẫn nhẹ.
 */
const MAX_CAPTURE_EDGE = 1600;

/** Chất lượng JPEG sau khi nén — 0.82 nhìn gần như không khác ảnh gốc. */
const CAPTURE_QUALITY = 0.82;

/**
 * Vẽ một nguồn ảnh (video/canvas/Image) vào canvas đã thu nhỏ rồi trả về
 * data URL. Giữ nguyên tỷ lệ, không phóng to ảnh vốn đã nhỏ hơn giới hạn.
 */
const renderScaledDataUrl = (
  source: CanvasImageSource,
  width: number,
  height: number,
): string => {
  const scale = Math.min(1, MAX_CAPTURE_EDGE / Math.max(width, height));
  const targetWidth = Math.max(1, Math.round(width * scale));
  const targetHeight = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Thiết bị này không hỗ trợ xử lý ảnh.');
  }

  context.drawImage(source, 0, 0, targetWidth, targetHeight);
  return canvas.toDataURL('image/jpeg', CAPTURE_QUALITY);
};

/** Đọc file thành data URL gốc, không nén (dùng làm đầu vào cho bước resize). */
const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Không đọc được ảnh vừa chọn.'));
      }
    };
    reader.onerror = () => reject(new Error('Không đọc được ảnh vừa chọn.'));
    reader.readAsDataURL(file);
  });

/** Nạp một data URL vào đối tượng Image để đo kích thước. */
const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Ảnh không hợp lệ.'));
    image.src = src;
  });

/**
 * Thu nhỏ + nén một data URL về kích thước gửi lên backend.
 *
 * Bắt buộc về mặt kỹ thuật: backend lưu ảnh ra file và chỉ giữ URL ngắn
 * trong `ListingMedia.ImageUrl` (varchar 2048), nên ảnh gốc càng nhỏ thì
 * request càng nhẹ và việc kiểm định AI càng nhanh.
 */
export const compressImageDataUrl = async (dataUrl: string): Promise<string> => {
  const image = await loadImage(dataUrl);

  // Ảnh đã nhỏ hơn giới hạn thì giữ nguyên, tránh nén lại lần nữa.
  if (Math.max(image.naturalWidth, image.naturalHeight) <= MAX_CAPTURE_EDGE) {
    return dataUrl;
  }

  return renderScaledDataUrl(image, image.naturalWidth, image.naturalHeight);
};

/** Đọc file người dùng chọn, thu nhỏ và nén trước khi lưu vào góc ảnh. */
export const compressImageFile = async (file: File): Promise<string> =>
  compressImageDataUrl(await readFileAsDataUrl(file));

/**
 * Chụp khung hình hiện tại của video thành data URL đã thu nhỏ.
 * Dùng cho luồng camera của Bước 02.
 */
export const captureVideoFrame = (video: HTMLVideoElement): string =>
  renderScaledDataUrl(video, video.videoWidth, video.videoHeight);

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
    sku: string;
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
  sku: productInfo.sku,
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

/**
 * Kho nhớ hồ sơ giữa Bước 05 và hai trang kết quả (Đăng tin / Gắn cờ).
 *
 * Vì sao cần kho này: Bước 06 cũ là MỘT BƯỚC trong cùng trang nên state của
 * người bán (ảnh, thông tin sản phẩm) còn sống. Sau khi tách thành trang
 * riêng, chuyển trang sẽ mất toàn bộ state đó — payload gửi API lại lấy từ
 * đâu? Đây là lý do.
 *
 * Dùng `sessionStorage` (không phải `localStorage`) vì đây là dữ liệu nháp của
 * MỘT phiên đăng tin: đóng tab là bỏ, không nên để lại tin cũ mở lại sai.
 * Ảnh là data URL nên khoá này có thể vài MB — vẫn nằm trong giới hạn
 * sessionStorage (thường 5–10MB) và chỉ tồn tại trên tab hiện tại.
 */

/** Khoá lưu trong sessionStorage. */
const DRAFT_KEY = 'rewear_listing_pending_draft';

/** Thông tin hiển thị + body API của một hồ sơ đã qua Bước 05. */
export interface PendingListingDraft {
  /** Body đúng schema `POST /api/ListingsExample/create`. */
  payload: CreateListingPayload;
  /** Điểm confidence cuối do Bước 05 chốt (dùng cho badge và mô tả). */
  confidence: number;
  /** true nếu hồ sơ bị trừ điểm vì thiếu hóa đơn. */
  billPenaltyApplied?: boolean;
  /** Phân khúc thương hiệu backend đã trả về ở Bước 04 (nếu có). */
  brandSegment?: string;
  /** Ảnh đại diện (data URL góc toàn cảnh) để preview. */
  thumbnail?: string;
  /** Tên / hãng / kích cỡ / giá / sku để hiển thị. */
  name?: string;
  brand?: string;
  category?: string;
  size?: string;
  pattern?: string;
  price?: string;
  sku?: string;
  /** ISO string — dùng để chẩn đoán hồ sơ cũ khi mở lại trang. */
  savedAt: string;
}

/** Lưu hồ sơ để trang kế tiếp đọc lại. Ghi lỗi thì bỏ qua, không chặn luồng. */
export const savePendingDraft = (draft: PendingListingDraft): void => {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // sessionStorage hết chặn hoặc bị chặn (private mode) — vẫn cho sang trang,
    // trang đích sẽ tự báo "không tìm thấy hồ sơ" nếu thiếu dữ liệu.
  }
};

/**
 * Đọc hồ sơ đang chờ. Trả `null` khi chưa có, dữ liệu hỏng, hoặc quá 30 phút
 * (người bán bỏ tab rồi quay lại — dữ liệu đã lỗi thời).
 */
export const readPendingDraft = (): PendingListingDraft | null => {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;

    const draft = JSON.parse(raw) as PendingListingDraft;

    if (!draft?.payload || typeof draft.confidence !== 'number') return null;

    const savedAt = Date.parse(draft.savedAt ?? '');
    const isExpired = Number.isFinite(savedAt) && Date.now() - savedAt > 30 * 60 * 1000;
    if (isExpired) {
      clearPendingDraft();
      return null;
    }

    return draft;
  } catch {
    return null;
  }
};

/** Xóa hồ sơ đang chờ sau khi đăng xong (tránh bấm lại tạo trùng tin). */
export const clearPendingDraft = (): void => {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // Không làm được thì thôi — hồ sơ sẽ bị xóa khi đóng tab.
  }
};