import { ApiResponse } from '../../../types/apiResponse.type';
import { LoginPayload, LoginResponseData, RegisterPayload, RegisterResponseData } from '../types/auth.type';
import { createUuid, isGuid, normalizeGuid } from '../../../utils/uuid';

interface MockAccount extends RegisterResponseData {
  password: string;
}

const MOCK_ACCOUNTS_KEY = 'rewear_mock_accounts';
const delay = () => new Promise<void>((resolve) => window.setTimeout(resolve, 250));

const getAccounts = (): MockAccount[] => {
  try {
    return JSON.parse(localStorage.getItem(MOCK_ACCOUNTS_KEY) ?? '[]') as MockAccount[];
  } catch {
    return [];
  }
};

const saveAccounts = (accounts: MockAccount[]) => {
  localStorage.setItem(MOCK_ACCOUNTS_KEY, JSON.stringify(accounts));
};

const createTokens = (userId: string) => ({
  accessToken: `mock-access-token-${userId}`,
  refreshToken: `mock-refresh-token-${userId}`,
});

/**
 * Tra cứu hồ sơ tài khoản theo email trong kho mock.
 * Dùng làm nguồn dự phòng cho phiên đăng nhập cũ đã lưu vào localStorage
 * trước khi `phone` được thêm vào response — trường hợp này phiên không có
 * `phone` nhưng tài khoản vẫn có SĐT đúng từ lúc đăng ký.
 */
export const findMockAccountByEmail = (email?: string) => {
  if (!email) return null;
  return getAccounts().find((account) => account.email === email) ?? null;
};

export const mockAuthApi = {
  register: async (payload: RegisterPayload): Promise<ApiResponse<RegisterResponseData>> => {
    await delay();
    const accounts = getAccounts();

    if (accounts.some((account) => account.email === payload.email)) {
      throw new Error('Email này đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác.');
    }

    /*
     * `userId` PHẢI là GUID hợp lệ vì backend nhận tham số `string($guid)`.
     * Trước đây dùng `mock-user-${Date.now()}` nên mọi lần đăng nhập seller đều
     * gửi userId sai định dạng và backend từ chối.
     */
    const account: MockAccount = {
      userId: createUuid(),
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      password: payload.password,
      role: payload.role,
    };
    saveAccounts([...accounts, account]);

    // Chỉ `password` bị loại khỏi response; `phone` được giữ lại để màn hình
    // sau đăng ký hiển thị đúng số điện thoại vừa đăng ký.
    const { password: _password, ...user } = account;
    return { success: true, message: 'Đăng ký thành công.', data: user };
  },

  login: async (payload: LoginPayload): Promise<ApiResponse<LoginResponseData>> => {
    await delay();

    const accounts = getAccounts();
    const index = accounts.findIndex(
      (item) => item.email === payload.email && item.password === payload.password,
    );

    if (index === -1) {
      throw new Error('Email hoặc mật khẩu không đúng. Hãy đăng ký tài khoản trước.');
    }

    let account = accounts[index];

    /*
     * Tài khoản mock đã đăng ký từ trước bản này có `userId` kiểu
     * `mock-user-<timestamp>` — không phải GUID nên không dùng làm tham số
     * `string($guid)` được. Cấp lại GUID hợp lệ và ghi lại kho để lần sau
     * đăng nhập vẫn giữ đúng userId.
     */
    if (!isGuid(account.userId)) {
      account = { ...account, userId: createUuid() };
      const nextAccounts = [...accounts];
      nextAccounts[index] = account;
      saveAccounts(nextAccounts);
    }

    // `phone` được trả về để các màn hình sau đăng nhập hiển thị đúng SĐT,
    // chỉ `password` mới bị loại khỏi response.
    const { password: _password, ...user } = account;

    // Chuẩn hoá về lowercase, bỏ ngoặc nhọn nếu có, đúng chuẩn GUID backend nhận.
    const userId = normalizeGuid(user.userId) as string;

    return {
      success: true,
      message: 'Đăng nhập thành công.',
      data: { ...user, userId, ...createTokens(userId) },
    };
  },
};

export default mockAuthApi;
