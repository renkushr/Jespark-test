
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'หน้าแรก', icon: 'home', path: '/' },
    { label: 'กระเป๋าเงิน', icon: 'wallet', path: '/wallet' },
    { label: 'สแกน', icon: 'qr_code_scanner', path: '/scan', isCenter: true },
    { label: 'สิทธิพิเศษ', icon: 'local_offer', path: '/rewards' },
    { label: 'โปรไฟล์', icon: 'person', path: '/profile' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-md border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50">
      {navItems.map((item) => (
        item.isCenter ? (
          <div key={item.path} className="relative -top-6">
            <button 
              onClick={() => navigate(item.path)}
              className="bg-primary size-14 rounded-full flex items-center justify-center shadow-lg shadow-primary/40 border-4 border-white transform active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined text-dark-green text-3xl font-bold">{item.icon}</span>
            </button>
          </div>
        ) : (
          <button 
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 transition-colors ${isActive(item.path) ? 'text-primary' : 'text-gray-400'}`}
          >
            <span className={`material-symbols-outlined ${isActive(item.path) ? 'fill-1' : ''}`} style={{ fontVariationSettings: isActive(item.path) ? "'FILL' 1" : "" }}>
              {item.icon}
            </span>
            <span className="text-[10px] font-bold">{item.label}</span>
          </button>
        )
      ))}
      <div className="fixed bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/10 rounded-full z-[60]"></div>
    </nav>
  );
};

export default Navbar;