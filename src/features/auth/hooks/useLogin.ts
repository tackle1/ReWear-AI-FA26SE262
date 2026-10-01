import { useState, useCallback } from 'react';
import { loginApi } from '../api/login.api';
import { LoginFormData, LoginResponseData } from '../types/auth.type';
import storage, { tokenStorage } from '../../../utils/storage';
import { normalizeGuid } from '../../../utils/uuid';

export interface UseLoginReturn {
  login: (formData: LoginFormData) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
  loggedInUser: LoginResponseData | null;
  resetState: () => void;
}

export const useLogin = (): UseLoginReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [loggedInUser, setLoggedInUser] = useState<LoginResponseData | null>(null);

  const login = useCallback(async (formData: LoginFormData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const response = await loginApi.login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (response && response.data) {
        const { accessToken, refreshToken } = response.data;

        /*
         * Chuẩn hoá `userId` ngay lúc đăng nhập để mọi nơi đọc phiên đều nhận
         * đúng GUID. Backend có thể đặt mã ở `userId` hoặc `id` (kiểu ASP.NET
         * Identity thường trả `id`), và có thể trả kèm ngoặc nhọn — gom về một
         * trường `userId` chuẩn để `createListing` dùng làm tham số `string($guid)`.
         */
        const raw = response.data as LoginResponseData & { id?: string };
        const userId = normalizeGuid(raw.userId) ?? normalizeGuid(raw.id);

        const user: LoginResponseData = { ...raw, userId: userId ?? '' };

        tokenStorage.setTokens(accessToken, refreshToken);
        storage.setItem('rewear_current_user', user);
        setLoggedInUser(user);
      }

      setIsSuccess(true);
      return true;
    } catch (err: unknown) {
      const apiError = err as {
        response?: {
          data?: {
            message?: string;
            error?: { details?: string };
          };
        };
        message?: string;
      };

      const errorMessage =
        apiError.response?.data?.message ||
        apiError.response?.data?.error?.details ||
        apiError.message ||
        'Email hoặc mật khẩu không đúng. Vui lòng thử lại.';

      setError(errorMessage);
      setIsSuccess(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetState = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setIsSuccess(false);
    setLoggedInUser(null);
  }, []);

  return {
    login,
    isLoading,
    error,
    isSuccess,
    loggedInUser,
    resetState,
  };
};

export default useLogin;
