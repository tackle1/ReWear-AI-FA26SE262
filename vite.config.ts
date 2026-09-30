import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: false,
    proxy: {
      // Backend .NET chạy HTTPS với chứng chỉ tự ký, proxy qua dev server
      // để tránh lỗi chứng chỉ và CORS khi gọi trực tiếp từ trình duyệt.
      '/api/ListingsExample': {
        target: 'https://localhost:7289',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
