import { useState, useCallback } from 'react';
import { loginApi } from '../api/login.api';
import { LoginFormData, LoginResponseData } from '../types/auth.type';
import storage, { tokenStorage } from '../../../utils/storage';
import { toSessionUser } from '../utils/session';

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
        /*
         * `toSessionUser` chịu trách nhiệm chuẩn hoá `userId` thành GUID sạch
         * (bỏ ngoặc nhọn, lowercase, chấp nhận cả trường `id`), nên mọi phiên
         * đăng nhập đều lưu cùng một dạng. `useCurrentUser` đọc lại giá trị này
         * để gửi `?userId=` cho POST /api/ListingsExample/create.
         */
        const session = toSessionUser(response.data);

        tokenStorage.setTokens(session.accessToken, session.refreshToken);
        storage.setItem('rewear_current_user', session);
        setLoggedInUser({ ...response.data, userId: session.userId });
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
