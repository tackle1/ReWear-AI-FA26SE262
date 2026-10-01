import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': decodeURIComponent(new URL('./src', import.meta.url).pathname).replace(/^\/([A-Za-z]:\/)/, '$1'),
    },
  },
  server: {
    port: 5173,
    open: false,
    proxy: {
      // Backend .NET chạy HTTPS với chứng chỉ tự ký, proxy qua dev server
      // để tránh lỗi chứng chỉ và CORS khi gọi trực tiếp từ trình duyệt.
      // Toàn bộ API tin đăng đã gom về /api/ListingsExample/* (đã bỏ /api/v1/*):
      // create, photo-quality, premium-brands, thresholds.
      '/api/ListingsExample': {
        target: 'https://localhost:7289',
        changeOrigin: true,
        secure: false,
      },
      // Ảnh seller đã lưu trong wwwroot/uploads của backend.
      '/api/AiVerificationExample': {
        target: 'https://localhost:7289',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'https://localhost:7289',
        changeOrigin: true,
        secure: false,
      },
      // Auth (đăng ký / đăng nhập) của backend nằm dưới /api/Auth/*.
      // Route đã bỏ "v1" và viết hoa "Auth" — khớp AuthController.Route("api/Auth").
      // Proxy để axios gọi bằng URL tương đối, tránh lỗi chứng chỉ HTTPS self-signed.
      '/api/Auth': {
        target: 'https://localhost:7289',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
