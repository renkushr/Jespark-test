
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../src/api/client';

interface Stats {
  today: {
    transactions: number;
    revenue: number;
    pointsGiven: number;
    customers: number;
  };
  total: {
    transactions: number;
    customers: number;
  };
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check admin token
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }

    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await apiClient.getCashierStats();
      setStats(response);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <span className="material-symbols-outlined text-6xl text-primary animate-spin">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-12 bg-dark-green rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-2xl">admin_panel_settings</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-dark-green">Admin Dashboard</h1>
              <p className="text-xs text-gray-500">Jespark Rewards Management</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl font-bold hover:brightness-110 transition-all"
          >
            <span className="material-symbols-outlined">logout</span>
            ออกจากระบบ
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="size-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-green-500 text-2xl">payments</span>
              </div>
              <span className="text-xs font-bold text-gray-500">วันนี้</span>
            </div>
            <div className="text-3xl font-black text-dark-green mb-1">
              ฿{stats?.today.revenue.toLocaleString() || 0}
            </div>
            <div className="text-sm text-gray-500 font-bold">ยอดขายวันนี้</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="size-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-500 text-2xl">receipt_long</span>
              </div>
              <span className="text-xs font-bold text-gray-500">วันนี้</span>
            </div>
            <div className="text-3xl font-black text-dark-green mb-1">
              {stats?.today.transactions || 0}
            </div>
            <div className="text-sm text-gray-500 font-bold">ธุรกรรมวันนี้</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="size-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-purple-500 text-2xl">stars</span>
              </div>
              <span className="text-xs font-bold text-gray-500">วันนี้</span>
            </div>
            <div className="text-3xl font-black text-dark-green mb-1">
              {stats?.today.pointsGiven.toLocaleString() || 0}
            </div>
            <div className="text-sm text-gray-500 font-bold">คะแนนที่แจก</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="size-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-orange-500 text-2xl">group</span>
              </div>
              <span className="text-xs font-bold text-gray-500">ทั้งหมด</span>
            </div>
            <div className="text-3xl font-black text-dark-green mb-1">
              {stats?.total.customers || 0}
            </div>
            <div className="text-sm text-gray-500 font-bold">สมาชิกทั้งหมด</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-black text-dark-green mb-6">เมนูหลัก</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/cashier')}
              className="p-6 bg-gradient-to-br from-primary to-green-600 rounded-2xl shadow-lg hover:shadow-xl transition-all flex flex-col items-center gap-3"
            >
              <span className="material-symbols-outlined text-white text-4xl">point_of_sale</span>
              <span className="text-white font-black">ระบบแคชเชียร์</span>
            </button>

            <button
              onClick={() => navigate('/admin/reports')}
              className="p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-primary transition-all flex flex-col items-center gap-3"
            >
              <span className="material-symbols-outlined text-dark-green text-4xl">analytics</span>
              <span className="text-dark-green font-black">รีพอร์ต</span>
            </button>

            <button
              onClick={() => navigate('/admin/customers')}
              className="p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-primary transition-all flex flex-col items-center gap-3"
            >
              <span className="material-symbols-outlined text-dark-green text-4xl">group</span>
              <span className="text-dark-green font-black">จัดการลูกค้า</span>
            </button>

            <button
              onClick={() => navigate('/admin/settings')}
              className="p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-primary transition-all flex flex-col items-center gap-3"
            >
              <span className="material-symbols-outlined text-dark-green text-4xl">settings</span>
              <span className="text-dark-green font-black">ตั้งค่า</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-black text-dark-green mb-6">กิจกรรมล่าสุด</h2>
          <div className="text-center py-8 text-gray-400">
            <span className="material-symbols-outlined text-6xl mb-2">inbox</span>
            <p className="font-bold">ยังไม่มีข้อมูล</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
