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
  isSuccess: boolean;
  registeredUser: RegisterResponseData | null;
  resetState: () => void;
}

export const useRegister = (): UseRegisterReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [registeredUser, setRegisteredUser] = useState<RegisterResponseData | null>(null);

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
        'Đăng ký tài khoản thất bại. Vui lòng kiểm tra lại thông tin và thử lại.';

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
    setRegisteredUser(null);
  }, []);

  return {
    register,
    isLoading,
    error,
    isSuccess,
    registeredUser,
    resetState,
  };
};

export default useRegister;
