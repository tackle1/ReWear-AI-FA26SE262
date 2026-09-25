import { useState, useCallback } from 'react';
import { registerApi } from '../api/register.api';
import { RegisterFormData, RegisterPayload, RegisterResponseData } from '../types/auth.type';

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
      const payload: RegisterPayload = {
        name: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
      };

      const response = await registerApi.register(payload);

      if (response && response.data) {
        setRegisteredUser(response.data);
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
