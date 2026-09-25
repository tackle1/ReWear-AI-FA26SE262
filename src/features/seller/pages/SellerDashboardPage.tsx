import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import sellerAvatar from '../../../assets/images/seller-avatar.png';
import ROUTES from '../../../routes/routes.config';
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
  const [activeMenu, setActiveMenu] = useState('dashboard');
  return (
    <div className="seller-app rw-dashboard-theme">
      <DashboardSidebar activeKey={activeMenu} onSelect={(key) => setActiveMenu(key)} />
      <section className="seller-shell">
        <DashboardTopbar avatarSrc={sellerAvatar} />
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
