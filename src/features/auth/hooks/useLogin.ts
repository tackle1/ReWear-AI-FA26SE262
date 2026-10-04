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
      /*
       * Backend trả lỗi đăng nhập sai qua `GlobalExceptionHandlerMiddleware` với
       * shape (HttpStatusCode.BadRequest + ArgumentException):
       *   { success: false, error: { code: "ERR_INVALID_PARAMETER", message: "..." } }
       *
       * LƯU Ý: field là `error.message`, KHÔNG phải `error.details`. Code cũ đọc
       * `error.details` nên luôn rơi xuống `err.message` của axios và hiện ra
       * "Request failed with status code 400" — thông báo rối, tiếng Anh.
       * Vì vậy phải đọc `error.message` TRƯỚC, rồi mới tới fallback chung.
       */
      const apiError = err as {
        response?: {
          status?: number;
          data?: {
            message?: string;
            error?: { code?: string; message?: string; details?: string };
            /*
             * Lỗi ModelState của ASP.NET Core (thiếu/sai định dạng ở tầng DTO)
             * dùng shape RIÊNG, không phải `ApiErrorResponse`:
             *   { type, title, status, errors: { "Email": ["Email không hợp lệ."] } }
             * `errors` là object, mỗi field là mảng thông báo.
             */
            errors?: Record<string, string[] | string>;
          };
        };
        message?: string;
      };

      /*
       * Gom thông báo ModelState về một dòng cho dễ đọc, ví dụ:
       * "Email không hợp lệ. Mật khẩu là bắt buộc."
       */
      const validationMessages = Object.values(apiError.response?.data?.errors ?? {})
        .flatMap((list) => (Array.isArray(list) ? list : [list]))
        .filter((text): text is string => typeof text === 'string' && text.length > 0);

      const backendMessage =
        apiError.response?.data?.error?.message ??
        (validationMessages.length > 0 ? validationMessages.join(' ') : undefined) ??
        apiError.response?.data?.message;

      /*
       * `AuthService.LoginAsync` CỐ Ý dùng chung một câu cho cả email không tồn
       * tại lẫn sai mật khẩu, để không lộ email nào đã đăng ký. Nên ở đây cũng
       * KHÔNG tự phân biệt "email sai" với "mật khẩu sai" — chỉ hiện đúng câu
       * backend trả về, nếu không sẽ vô tình phá lớp bảo mật đó.
       */
      const errorMessage =
        backendMessage ||
        (apiError.response?.status === 400
          ? 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.'
          : apiError.message) ||
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
