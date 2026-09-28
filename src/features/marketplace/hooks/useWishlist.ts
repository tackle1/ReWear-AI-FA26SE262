import { useCallback, useSyncExternalStore } from 'react';
import storage from '../../../utils/storage';

const WISHLIST_KEY = 'rewear_wishlist_ids';

export interface UseWishlistReturn {
  /** Danh sách id sản phẩm đã lưu, mới nhất trong danh sách. */
  savedIds: string[];
  /** Kiểm tra một sản phẩm đã được lưu hay chưa. */
  isSaved: (id: string) => boolean;
  /** Bật/tắt một sản phẩm trong danh sách yêu thích. */
  toggleSave: (id: string) => void;
}

/* ============================================================
   Store dùng chung — nhiều component cùng đọc một nguồn sự thật
   ============================================================ */

type Listener = () => void;

const EMPTY_IDS: string[] = [];

const readWishlist = (): string[] => storage.getItem<string[]>(WISHLIST_KEY) ?? EMPTY_IDS;

let cache: string[] = readWishlist();
const listeners = new Set<Listener>();

/** Ghi danh sách xuống storage rồi báo mọi subscriber cập nhật. */
const commit = (next: string[]) => {
  cache = next;
  storage.setItem(WISHLIST_KEY, next);
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => cache;

/**
 * Đồng bộ lại khi `localStorage` bị đổi từ tab khác (sự kiện `storage`).
 * Snapshot mới luôn khác tham chiếu vì `readWishlist` trả về mảng mới khi có dữ liệu.
 */
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== WISHLIST_KEY) return;
    cache = readWishlist();
    listeners.forEach((listener) => listener());
  });
}

/**
 * Danh sách yêu thích dùng chung cho mọi màn hình trong không gian người mua.
 *
 * State nằm ở module nên mọi hook gọi đều thấy cùng dữ liệu và cập nhật
 * tức thì: bấm tim ở sàn giao dịch là badge trên thanh điều hướng đổi ngay,
 * và ngược lại bỏ tim ở trang Danh sách yêu thích cũng cập nhật lại sàn.
 * Dữ liệu vẫn lưu `localStorage` nên giữ được sau khi tải lại trang.
 */
export const useWishlist = (): UseWishlistReturn => {
  const savedIds = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const toggleSave = useCallback((id: string) => {
    const next = cache.includes(id)
      ? cache.filter((item) => item !== id)
      : [id, ...cache];
    commit(next);
  }, []);

  const isSaved = useCallback((id: string) => savedIds.includes(id), [savedIds]);

  return { savedIds, isSaved, toggleSave };
};

export default useWishlist;
