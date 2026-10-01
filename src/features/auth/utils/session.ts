import { AuthAccountData, AuthRole } from '../types/auth.type';
import { normalizeGuid } from '../../../utils/uuid';

/**
 * Shape của phiên đăng nhập lưu ở localStorage (`rewear_current_user`).
 *
 * Khác backend ở hai điểm, và việc chuẩn hoá tập trung ở đây giúp cả đăng ký
 * lẫn đăng nhập lưu phiên giống hệt nhau:
 * - backend trả `fullName`, app đọc `name` (xem `useCurrentUser`).
 * - backend trả `roleId` + `roleName`, app điều hướng theo `role`.
 */
export interface SessionUser {
  userId: string;
  name: string;
  email: string;
  phone: string;
  /** Vai trò đã chuẩn hoá để điều hướng (BUYER/SELLER). */
  role: AuthRole;
  /** Khóa ngoại vai trò như backend trả về (2 = SELLER, 3 = BUYER). */
  roleId: number;
  /** Tên vai trò nguyên bản từ backend, để hiển thị. */
  roleName: string;
  accessToken: string;
  refreshToken: string;
  /** Số lượt kiểm định AI còn lại. */
  aiTokenBalance: number;
}

/**
 * Đồng nhất vai trò để điều hướng: chỉ `SELLER` mới vào khu vực người bán.
 * Backend gửi tên vai trò ở `roleName` (kèm `roleId`), nên đọc từ đó.
 * Trả về BUYER cho mọi giá trị lạ để không bao giờ cấp nhầm quyền.
 */
const normalizeRole = (roleName: string | undefined): AuthRole =>
  roleName?.trim().toUpperCase() === 'SELLER' ? 'SELLER' : 'BUYER';

/**
 * Chuyển dữ liệu tài khoản từ backend thành shape phiên đăng nhập.
 *
 * `userId` được chuẩn hoá ở ĐÂY — đây là điểm duy nhất mọi phiên đăng nhập /
 * đăng ký đi qua, nên đảm bảo `rewear_current_user` luôn chứa GUID sạch. Nếu để
 * mỗi hook tự xử lý thì dễ có nhánh bị sót (đăng ký trước đây không chuẩn hoá,
 * còn đăng nhập thì có) và `userId` hỏng chỉ lộ ra muộn ở màn tạo tin đăng.
 *
 * Backend trả `userId` (khóa chính bảng Users); vẫn chấp nhận `id` cho các phiên
 * cũ lưu mã ở trường khác, và trả chuỗi rỗng nếu không có GUID hợp lệ — khi đó
 * `useCurrentUser` sẽ trả `null` và chặn thao tác kèm thông báo rõ ràng.
 */
export const toSessionUser = (account: AuthAccountData): SessionUser => {
  const source = account as AuthAccountData & { id?: string };

  return {
    userId: normalizeGuid(source.userId) ?? normalizeGuid(source.id) ?? '',
    name: (account.fullName ?? '').trim(),
    email: (account.email ?? '').trim().toLowerCase(),
    phone: (account.phone ?? '').trim(),
    role: normalizeRole(account.roleName),
    roleId: account.roleId,
    roleName: (account.roleName ?? '').trim().toUpperCase(),
    accessToken: account.accessToken,
    refreshToken: account.refreshToken,
    aiTokenBalance: account.aiTokenBalance,
  };
};