import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [stats, setStats] = useState([
    { label: 'สมาชิกทั้งหมด', value: '0', change: '+0%', icon: 'people', color: 'bg-blue-500' },
    { label: 'ยอดขายวันนี้', value: '฿0', change: '+0%', icon: 'payments', color: 'bg-green-500' },
    { label: 'คะแนนที่แจก', value: '0', change: '+0%', icon: 'stars', color: 'bg-yellow-500' },
    { label: 'ของรางวัลที่แลก', value: '0', change: '+0%', icon: 'card_giftcard', color: 'bg-purple-500' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'}/cashier/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats([
          { label: 'สมาชิกทั้งหมด', value: data.total.customers.toLocaleString(), change: '+12%', icon: 'people', color: 'bg-blue-500' },
          { label: 'ยอดขายวันนี้', value: `฿${data.today.revenue.toLocaleString()}`, change: '+8%', icon: 'payments', color: 'bg-green-500' },
          { label: 'คะแนนที่แจก', value: data.today.pointsGiven.toLocaleString(), change: '+15%', icon: 'stars', color: 'bg-yellow-500' },
          { label: 'ของรางวัลที่แลก', value: '0', change: '+5%', icon: 'card_giftcard', color: 'bg-purple-500' },
        ]);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const recentActivities = [
    { type: 'new_member', user: 'John Doe', action: 'สมัครสมาชิกใหม่', time: '5 นาทีที่แล้ว' },
    { type: 'purchase', user: 'Jane Smith', action: 'ซื้อสินค้า ฿1,250', time: '15 นาทีที่แล้ว' },
    { type: 'redeem', user: 'Bob Johnson', action: 'แลก Starbucks Coffee', time: '30 นาทีที่แล้ว' },
    { type: 'points', user: 'Alice Brown', action: 'ได้รับ 150 คะแนน', time: '1 ชั่วโมงที่แล้ว' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-dark-green transition-colors">
          <span className="material-symbols-outlined">download</span>
          Export Report
        </button>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                <span className="material-symbols-outlined text-white">{stat.icon}</span>
              </div>
              <span className="text-green-600 text-sm font-semibold">{stat.change}</span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">{stat.label}</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
          </div>
        ))}
      </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Placeholder */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">ยอดขายรายเดือน</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-400">Chart will be here</p>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">กิจกรรมล่าสุด</h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-gray-600 text-sm">person</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{activity.user}</p>
                  <p className="text-sm text-gray-600">{activity.action}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
