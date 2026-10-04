import axiosClient from '../../../services/axiosClient';
import { ApiResponse } from '../../../types/apiResponse.type';
import { LoginPayload, LoginResponseData } from '../types/auth.type';

export const loginApi = {
  /*
   * Route của backend: POST /api/Auth/login (bỏ "v1", "Auth" viết hoa — khớp
   * `AuthController.Route("api/Auth")`).
   *
   * `baseURL: ''` để đi qua proxy của Vite dev server, giống các endpoint
   * `/api/ListingsExample/*` (xem `listing.api.ts`) — tránh lỗi chứng chỉ
   * HTTPS self-signed của backend .NET.
   *
   * Chỉ gọi API thật, không còn nhánh mock: dữ liệu đăng nhập giờ luôn đến từ
   * backend .NET + PostgreSQL.
   */
  login: (payload: LoginPayload): Promise<ApiResponse<LoginResponseData>> =>
    axiosClient.post<never, ApiResponse<LoginResponseData>>(
      '/api/Auth/login',
      payload,
      { baseURL: '' },
    ),
};

export default loginApi;
