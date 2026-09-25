import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ROUTES from './routes.config';
import AuthLayout from '../layouts/AuthLayout';
import RegisterPage from '../features/auth/pages/RegisterPage';
import LoginPage from '../features/auth/pages/LoginPage';
import SellerDashboardPage from '../features/seller/pages/SellerDashboardPage';
import ListingCreatePage from '../features/listing/pages/ListingCreatePage';
import SellerSectionPlaceholder from '../features/seller/pages/SellerSectionPlaceholder';

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Auth Routes (both use AuthLayout) ── */}
        <Route
          path={ROUTES.AUTH.REGISTER}
          element={
            <AuthLayout>
              <RegisterPage />
            </AuthLayout>
          }
        />

        <Route
          path={ROUTES.AUTH.LOGIN}
          element={
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          }
        />

        {/* Placeholder for protected marketplace */}
        <Route
          path={ROUTES.MARKETPLACE.ROOT}
          element={
            <div
              style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#F4F6FB',
                fontFamily: 'system-ui, sans-serif',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '48px',
                  borderRadius: '20px',
                  textAlign: 'center',
                  maxWidth: '440px',
                  boxShadow: '0 8px 32px -8px rgba(15, 23, 42, 0.08)',
                  border: '1px solid #E5E9F2',
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>✅</div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                  Đăng nhập thành công!
                </h2>
                <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px', lineHeight: 1.5 }}>
                  Chào mừng bạn đến với ReWear AI.<br />
                  Marketplace đang được triển khai.
                </p>
                <a
                  href={ROUTES.AUTH.LOGIN}
                  style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    borderRadius: '10px',
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    textDecoration: 'none',
                    fontSize: '14px',
                  }}
                >
                  ← Quay lại Đăng nhập
                </a>
              </div>
            </div>
          }
        />

        <Route path={ROUTES.SELLER.DASHBOARD} element={<SellerDashboardPage />} />

        {/* ── Seller: Tạo tin đăng mới (từ nút CTA ở Bảng điều khiển) ── */}
        <Route path={ROUTES.LISTING.CREATE} element={<ListingCreatePage />} />

        {/* ── Seller: các mục trong menu ngang của không gian người bán ── */}
        <Route
          path={ROUTES.SELLER.LISTINGS}
          element={<SellerSectionPlaceholder title="Tin đăng của tôi" activeKey="listings" />}
        />
        <Route
          path={ROUTES.SELLER.ORDERS}
          element={<SellerSectionPlaceholder title="Đơn hàng & Ký quỹ" activeKey="orders" />}
        />
        <Route
          path={ROUTES.SELLER.VERIFICATION_DOCS}
          element={
            <SellerSectionPlaceholder title="Tài liệu kiểm định" activeKey="docs" />
          }
        />

        {/* Default redirects */}
        <Route path="/" element={<Navigate to={ROUTES.AUTH.LOGIN} replace />} />
        <Route path="*" element={<Navigate to={ROUTES.AUTH.LOGIN} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
