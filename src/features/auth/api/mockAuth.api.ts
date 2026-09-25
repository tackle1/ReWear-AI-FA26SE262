import { ApiResponse } from '../../../types/apiResponse.type';
import { LoginPayload, LoginResponseData, RegisterPayload, RegisterResponseData } from '../types/auth.type';

interface MockAccount extends RegisterResponseData {
  phone: string;
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

export const mockAuthApi = {
  register: async (payload: RegisterPayload): Promise<ApiResponse<RegisterResponseData>> => {
    await delay();
    const accounts = getAccounts();

    if (accounts.some((account) => account.email === payload.email)) {
      throw new Error('Email này đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác.');
    }

    const account: MockAccount = {
      userId: `mock-user-${Date.now()}`,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      password: payload.password,
      role: payload.role,
    };
    saveAccounts([...accounts, account]);

    const { password: _password, phone: _phone, ...user } = account;
    return { success: true, message: 'Đăng ký thành công.', data: user };
  },

  login: async (payload: LoginPayload): Promise<ApiResponse<LoginResponseData>> => {
    await delay();
    const account = getAccounts().find(
      (item) => item.email === payload.email && item.password === payload.password,
    );

    if (!account) {
      throw new Error('Email hoặc mật khẩu không đúng. Hãy đăng ký tài khoản trước.');
    }

    const { password: _password, phone: _phone, ...user } = account;
    return { success: true, message: 'Đăng nhập thành công.', data: { ...user, ...createTokens(account.userId) } };
  },
};

export default mockAuthApi;
