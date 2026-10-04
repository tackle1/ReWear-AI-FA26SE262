export type AuthRole = 'BUYER' | 'SELLER';

/**
 * Mã vai trò khớp bảng `Role` của backend (`Role.RoleId` cố định 1/2/3).
 *
 * Backend nhận `roleId` kiểu **int** trong `RegisterRequestDto`, không nhận
 * chuỗi "SELLER"/"BUYER" — nên mọi lúc đăng ký đều phải quy đổi qua đây.
 *
 * Lưu ý: `ADMIN` (1) cố ý không nằm trong `AuthRole` vì backend chặn tự đăng ký
 * tài khoản quản trị — tài khoản admin phải do quản trị viên cấp.
 */
export const ROLE_ID = {
  ADMIN: 1,
  SELLER: 2,
  BUYER: 3,
} as const;

/** Quy đổi vai trò của UI sang `roleId` mà backend mong đợi. */
export const roleToId = (role: AuthRole): number =>
  role === 'SELLER' ? ROLE_ID.SELLER : ROLE_ID.BUYER;

export interface RegisterFormData {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: AuthRole;
  agreeTerms: boolean;
}

/**
 * SĐ ĐT chỉ gồm chữ số, tùy chọn có `+` ở đầu, dài 9–15 — đúng regex
 * `[RegularExpression(@"^\+?[0-9]{9,15}$")]` của backend. Phải khớp để người
 * dùng không nhập được ở UI rồi bị backend từ chối.
 */
export const PHONE_PATTERN = /^\+?[0-9]{9,15}$/;

/**
 * Mật khẩu: tối thiểu 8 ký tự, có cả chữ cái và chữ số — đúng luật
 * `AuthService.ValidatePasswordStrength` phía server (UI chỉ để báo sớm).
 */
export const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export interface RegisterPayload {
  /** Họ và tên — backend nhận `fullName`. */
  fullName: string;
  phone: string;
  email: string;
  password: string;
  /** Khóa ngoại vai trò: 2 = SELLER, 3 = BUYER (xem `ROLE_ID`). */
  roleId: number;
  /**
   * CỐ Ý KHÔNG có `confirmPassword` ở đây.
   *
   * Ô "Xác nhận mật khẩu" chỉ là kiểm tra chống gõ nhầm ở giao diện, nên không
   * cần — và không nên — gửi mật khẩu hai lần qua mạng. `RegisterForm` chặn
   * trước khi submit nếu hai ô không khớp, backend chỉ nhận một mật khẩu.
   */
}

/**
 * Dữ liệu tài khoản backend trả về — giống hệt nhau cho cả đăng ký lẫn đăng
 * nhập, khớp `AuthResponseDto` của backend.
 */
export interface AuthApiAccount {
  /** GUID khóa chính bảng Users — giá trị này gửi lên ?userId= khi tạo tin. */
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  /** Khóa ngoại vai trò (2 = SELLER, 3 = BUYER). */
  roleId: number;
  /** Tên vai trò để hiển thị, ví dụ "SELLER". */
  roleName: string;
  accessToken: string;
  refreshToken: string;
  /** Thời hạn access token (giây). */
  expiresIn: number;
  /** Số lượt kiểm định AI còn lại. */
  aiTokenBalance: number;
}

export type AuthAccountData = AuthApiAccount;
export type RegisterResponseData = AuthApiAccount;

export interface RegisterResponse {
  success: boolean;
  message?: string;
  data: RegisterResponseData;
}

// ─────────────────────────────────────────
// Login
// ─────────────────────────────────────────

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Backend trả về CÙNG một shape cho cả register và login, nên kiểu này dùng
 * chung `AuthApiAccount` thay vì khai báo lại (trước đây khai `role: AuthRole`
 * trong khi backend thực tế gửi `roleId` + `roleName`).
 */
export type LoginResponseData = AuthApiAccount;

export interface LoginResponse {
  success: boolean;
  message?: string;
  data: LoginResponseData;
}

