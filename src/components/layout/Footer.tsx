import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <p>&copy; {new Date().getFullYear()} Rewear AI. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
