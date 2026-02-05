import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { path: '/cashier', icon: 'point_of_sale', label: 'แคชเชียร์' },
  { path: '/customers', icon: 'people', label: 'ลูกค้า' },
  { path: '/points', icon: 'stars', label: 'คะแนน & ธุรกรรม' },
  { path: '/rewards', icon: 'card_giftcard', label: 'ของรางวัล' },
  { path: '/reports', icon: 'bar_chart', label: 'รายงาน' },
  { path: '/settings', icon: 'settings', label: 'ตั้งค่า' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white">store</span>
          </div>
          <div>
            <h2 className="font-bold text-lg">Jespark</h2>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-600 mb-2">Version 1.0.0</p>
          <p className="text-xs text-gray-500">© 2026 Jespark</p>
        </div>
      </div>
    </aside>
  );
}
