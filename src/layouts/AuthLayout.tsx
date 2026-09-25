import React from 'react';

export interface AuthLayoutProps {
  children?: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="rewear-auth-root">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .rewear-auth-root {
          min-height: 100vh;
          width: 100%;
          background-color: #F4F6FB;
          display: flex;
          flex-direction: column;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #0F172A;
          -webkit-font-smoothing: antialiased;
        }

        /* Top Header */
        .rewear-top-nav {
          height: 64px;
          background-color: #FFFFFF;
          border-bottom: 1px solid #E5E9F2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 48px;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .nav-logo-group {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }

        .nav-links-group {
          display: flex;
          align-items: center;
          gap: 28px;
        }

        .nav-link-item {
          font-size: 13.5px;
          color: #475569;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.15s ease;
        }

        .nav-link-item:hover {
          color: #0F172A;
        }

        .nav-link-item.active {
          color: #0F172A;
          font-weight: 600;
        }

        .nav-actions-group {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .lang-selector {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #334155;
          font-weight: 500;
          cursor: pointer;
        }

        .user-avatar-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: #000000;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: none;
        }

        /* Main Content Shell */
        .rewear-main-content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 32px;
          max-width: 1320px;
          margin: 0 auto;
          width: 100%;
        }

        /* Footer */
        .rewear-bottom-footer {
          height: 56px;
          border-top: 1px solid #E5E9F2;
          background-color: transparent;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 48px;
          font-size: 12.5px;
          color: #64748B;
        }

        @media (max-width: 1024px) {
          .rewear-top-nav {
            padding: 0 20px;
          }
          .rewear-bottom-footer {
            padding: 0 20px;
            flex-direction: column;
            height: auto;
            gap: 8px;
            padding-top: 16px;
            padding-bottom: 16px;
            text-align: center;
          }
          .rewear-main-content {
            padding: 20px 12px;
          }
          .nav-links-group {
            display: none;
          }
        }
      `}</style>

      {/* Global Navigation Bar */}
      <header className="rewear-top-nav">
        <a href="/" className="nav-logo-group">
          {/* ReWear logo mark */}
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '9px',
              backgroundColor: '#11182B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 5 19 19" stroke="#1ABC88" strokeWidth="4" strokeLinecap="round" />
              <path d="M5 19 19 5" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" />
              <circle cx="12" cy="12" r="3.2" fill="#FFFFFF" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
              ReWear AI
            </div>
            <div
              style={{
                fontSize: '9px',
                fontWeight: 700,
                color: '#64748B',
                letterSpacing: '0.12em',
                lineHeight: 1.1,
              }}
            >
              FORENSIC RESALE
            </div>
          </div>
        </a>

        <nav className="nav-links-group">
          <a href="/login" className="nav-link-item">Sign In</a>
          <a href="/register" className="nav-link-item active">Create Account</a>
          <a href="/custodial" className="nav-link-item">Custodial Protocol</a>
        </nav>

        <div className="nav-actions-group">
          <div className="lang-selector">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span>EN (SG)</span>
          </div>

          <button className="user-avatar-btn" aria-label="User Account">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Center Body View */}
      <main className="rewear-main-content">
        {children}
      </main>

      {/* Global Bottom Footer */}
      <footer className="rewear-bottom-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>Programmatic Escrow Infrastructure • Precision Machine Vision System</span>
        </div>
        <div>
          &copy; 2026 ReWear AI Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
