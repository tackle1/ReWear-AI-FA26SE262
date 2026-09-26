import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import sellerAvatar from '../../../assets/images/seller-avatar.png';
import ROUTES from '../../../routes/routes.config';
import { logout } from '../../../store/slices/authSlice';
import storage, { tokenStorage } from '../../../utils/storage';
import DashboardSidebar from '../../../components/layout/DashboardSidebar';
import DashboardTopbar from '../../../components/layout/DashboardTopbar';
import DashboardPageHeader from '../../../components/layout/DashboardPageHeader';
import DashboardStats from '../../../components/layout/DashboardStats';
import AiVerificationProcess from '../../../components/layout/AiVerificationProcess';
import RecentListingsTable from '../../../components/layout/RecentListingsTable';
import DashboardFooterNote from '../../../components/layout/DashboardFooterNote';
import '../../../styles/dashboard/DashboardTheme.css';

export const SellerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const handleLogout = () => {
    storage.removeItem('rewear_current_user');
    tokenStorage.clearTokens();
    dispatch(logout());
    navigate(ROUTES.AUTH.LOGIN, { replace: true });
  };

  return (
    <div className="seller-app rw-dashboard-theme">
      <DashboardSidebar activeKey={activeMenu} onSelect={(key) => setActiveMenu(key)} />
      <section className="seller-shell">
        <DashboardTopbar avatarSrc={sellerAvatar} onLogout={handleLogout} />
        <main className="seller-main">
          <DashboardPageHeader onCreate={() => navigate(ROUTES.LISTING.CREATE)} />
          <DashboardStats />
          <AiVerificationProcess />
          <RecentListingsTable />
          <DashboardFooterNote />
        </main>
      </section>
    </div>
  );
};

export default SellerDashboardPage;
