import React from 'react';

export interface MainLayoutProps {
  children?: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="main-layout">
      <header className="main-header">Marketplace Header</header>
      <main className="main-content">{children}</main>
      <footer className="main-footer">Marketplace Footer</footer>
    </div>
  );
};

export default MainLayout;
