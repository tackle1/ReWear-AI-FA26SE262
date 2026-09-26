import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ROUTES from './routes.config';
import AuthLayout from '../layouts/AuthLayout';
import RegisterPage from '../features/auth/pages/RegisterPage';
import LoginPage from '../features/auth/pages/LoginPage';
import BuyerMarketplacePage from '../features/marketplace/pages/BuyerMarketplacePage';
import BuyerSectionPlaceholder from '../features/marketplace/pages/BuyerSectionPlaceholder';
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

        {/* ── Buyer: sàn giao dịch (màn hình sau đăng nhập) ── */}
        <Route path={ROUTES.MARKETPLACE.ROOT} element={<BuyerMarketplacePage />} />
        <Route
          path={ROUTES.BUYER.WISHLIST}
          element={
            <BuyerSectionPlaceholder
              title="Danh sách yêu thích"
              description="Các sản phẩm đã xác thực AI mà bạn đang theo dõi sẽ được tổng hợp tại đây."
              activeNavKey="explore"
              icon="💙"
            />
          }
        />
        <Route
          path={ROUTES.BUYER.PURCHASES}
          element={
            <BuyerSectionPlaceholder
              title="Đơn mua của tôi"
              description="Theo dõi tiến trình ký quỹ, xác nhận nhận hàng và mở khiếu nại trong 7 ngày."
              activeNavKey="purchases"
              icon="🛍️"
            />
          }
        />
        <Route
          path={ROUTES.BUYER.ORDERS}
          element={
            <BuyerSectionPlaceholder
              title="Đơn hàng &amp; Ký quỹ"
              description="Lịch sử đơn hàng và trạng thái giải ngân escrow cho từng giao dịch."
              activeNavKey="orders"
              icon="📦"
            />
          }
        />
        <Route
          path={ROUTES.BUYER.MESSAGES}
          element={
            <BuyerSectionPlaceholder
              title="Tin nhắn"
              description="Tin nhắn với người bán và hỗ trợ khách hàng."
              activeNavKey="messages"
              icon="🧾"
            />
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
