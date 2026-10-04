export const envConfig = {
  /**
   * Gốc API. Mặc định RỖNG để mọi request dùng URL tương đối và đi qua proxy
   * của Vite dev server (xem `vite.config.ts`) — nhờ vậy không gặp lỗi chứng
   * chỉ HTTPS self-signed của backend .NET.
   *
   * Không đặt sẵn host/port khác: backend .NET chạy ở `https://localhost:7289`,
   * còn `localhost:8000/api/v1` là host không tồn tại nên mọi request tới đó
   * đều thất bại.
   */
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws',
  vietQrClientId: import.meta.env.VITE_VIETQR_CLIENT_ID || '',
  vietQrApiKey: import.meta.env.VITE_VIETQR_API_KEY || '',
  environment: import.meta.env.VITE_APP_ENV || 'development',
  isProduction: import.meta.env.VITE_APP_ENV === 'production',
} as const;

export default envConfig;
