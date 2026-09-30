import { useCallback, useEffect, useState } from 'react';
import storage from '../utils/storage';
import { LoginResponseData } from '../features/auth/types/auth.type';

/** Key lưu thông tin user đăng nhập (xem `useLogin`). */
const CURRENT_USER_KEY = 'rewear_current_user';

export interface UseCurrentUserReturn {
  /** GUID của người dùng đang đăng nhập; `null` khi chưa đăng nhập. */
  userId: string | null;
  role: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  /** Đọc lại phiên từ storage — dùng sau khi tự cập nhật hồ sơ. */
  refresh: () => void;
}

/**
 * Đọc thông tin user đang đăng nhập từ localStorage.
 *
 * Repo lưu user ở key `rewear_current_user` (xem `useLogin` và các trang Buyer),
 * nên theo đúng cách đó thay vì đọc thẳng Redux — `authSlice` hiện chưa được
 * dispatch ở bất kỳ đâu nên lấy từ đó sẽ luôn rỗng.
 *
 * Hook tự cập nhật khi localStorage đổi (đăng nhập/đăng xuất/sửa hồ sơ) nên
 * tên hiển thị trên topbar luôn khớp với tài khoản thật.
 */
export const useCurrentUser = (): UseCurrentUserReturn => {
  const [user, setUser] = useState<LoginResponseData | null>(() =>
    storage.getItem<LoginResponseData>(CURRENT_USER_KEY),
  );

  const refresh = useCallback(() => {
    setUser(storage.getItem<LoginResponseData>(CURRENT_USER_KEY));
  }, []);

  useEffect(() => {
    // Sự kiện `storage` chỉ bắn ở tab khác; cùng tab thì `useLogin` đã set
    // state qua điều hướng nên vẫn đọc lại được khi remount.
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, [refresh]);

  return {
    userId: user?.userId ?? null,
    role: user?.role ?? null,
    name: user?.name ?? null,
    email: user?.email ?? null,
    phone: user?.phone ?? null,
    refresh,
  };
};

export default useCurrentUser;
