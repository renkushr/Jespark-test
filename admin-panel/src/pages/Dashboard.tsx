import { useState, useEffect } from 'react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

interface StatItem {
  label: string;
  value: string;
  change: string;
  icon: string;
  accent: string;
  iconBg: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<StatItem[]>([
    { label: 'สมาชิกทั้งหมด', value: '0', change: '+0%', icon: 'people', accent: 'border-l-primary', iconBg: 'bg-primary-50 text-primary' },
    { label: 'ยอดขายวันนี้', value: '฿0', change: '+0%', icon: 'payments', accent: 'border-l-success', iconBg: 'bg-emerald-50 text-success' },
    { label: 'คะแนนที่แจก', value: '0', change: '+0%', icon: 'stars', accent: 'border-l-warning', iconBg: 'bg-amber-50 text-warning' },
    { label: 'ธุรกรรมวันนี้', value: '0', change: '+0%', icon: 'receipt_long', accent: 'border-l-violet-500', iconBg: 'bg-violet-50 text-violet-600' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'}/cashier/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats([
          { label: 'สมาชิกทั้งหมด', value: data.total.customers.toLocaleString(), change: '+12%', icon: 'people', accent: 'border-l-primary', iconBg: 'bg-primary-50 text-primary' },
          { label: 'ยอดขายวันนี้', value: `฿${data.today.revenue.toLocaleString()}`, change: '+8%', icon: 'payments', accent: 'border-l-success', iconBg: 'bg-emerald-50 text-success' },
          { label: 'คะแนนที่แจก', value: data.today.pointsGiven.toLocaleString(), change: '+15%', icon: 'stars', accent: 'border-l-warning', iconBg: 'bg-amber-50 text-warning' },
          { label: 'ธุรกรรมวันนี้', value: data.today.transactions.toLocaleString(), change: '+5%', icon: 'receipt_long', accent: 'border-l-violet-500', iconBg: 'bg-violet-50 text-violet-600' },
        ]);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  const loadRecentActivities = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'}/admin/transactions/recent?limit=10`);
      if (response.ok) {
        const data = await response.json();
        setRecentActivities((data.transactions || []).map((t: any) => ({
          icon: 'shopping_cart',
          user: t.customerName || 'ลูกค้า',
          action: `฿${parseFloat(t.amount).toLocaleString()} · +${t.points} คะแนน`,
          time: new Date(t.createdAt).toLocaleString('th-TH', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }),
          badge: 'primary' as const,
        })));
      }
    } catch (error) { console.error('Error loading activities:', error); }
  };

  useEffect(() => { loadRecentActivities(); }, []);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">ภาพรวมระบบ Jespark Rewards</p>
        </div>
        <Button variant="outline" icon="download" size="sm">
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
            <p className="text-sm text-slate-400">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-5 border-l-4 ${stat.accent}`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.iconBg}`}>
                  <span className="material-symbols-outlined text-[20px]">{stat.icon}</span>
                </div>
                <Badge variant="success" hasDot>{stat.change}</Badge>
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Placeholder */}
        <Card title="ยอดขายรายเดือน" action={
          <select className="text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option>7 วัน</option>
            <option>30 วัน</option>
            <option>90 วัน</option>
          </select>
        }>
          <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
            <div className="text-center">
              <span className="material-symbols-outlined text-slate-300 text-4xl">bar_chart</span>
              <p className="text-sm text-slate-400 mt-2">กราฟจะแสดงที่นี่</p>
            </div>
          </div>
        </Card>

        {/* Recent Activities */}
        <Card title="กิจกรรมล่าสุด" action={
          <Button variant="ghost" size="sm">ดูทั้งหมด</Button>
        }>
          <div className="space-y-1">
            {recentActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <span className="material-symbols-outlined text-slate-300 text-4xl">receipt_long</span>
                <p className="text-sm text-slate-400 mt-2">ยังไม่มีกิจกรรมล่าสุด</p>
              </div>
            ) : recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-slate-500 text-[18px]">{activity.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800">{activity.user}</p>
                  <p className="text-xs text-slate-500 truncate">{activity.action}</p>
                </div>
                <p className="text-[10px] font-medium text-slate-400 shrink-0">{activity.time}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
