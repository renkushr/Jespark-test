import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onLogout?: () => void;
}

const menuItems = [
  { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { path: '/cashier', icon: 'point_of_sale', label: 'แคชเชียร์' },
  { path: '/slip-log', icon: 'receipt_long', label: 'ประวัติสลิป' },
  { path: '/receipt-scanner', icon: 'scan', label: 'อ่านใบเสร็จ' },
  { path: '/customers', icon: 'people', label: 'ลูกค้า' },
  { path: '/points', icon: 'stars', label: 'คะแนน' },
  { path: '/rewards', icon: 'card_giftcard', label: 'ของรางวัล' },
  { path: '/redemptions', icon: 'redeem', label: 'การแลก' },
  { path: '/coupons', icon: 'confirmation_number', label: 'คูปอง' },
  { path: '/notifications', icon: 'notifications', label: 'แจ้งเตือน' },
  { path: '/reports', icon: 'bar_chart', label: 'รายงาน' },
  { path: '/settings', icon: 'settings', label: 'ตั้งค่า' },
];

export default function Sidebar({ isOpen = false, onClose, onLogout }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-slate-200 flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Brand */}
        <div className="px-6 h-16 flex items-center gap-3 border-b border-slate-100 shrink-0">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white text-[20px]">store</span>
          </div>
          <div>
            <h2 className="font-black text-slate-900 leading-tight">Jespark</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Admin Panel</p>
          </div>
          {/* Mobile close */}
          <button onClick={onClose} className="ml-auto p-1 hover:bg-slate-100 rounded-lg lg:hidden">
            <span className="material-symbols-outlined text-slate-400">close</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto no-scrollbar">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 mb-2">เมนูหลัก</p>
          <ul className="space-y-0.5">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
                      isActive
                        ? 'bg-primary text-white font-bold shadow-md shadow-primary/20'
                        : 'text-slate-600 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[20px] ${isActive ? '' : 'text-slate-400'}`} style={isActive ? { fontVariationSettings: "'FILL' 1, 'wght' 500" } : {}}>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 shrink-0 space-y-2">
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-danger hover:bg-red-50 font-medium transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span>ออกจากระบบ</span>
            </button>
          )}
          <div className="bg-slate-50 rounded-lg px-3 py-2">
            <p className="text-[10px] text-slate-400">v1.0.0 · © 2026 Jespark</p>
          </div>
        </div>
      </aside>
    </>
  );
}
