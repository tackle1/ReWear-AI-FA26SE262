import storage from '../../../utils/storage';
import { CreateListingResult } from '../../../types/listing.type';

/**
 * Kho lưu các tin đăng NGƯỜI DÙNG THẬT đã tạo, dùng làm nguồn dữ liệu cho
 * trang tổng quan người bán.
 *
 * Vì sao cần kho này: backend hiện CHƯA có endpoint đọc danh sách tin đăng của
 * seller (đã kiểm tra swagger: chỉ có `create`, `premium-brands`, `thresholds`).
 * Vì vậy mỗi lần tạo tin thành công, ta lưu lại chính response thật của
 * backend vào đây để tổng quan hiển thị dữ liệu CÓ THẬT của tài khoản đang đăng
 * nhập, thay vì những con số bịa đặt trong giao diện.
 *
 * - Kho tách theo `userId` nên mỗi seller chỉ thấy tin của chính mình.
 * - Ghi thất bại thì bỏ qua, không làm hỏng dữ liệu đang có.
 */

/** Khoá lưu trong localStorage. */
const STORAGE_PREFIX = 'rewear_seller_listings_';

/**
 * Tên sự kiện tùy biến báo "kho tin của tôi vừa đổi".
 *
 * Vì sao cần: sự kiện `storage` của trình duyệt KHÔNG bắn trong chính tab đang
 * thao tác. Nên khi bấm "Gửi hồ sơ chờ Admin" ở trang gắn cờ rồi bấm sang
 * Dashboard, trang Dashboard mount sau nên vẫn đọc kho mới — nhưng nếu nó
 * đã mở sẵn (ví dụ mở tab mới) thì không có tín hiệu nào để nạp lại.
 * Phát sự kiện này sau mỗi lần ghi để các trang đang mở cùng cập nhật ngay.
 */
export const SELLER_LISTINGS_CHANGED_EVENT = 'rewear:seller-listings-changed';

/** Thông báo các trang khác nạp lại kho tin. */
const notifyListingsChanged = () => {
  window.dispatchEvent(new Event(SELLER_LISTINGS_CHANGED_EVENT));
};

/** Giới hạn số tin giữ lại để localStorage không phình vô hạn. */
const MAX_RECORDS = 50;

/** Một tin đăng đã tạo, ghép dữ liệu người dùng nhập với kết quả backend trả. */
export interface SellerListingRecord {
  listingId: string;
  sku?: string;
  title: string;
  categoryId: string;
  brand: string;
  size: string;
  price: number;
  itemType: string;
  /** Ảnh đại diện (data URL góc toàn cảnh) để bảng hiển thị thumbnail. */
  thumbnail?: string;
  /** ISO string, dùng để sắp xếp mới nhất lên đầu. */
  createdAt: string;
  /** Kết quả kiểm định thật do backend trả về lúc tạo tin. */
  result: CreateListingResult;
}

const storageKey = (userId: string) => `${STORAGE_PREFIX}${userId}`;

/** Đọc toàn bộ tin đã lưu của seller; trả mảng rỗng nếu chưa có hoặc dữ liệu hỏng. */
export const readSellerListings = (userId: string | null): SellerListingRecord[] => {
  if (!userId) return [];

  const records = storage.getItem<SellerListingRecord[]>(storageKey(userId));

  if (!Array.isArray(records)) return [];

  return records.filter(
    (record): record is SellerListingRecord =>
      Boolean(record) && typeof record.listingId === 'string',
  );
};

/**
 * Ghi thêm một tin đăng vào kho của seller.
 *
 * Trùng `listingId` thì thay thế bản cũ để không nhân bản khi bấm lại nút tạo.
 */
export const saveSellerListing = (
  userId: string | null,
  record: SellerListingRecord,
): void => {
  if (!userId || !record.listingId) return;

  try {
    const current = readSellerListings(userId);
    const next = [
      record,
      ...current.filter((item) => item.listingId !== record.listingId),
    ].slice(0, MAX_RECORDS);

    storage.setItem(storageKey(userId), next);
    notifyListingsChanged();
  } catch {
    // localStorage hết chỗ hoặc bị chặn: bỏ qua, giao diện vẫn chạy bình thường.
  }
};

/** Xóa kho tin đăng của seller (dùng khi đăng xuất). */
export const clearSellerListings = (userId: string | null): void => {
  if (!userId) return;
  storage.removeItem(storageKey(userId));
};