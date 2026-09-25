import React from 'react';

export interface AdminLayoutProps {
  children?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">Admin Navigation</aside>
      <div className="admin-body">
        <header className="admin-header">Admin Header</header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
