import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import ROUTES from '../../../routes/routes.config';
import { logout } from '../../../store/slices/authSlice';
import storage, { tokenStorage } from '../../../utils/storage';
import DashboardSidebar from '../../../components/layout/DashboardSidebar';
import DashboardTopbar from '../../../components/layout/DashboardTopbar';
import DashboardPageHeader from '../../../components/layout/DashboardPageHeader';
import DashboardStats, {
  type DashboardStatItem,
  SELLER_STAT_ICONS,
} from '../../../components/layout/DashboardStats';
import AiVerificationProcess from '../../../components/layout/AiVerificationProcess';
import RecentListingsTable from '../../../components/layout/RecentListingsTable';
import DashboardFooterNote from '../../../components/layout/DashboardFooterNote';
import useSellerDashboard from '../../seller/hooks/useSellerDashboard';
import { clearSellerListings } from '../../seller/services/sellerListingsStore';
import '../../../styles/dashboard/DashboardTheme.css';

/** Định dạng số tiền kiểu Việt Nam, dùng cho thẻ "Tổng giá trị ký gửi". */
const formatVnd = (value: number): string => value.toLocaleString('vi-VN');

export const SellerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeMenu, setActiveMenu] = useState('dashboard');

  /*
   * Toàn bộ số liệu của trang lấy từ hook này — hook đọc kho tin đăng thật của
   * seller đang đăng nhập và ngưỡng kiểm định lấy từ API. Trước đây các con số
   * (24 tin, 96.2%, 18.450.000₫…) được ghi cứng trong component nên mọi seller
   * đều thấy cùng một dữ liệu giống nhau.
   */
  const { rows, overview, isLoading, autoPublishThreshold, thresholdLabel } =
    useSellerDashboard();

  /*
   * Số dư ký quỹ chưa có endpoint đọc từ backend (swagger hiện chỉ có
   * `create`, `premium-brands`, `thresholds`), nên thay vì hiện một số dư bịa,
   * ta tính TỔNG GIÁ TRỊ của các tin đã tạo — đây là số liệu thật, suy ra từ
   * dữ liệu người bán đã nhập.
   */
  const totalListingValue = useMemo(
    () => rows.reduce((sum, row) => sum + (row.price || 0), 0),
    [rows],
  );

  const stats = useMemo<DashboardStatItem[]>(
    () => [
      {
        key: 'active',
        label: 'Tổng tin đã tạo',
        value: String(overview.total),
        icon: SELLER_STAT_ICONS.active,
        footPill: { text: `${overview.verified} đã xác thực` },
        footText: `• ${overview.review} chờ kiểm tra`,
      },
      {
        key: 'ai-rate',
        label: 'Tỷ lệ đạt chuẩn xác thực AI',
        value:
          overview.verificationRate === null
            ? '—'
            : `${overview.verificationRate}%`,
        icon: SELLER_STAT_ICONS.aiRate,
        footPill: { text: `Ngưỡng ${thresholdLabel}`, dot: true },
        footText:
          overview.averageScore === null
            ? 'Chưa có điểm để đánh giá'
            : `Điểm TB ${overview.averageScore}%`,
      },
      {
        key: 'escrow',
        label: 'Tổng giá trị tin đã tạo',
        value: formatVnd(totalListingValue),
        unit: '₫',
        icon: SELLER_STAT_ICONS.escrow,
        footLead: '',
        footText: `${overview.total} tin đang theo dõi`,
      },
      {
        key: 'queue',
        label: 'Chờ kiểm tra / bị từ chối',
        value: String(overview.review + overview.rejected),
        icon: SELLER_STAT_ICONS.queue,
        footPill: {
          text: overview.rejected > 0 ? 'Có hồ sơ bị từ chối' : 'Chờ chuyên viên',
          dot: true,
        },
        footText: `${overview.review} chờ duyệt • ${overview.rejected} từ chối`,
      },
    ],
    [overview, totalListingValue, thresholdLabel],
  );

  const handleLogout = useCallback(() => {
    /*
     * Xóa kho tin đăng của seller khi đăng xuất. Chỉ xóa kho của chính mình
     * (theo userId) để không ảnh hưởng tài khoản khác trên cùng trình duyệt.
     */
    const currentUserId = storage.getItem<{ userId?: string }>('rewear_current_user')?.userId;
    clearSellerListings(currentUserId ?? null);

    storage.removeItem('rewear_current_user');
    tokenStorage.clearTokens();
    dispatch(logout());
    navigate(ROUTES.AUTH.LOGIN, { replace: true });
  }, [dispatch, navigate]);

  return (
    <div className="seller-app rw-dashboard-theme">
      <DashboardSidebar activeKey={activeMenu} onSelect={(key) => setActiveMenu(key)} />
      <section className="seller-shell">
        <DashboardTopbar onLogout={handleLogout} />
        <main className="seller-main">
          <DashboardPageHeader onCreate={() => navigate(ROUTES.LISTING.CREATE)} />
          <DashboardStats items={stats} />
          <AiVerificationProcess />
          <RecentListingsTable
            rows={rows}
            isLoading={isLoading}
            autoPublishThreshold={autoPublishThreshold}
          />
          <DashboardFooterNote />
        </main>
      </section>
    </div>
  );
};

export default SellerDashboardPage;
