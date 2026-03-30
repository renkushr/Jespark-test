import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatItem[]>([
    { label: 'สมาชิกทั้งหมด', value: '0', change: '+0%', icon: 'people', accent: 'border-l-primary', iconBg: 'bg-primary-50 text-primary' },
    { label: 'ยอดขายวันนี้', value: '฿0', change: '+0%', icon: 'payments', accent: 'border-l-success', iconBg: 'bg-emerald-50 text-success' },
    { label: 'คะแนนที่แจก', value: '0', change: '+0%', icon: 'stars', accent: 'border-l-warning', iconBg: 'bg-amber-50 text-warning' },
    { label: 'ธุรกรรมวันนี้', value: '0', change: '+0%', icon: 'receipt_long', accent: 'border-l-violet-500', iconBg: 'bg-violet-50 text-violet-600' },
  ]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartPeriod, setChartPeriod] = useState('7');
  const [chartLoading, setChartLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const token = localStorage.getItem('admin_token');
  const authHeaders: HeadersInit = { 'Authorization': `Bearer ${token}` };

  const loadStats = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'}/cashier/stats`, { headers: authHeaders });
      if (response.ok) {
        const data = await response.json();
        setStats([
          { label: 'สมาชิกทั้งหมด', value: data.total.customers.toLocaleString(), change: '', icon: 'people', accent: 'border-l-primary', iconBg: 'bg-primary-50 text-primary' },
          { label: 'ยอดขายวันนี้', value: `฿${data.today.revenue.toLocaleString()}`, change: '', icon: 'payments', accent: 'border-l-success', iconBg: 'bg-emerald-50 text-success' },
          { label: 'คะแนนที่แจก', value: data.today.pointsGiven.toLocaleString(), change: '', icon: 'stars', accent: 'border-l-warning', iconBg: 'bg-amber-50 text-warning' },
          { label: 'ธุรกรรมวันนี้', value: data.today.transactions.toLocaleString(), change: '', icon: 'receipt_long', accent: 'border-l-violet-500', iconBg: 'bg-violet-50 text-violet-600' },
        ]);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChartData = async (days: string) => {
    try {
      setChartLoading(true);
      const startDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'}/admin/reports/sales?startDate=${startDate}&endDate=${endDate}&groupBy=day`, { headers: authHeaders });
      if (response.ok) {
        const data = await response.json();
        setChartData((data.data || []).map((d: any) => ({
          date: new Date(d.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
          sales: d.totalSales || 0,
          transactions: d.totalTransactions || 0,
        })));
      }
    } catch (error) {
      console.error('Error loading chart:', error);
    } finally {
      setChartLoading(false);
    }
  };

  useEffect(() => { loadChartData(chartPeriod); }, [chartPeriod]);

  const handleExport = () => {
    if (chartData.length === 0) return;
    const csv = ['วันที่,ยอดขาย,จำนวนรายการ', ...chartData.map(d => `${d.date},${d.sales},${d.transactions}`)].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jespark-report-${chartPeriod}days.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadRecentActivities = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'}/admin/transactions/recent?limit=10`, { headers: authHeaders });
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
        <Button variant="outline" icon="download" size="sm" onClick={handleExport}>
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
                {stat.change && <Badge variant="success" hasDot>{stat.change}</Badge>}
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales chart */}
        <Card title="ยอดขายรายเดือน" action={
          <select
            className="text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={chartPeriod}
            onChange={(e) => setChartPeriod(e.target.value)}
          >
            <option value="7">7 วัน</option>
            <option value="30">30 วัน</option>
            <option value="90">90 วัน</option>
          </select>
        }>
          {chartLoading ? (
            <div className="h-64 flex flex-col items-center justify-center bg-slate-50 rounded-lg">
              <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
              <p className="text-sm text-slate-400 mt-2">กำลังโหลดข้อมูล...</p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-400">ยังไม่มีข้อมูล</p>
            </div>
          ) : (
            <div className="h-64 w-full min-h-[256px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [value.toLocaleString('th-TH'), 'ยอดขาย']}
                  />
                  <Bar dataKey="sales" fill="#003399" radius={[4, 4, 0, 0]} name="ยอดขาย" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Recent Activities */}
        <Card title="กิจกรรมล่าสุด" action={
          <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>ดูทั้งหมด</Button>
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
