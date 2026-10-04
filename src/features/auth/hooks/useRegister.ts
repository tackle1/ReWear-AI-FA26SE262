import { useState, useCallback } from 'react';
import { registerApi } from '../api/register.api';
import {
  RegisterFormData,
  RegisterPayload,
  RegisterResponseData,
  roleToId,
} from '../types/auth.type';
import storage, { tokenStorage } from '../../../utils/storage';

export interface UseRegisterReturn {
  register: (formData: RegisterFormData) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  /**
   * Ô input mà lỗi vừa phát sinh thuộc về, để form gắn thông báo ngay cạnh
   * trường đó thay vì chỉ báo chung ở đầu form. `null` = lỗi chung.
   *
   * Với lỗi email trùng, backend dùng code `ERR_INVALID_PARAMETER` chung cho
   * cả email lẫn số điện thoại trùng, nên phải đoán theo nội dung thông báo
   * (xem `EMAIL_TAKEN_HINTS` bên dưới) — backend chưa trả mã riêng cho từng field.
   */
  errorField: 'email' | 'phone' | null;
  isSuccess: boolean;
  registeredUser: RegisterResponseData | null;
  resetState: () => void;
}

/**
 * Cụm từ trong thông báo tiếng Việt của backend cho biết lỗi là "email trùng"
 * hay "số điện thoại trùng". So khớp không phân biệt hoa thường để chịu được
 * cả khi backend đổi cách viết.
 */
const EMAIL_TAKEN_HINTS = ['email này đã được đăng ký', 'email đã tồn tại', 'email đã được sử dụng'];
const PHONE_TAKEN_HINTS = ['số điện thoại này đã được sử dụng', 'số điện thoại đã tồn tại'];

/** Đoán lỗi thuộc ô nào từ câu thông báo của backend. */
const detectErrorField = (message: string): 'email' | 'phone' | null => {
  const text = message.toLowerCase();
  if (EMAIL_TAKEN_HINTS.some((hint) => text.includes(hint))) return 'email';
  if (PHONE_TAKEN_HINTS.some((hint) => text.includes(hint))) return 'phone';
  return null;
};

export const useRegister = (): UseRegisterReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [registeredUser, setRegisteredUser] = useState<RegisterResponseData | null>(null);
  const [errorField, setErrorField] = useState<'email' | 'phone' | null>(null);

  const register = useCallback(async (formData: RegisterFormData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      /*
       * Khớp 1-1 với RegisterRequestDto của backend: fullName, phone, email,
       * password và roleId (int) — không phải chuỗi "SELLER".
       *
       * KHÔNG gửi `confirmPassword`: ô xác nhận chỉ chống gõ nhầm ở UI
       * (`RegisterForm` đã chặn trước khi submit nếu lệch), không cần gửi mật
       * khẩu hai lần qua mạng.
       */
      const payload: RegisterPayload = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        roleId: roleToId(formData.role),
      };

      const response = await registerApi.register(payload);

      if (response && response.data) {
        setRegisteredUser(response.data);
      }

      /*
       * Cố Ý KHÔNG lưu phiên ở đây.
       *
       * Trước đây backend cấp token ngay khi đăng ký và ta lưu vào
       * localStorage rồi vào thẳng khu vực theo vai trò. Nay luồng đã đổi:
       * đăng ký xong điều hướng sang trang ĐĂNG NHẬP, nên nếu vẫn giữ token
       * thì `ProtectedRoute` sẽ coi người dùng là đã đăng nhập và tự đẩy họ
       * khỏi /login — tạo vòng lặp điều hướng.
       *
       * Vì vậy xoá sạch cả token lẫn user đã lưu (phòng khi còn sót từ
       * phiên trước), đúng như `handleLogout` ở các trang khác đang làm.
       * Người dùng đăng nhập lại bằng chính email/mật khẩu vừa tạo.
       */
      tokenStorage.clearTokens();
      storage.removeItem('rewear_current_user');

      setIsSuccess(true);
      return true;
    } catch (err: unknown) {
      /*
       * Backend trả lỗi qua `GlobalExceptionHandlerMiddleware` với shape
       * { success: false, error: { code: "...", message: "..." } }.
       * Field là `error.message`, KHÔNG phải `error.details` — xem giải thích
       * đầy đủ trong `useLogin.ts`.
       */
      const apiError = err as {
        response?: {
          status?: number;
          data?: {
            message?: string;
            error?: { code?: string; message?: string; details?: string };
            /* Lỗi ModelState: { type, title, status, errors: { "Email": [...] } } */
            errors?: Record<string, string[] | string>;
          };
        };
        message?: string;
      };

      const validationMessages = Object.values(apiError.response?.data?.errors ?? {})
        .flatMap((list) => (Array.isArray(list) ? list : [list]))
        .filter((text): text is string => typeof text === 'string' && text.length > 0);

      const backendMessage =
        apiError.response?.data?.error?.message ??
        (validationMessages.length > 0 ? validationMessages.join(' ') : undefined) ??
        apiError.response?.data?.message;

      const errorMessage =
        backendMessage ||
        apiError.message ||
        'Đăng ký tài khoản thất bại. Vui lòng kiểm tra lại thông tin và thử lại.';

      setError(errorMessage);
      setErrorField(detectErrorField(errorMessage));
      setIsSuccess(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetState = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setErrorField(null);
    setIsSuccess(false);
    setRegisteredUser(null);
  }, []);

  return {
    register,
    isLoading,
    error,
    errorField,
    isSuccess,
    registeredUser,
    resetState,
  };
};

export default useRegister;
