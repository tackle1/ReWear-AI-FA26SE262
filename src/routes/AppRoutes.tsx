import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ROUTES from './routes.config';
import AuthLayout from '../layouts/AuthLayout';
import RegisterPage from '../features/auth/pages/RegisterPage';
import LoginPage from '../features/auth/pages/LoginPage';
import BuyerMarketplacePage from '../features/marketplace/pages/BuyerMarketplacePage';
import BuyerProductDetailPage from '../features/marketplace/pages/BuyerProductDetailPage';
import BuyerMessagesPage from '../features/marketplace/pages/BuyerMessagesPage';
import BuyerCheckoutPage from '../features/marketplace/pages/BuyerCheckoutPage';
import BuyerEscrowPaymentPage from '../features/marketplace/pages/BuyerEscrowPaymentPage';
import BuyerEscrowSuccessPage from '../features/marketplace/pages/BuyerEscrowSuccessPage';
import BuyerOrdersPage from '../features/marketplace/pages/BuyerOrdersPage';
import BuyerOrderDetailPage from '../features/marketplace/pages/BuyerOrderDetailPage';
import BuyerWishlistPage from '../features/marketplace/pages/BuyerWishlistPage';
import BuyerAccountPage from '../features/marketplace/pages/BuyerAccountPage';
import SellerDashboardPage from '../features/seller/pages/SellerDashboardPage';
import SellerListingDetailPage from '../features/seller/pages/SellerListingDetailPage';
import ListingCreatePage from '../features/listing/pages/ListingCreatePage';
import ListingFlagPage from '../features/listing/pages/ListingFlagPage';
import ListingPublishPage from '../features/listing/pages/ListingPublishPage';
import SellerSectionPlaceholder from '../features/seller/pages/SellerSectionPlaceholder';
import SellerMyListingsPage from '../features/seller/pages/SellerMyListingsPage';

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
        <Route path={ROUTES.MARKETPLACE.PRODUCT_DETAIL} element={<BuyerProductDetailPage />} />
        {/* ── Danh sách yêu thích (mở từ biểu tượng tim trên thanh điều hướng) ── */}
        <Route path={ROUTES.BUYER.WISHLIST} element={<BuyerWishlistPage />} />
        {/* ── Tài khoản người mua (mở từ breadcrumb "Tài khoản" và menu tài khoản) ── */}
        <Route path={ROUTES.BUYER.ACCOUNT} element={<BuyerAccountPage />} />
        {/* URL cũ của mục "Đơn mua của tôi" — nay hợp nhất vào trang Tài khoản. */}
        <Route
          path={ROUTES.BUYER.PURCHASES}
          element={<Navigate to={ROUTES.BUYER.ACCOUNT} replace />}
        />
        {/* ── Đơn hàng của người mua (mở từ nút "Xem & theo dõi đơn hàng của tôi") ── */}
        <Route path={ROUTES.BUYER.ORDERS} element={<BuyerOrdersPage />} />
        {/* ── Chi tiết đơn hàng (mở từ nút "Xem chi tiết" ở trang Đơn hàng) ── */}
        <Route path={ROUTES.BUYER.ORDER_DETAIL} element={<BuyerOrderDetailPage />} />
        <Route path={ROUTES.BUYER.MESSAGES} element={<BuyerMessagesPage />} />

        {/* ── Xác nhận đơn hàng & Giữ hàng (mở từ nút "Đặt hàng ngay" trong Hộp thư) ── */}
        <Route path={ROUTES.ESCROW.CHECKOUT} element={<BuyerCheckoutPage />} />

        {/* ── Cổng thanh toán VietQR Smart-Escrow (mở từ nút "Thanh toán VietQR Ký quỹ ngay") ── */}
        <Route path={ROUTES.ESCROW.PAYMENT} element={<BuyerEscrowPaymentPage />} />

        {/* ── Thanh toán Escrow thành công (mở từ nút "Tôi đã thanh toán thành công") ── */}
        <Route path={ROUTES.ESCROW.SUCCESS} element={<BuyerEscrowSuccessPage />} />

        {/* ── Tra soát tiến trình ký quỹ theo mã đơn (mở từ nút "Xem chi tiết" ở trang Đơn hàng) ── */}
        <Route path={ROUTES.ESCROW.STATUS} element={<BuyerEscrowSuccessPage />} />

        <Route path={ROUTES.SELLER.DASHBOARD} element={<SellerDashboardPage />} />

        {/*
          Trang CHI TIẾT hồ sơ — mở bằng cách bấm tên sản phẩm hoặc nút hành
          động trong bảng "Tin đăng gần đây". Bảng chỉ hiện tóm tắt; mọi giải
          thích dài (lý do gắn cờ, điểm trừ vì thiếu hóa đơn) nằm ở trang này
          để bảng không bị chữ dồn.
        */}
        <Route
          path={ROUTES.SELLER.LISTING_DETAIL}
          element={<SellerListingDetailPage />}
        />

        {/* ── Seller: Tạo tin đăng mới (từ nút CTA ở Bảng điều khiển) ── */}
        <Route path={ROUTES.LISTING.CREATE} element={<ListingCreatePage />} />

        {/*
          ── Hai trang kết quả sau Bước 05 (thay cho "Bước 06" cũ) ──
          Luồng rẽ theo điểm confidence mà Bước 05 chốt:
            • >= 75%            → Đăng tin (ACTIVE, lên sàn ngay)
            • 50% – <75%        → Gắn cờ (FLAGGED, chờ Admin đối soát)
            • < 50%             → từ chối, đưa người bán về lại Bước 01
        */}
        <Route path={ROUTES.LISTING.FLAG} element={<ListingFlagPage />} />
        <Route path={ROUTES.LISTING.PUBLISH} element={<ListingPublishPage />} />

        {/* ── Seller: các mục trong menu ngang của không gian người bán ── */}
        <Route
          path={ROUTES.SELLER.LISTINGS}
          element={<SellerMyListingsPage />}
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
