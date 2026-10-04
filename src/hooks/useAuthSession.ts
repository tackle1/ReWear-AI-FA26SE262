import { useCallback, useEffect, useState } from 'react';
import storage, { tokenStorage } from '../utils/storage';
import { SessionUser } from '../features/auth/utils/session';

/** Key lưu phiên đăng nhập (xem `useLogin`). */
const CURRENT_USER_KEY = 'rewear_current_user';

export interface AuthSession {
  /** Đã có access token hợp lệ trong localStorage hay chưa. */
  isAuthenticated: boolean;
  /** Vai trò đã chuẩn hoá (BUYER / SELLER); null khi chưa đăng nhập. */
  role: string | null;
}

/**
 * Đọc trạng thái đăng nhập từ localStorage — nguồn sự thật duy nhất của app.
 *
 * KHÔNG lấy từ Redux `authSlice`: slice đó có sẵn `isAuthenticated` nhưng
 * không hề được dispatch khi khởi động lại app, nên sau khi F5 nó luôn là
 * `false` dù người dùng đã đăng nhập. Đọc thẳng localStorage giống
 * `useCurrentUser` nên hai nơi không mâu thuẫn nhau.
 *
 * Token rỗng được coi là chưa đăng nhập: `axiosClient` chỉ gắn header
 * `Authorization` khi có token, nên thiếu token thì mọi endpoint `[Authorize]`
 * chắc chắn trả 401 — coi như đã đăng nhập chỉ để đi tới màn lỗi 401.
 *
 * Cập nhật lại khi localStorage đổi (đăng nhập ở tab khác, đăng xuất) và khi
 * cửa sổ được focus lại, vì sự kiện `storage` không bắn trong chính tab đã
 * ghi — đúng trường hợp sau khi `handleUnauthorized` xoá token rồi chuyển hướng.
 */
export const useAuthSession = (): AuthSession => {
  const read = useCallback((): AuthSession => {
    const token = tokenStorage.getAccessToken();
    const user = storage.getItem<SessionUser>(CURRENT_USER_KEY);

    return {
      isAuthenticated: Boolean(token),
      role: user?.role ?? null,
    };
  }, []);

  const [session, setSession] = useState<AuthSession>(read);

  useEffect(() => {
    const sync = () => setSession(read());

    window.addEventListener('storage', sync);
    window.addEventListener('focus', sync);

    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('focus', sync);
    };
  }, [read]);

  return session;
};

export default useAuthSession;