export const envConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws',
  vietQrClientId: import.meta.env.VITE_VIETQR_CLIENT_ID || '',
  vietQrApiKey: import.meta.env.VITE_VIETQR_API_KEY || '',
  environment: import.meta.env.VITE_APP_ENV || 'development',
  isProduction: import.meta.env.VITE_APP_ENV === 'production',
  useMockApi: import.meta.env.VITE_USE_MOCK_API !== 'false',
} as const;

export default envConfig;
