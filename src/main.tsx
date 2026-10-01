import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import AppRoutes from './routes/AppRoutes';
import { purgeLegacyMockData } from './utils/purgeLegacyData';
import './styles/global.css';

// Dọn dữ liệu mock còn sót trong localStorage TRƯỚC khi app render, để không còn
// tài khoản giả / token giả / mật khẩu plaintext trên máu thành viên.
purgeLegacyMockData();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  </React.StrictMode>
);
