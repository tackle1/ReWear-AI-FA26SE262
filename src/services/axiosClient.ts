import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import envConfig from '../config/env.config';
import { tokenStorage } from '../utils/storage';

export const axiosClient: AxiosInstance = axios.create({
  baseURL: envConfig.apiBaseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  async (error: AxiosError) => {
    // 401 = access token thiếu / hết hạn.
    //
    // Backend CHƯA có endpoint refresh token (xem `auth.api.ts`: chỉ có
    // login/register/verify-otp), nên không thể gia hạn ngầm. Trước đây nhánh này
    // để trống với comment "placeholder", khiến Bước 04 kẹt ở thông báo 401 vĩnh
    // viễn dù người dùng đã đăng nhập ở tab khác. Nay dọn token và đưa về
    // trang đăng nhập để họ lấy token mới rồi xác thực lại.
    if (error.response?.status === 401) {
      tokenStorage.clearTokens();
      // Bỏ qua nếu đang ở trang đăng nhập/đăng ký, tránh vòng lặp chuyển hướng
      // khi chính các endpoint đó trả 401.
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
