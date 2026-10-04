import axiosClient from '../../../services/axiosClient';
import { ApiResponse } from '../../../types/apiResponse.type';
import { RegisterPayload, RegisterResponseData } from '../types/auth.type';

export const registerApi = {
  /*
   * Route của backend: POST /api/Auth/register — xem giải thích ở `login.api.ts`.
   *
   * Chỉ gọi API thật: tài khoản được tạo trong PostgreSQL của backend, không
   * còn kho tài khoản giả lập trong localStorage.
   */
  register: (payload: RegisterPayload): Promise<ApiResponse<RegisterResponseData>> =>
    axiosClient.post<never, ApiResponse<RegisterResponseData>>(
      '/api/Auth/register',
      payload,
      { baseURL: '' },
    ),
};

export default registerApi;
