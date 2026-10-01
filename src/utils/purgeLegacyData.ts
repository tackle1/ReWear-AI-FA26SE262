import { isGuid } from './uuid';

/**
 * Dọn dữ liệu rác còn sót từ giai đoạn mock.
 *
 * Trước đây luồng đăng ký/đăng nhập chạy hoàn toàn trên localStorage, nên
 * trình duyệt của thành viên nhóm còn:
 * - kho tài khoản giả `rewear_mock_accounts` (chứa CẢ MẬT KHẨU plaintext),
 * - phiên đăng nhập cũ với token giả `mock-access-token-…`,
 * - kho tin đăng của các userId giả (`rewear_seller_listings_<guid>`).
 *
 * Tất cả đều không còn ý nghĩa khi đã chuyển sang API thật, nên xóa ở lần khởi
 * động đầu tiên để không còn dữ liệu bịa trên máy.
 */

/** Kho tài khoản giả của luồng mock — chứa mật khẩu plaintext. */
const LEGACY_MOCK_ACCOUNTS_KEY = 'rewear_mock_accounts';

/** Tiền tố kho tin đăng của seller, gắn với userId giả. */
const LEGACY_LISTINGS_PREFIX = 'rewear_seller_listings_';

/** Key lưu phiên đăng nhập hiện hành. */
const CURRENT_USER_KEY = 'rewear_current_user';

/** Đánh dấu đã dọn để không chạy lại mỗi lần tải trang. */
const CLEANED_FLAG = 'rewear_legacy_cleanup_done';

/** Kiểm tra token có phải token giả do mock sinh ra hay không. */
const isMockToken = (token: string | null | undefined): boolean =>
  typeof token === 'string' && token.startsWith('mock-');

/** Phiên có dùng dữ liệu giả nào không (token giả hoặc userId không phải GUID). */
const isDirtySession = (raw: string | null): boolean => {
  if (!raw) return false;

  try {
    const session = JSON.parse(raw) as { userId?: string; accessToken?: string };

    return (
      isMockToken(session.accessToken) ||
      // userId không phải GUID là dấu hiệu tài khoản mock (mock-user-<timestamp>).
      (Boolean(session.userId) && !isGuid(session.userId))
    );
  } catch {
    // JSON hỏng cũng là dữ liệu rác — coi như cần xóa.
    return true;
  }
};

/**
 * Xóa toàn bộ dữ liệu mock/sai định dạng khỏi localStorage.
 *
 * Hàm này tự chạy đúng một lần (đánh dấu bằng `CLEANED_FLAG`) nên không gây
 * xóa nhầm khi người dùng đang đăng nhập bằng tài khoản thật.
 */
export const purgeLegacyMockData = (): void => {
  try {
    if (localStorage.getItem(CLEANED_FLAG) === '1') return;

    localStorage.removeItem(LEGACY_MOCK_ACCOUNTS_KEY);

    // Xóa mọi kho tin đăng gắn với userId (tất cả đều từ luồng mock).
    Object.keys(localStorage)
      .filter((key) => key.startsWith(LEGACY_LISTINGS_PREFIX))
      .forEach((key) => localStorage.removeItem(key));

    // Phiên đăng nhập giả thì xóa cả token để app buộc đăng nhập lại bằng API thật.
    if (isDirtySession(localStorage.getItem(CURRENT_USER_KEY))) {
      localStorage.removeItem(CURRENT_USER_KEY);
      localStorage.removeItem('rewear_access_token');
      localStorage.removeItem('rewear_refresh_token');
    }

    localStorage.setItem(CLEANED_FLAG, '1');
  } catch {
    // localStorage bị chặn (private mode) — bỏ qua, app vẫn chạy.
  }
};

export default purgeLegacyMockData;