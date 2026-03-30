import { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

interface LogEntry {
  id: number;
  admin_id: number | null;
  admin_email: string;
  action: string;
  category: string;
  target_type: string | null;
  target_id: string | null;
  details: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

const CATEGORIES = [
  { value: '', label: 'ทั้งหมด' },
  { value: 'auth', label: 'เข้าสู่ระบบ' },
  { value: 'users', label: 'ลูกค้า' },
  { value: 'points', label: 'คะแนน' },
  { value: 'rewards', label: 'ของรางวัล' },
  { value: 'redemptions', label: 'การแลก' },
  { value: 'cashier', label: 'แคชเชียร์' },
  { value: 'notifications', label: 'แจ้งเตือน' },
  { value: 'coupons', label: 'คูปอง' },
  { value: 'settings', label: 'ตั้งค่า' },
];

const ACTION_LABELS: Record<string, string> = {
  login_success: 'เข้าสู่ระบบสำเร็จ',
  login_failed: 'เข้าสู่ระบบล้มเหลว',
  add_points: 'เพิ่มคะแนน',
  deduct_points: 'หักคะแนน',
  bulk_add_points: 'เพิ่มคะแนนจำนวนมาก',
  update_points_expiry: 'แก้ไขวันหมดอายุคะแนน',
  update_user: 'แก้ไขข้อมูลลูกค้า',
  delete_user: 'ลบลูกค้า',
  create_reward: 'สร้างของรางวัล',
  update_reward: 'แก้ไขของรางวัล',
  delete_reward: 'ลบของรางวัล',
  redemption_approved: 'อนุมัติการแลก',
  redemption_rejected: 'ปฏิเสธการแลก',
  send_notification: 'ส่งแจ้งเตือน',
  delete_notification: 'ลบแจ้งเตือน',
  create_coupon: 'สร้างคูปอง',
  delete_coupon: 'ลบคูปอง',
  update_setting: 'แก้ไขการตั้งค่า',
  bulk_update_settings: 'แก้ไขการตั้งค่าหลายรายการ',
  cashier_checkout: 'ชำระเงิน (เงินสด)',
  cashier_wallet_pay: 'ชำระเงิน (วอลเล็ต)',
  cashier_checkout_with_points: 'ชำระเงิน (ใช้คะแนน)',
  cashier_refund: 'คืนเงิน',
  system_init: 'เริ่มต้นระบบ',
};

const CATEGORY_COLORS: Record<string, 'primary' | 'success' | 'danger' | 'warning' | 'default'> = {
  auth: 'primary',
  users: 'default',
  points: 'warning',
  rewards: 'success',
  redemptions: 'success',
  cashier: 'primary',
  notifications: 'default',
  coupons: 'warning',
  settings: 'danger',
};

export default function AuditLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [summary, setSummary] = useState<{ todayActions: number; loginAttempts: number; categories: Record<string, number> } | null>(null);

  const limit = 30;
  const token = localStorage.getItem('admin_token');

  useEffect(() => {
    loadLogs();
  }, [page, category]);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/logs/summary`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setSummary(await res.json());
    } catch { /* ignore */ }
  };

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: String(limit), offset: String(page * limit) });
      if (category) params.set('category', category);
      if (search) params.set('action', search);

      const res = await fetch(`${API_BASE}/admin/logs?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    loadLogs();
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
          <p className="text-sm text-slate-500">ประวัติการเข้าสู่ระบบและการกระทำทั้งหมดของ Admin</p>
        </div>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{summary.todayActions}</p>
            <p className="text-sm text-slate-500">การกระทำวันนี้</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-3xl font-bold text-warning">{summary.loginAttempts}</p>
            <p className="text-sm text-slate-500">การเข้าสู่ระบบวันนี้</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-3xl font-bold text-success">{total}</p>
            <p className="text-sm text-slate-500">Logs ทั้งหมด</p>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(0); }}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="ค้นหา action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button onClick={handleSearch} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <span className="material-symbols-outlined text-[18px] align-middle mr-1">search</span>
            ค้นหา
          </button>
        </div>
      </Card>

      {/* Logs table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
            <p className="mt-2">กำลังโหลด...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <span className="material-symbols-outlined text-4xl">event_note</span>
            <p className="mt-2">ไม่พบ Log</p>
            <p className="text-xs mt-1">อาจยังไม่ได้สร้างตาราง admin_logs ใน Supabase</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">เวลา</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Admin</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">หมวด</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">การกระทำ</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">เป้าหมาย</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">IP</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600">รายละเอียด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <>
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">{formatDate(log.created_at)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-medium text-slate-700">{log.admin_email}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={CATEGORY_COLORS[log.category] || 'default'}>
                          {CATEGORIES.find(c => c.value === log.category)?.label || log.category}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-medium ${log.action === 'login_failed' ? 'text-danger' : 'text-slate-700'}`}>
                          {ACTION_LABELS[log.action] || log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {log.target_type && <span>{log.target_type} #{log.target_id}</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400 font-mono">{log.ip_address || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        {log.details && (
                          <button
                            onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px] text-slate-400">
                              {expandedId === log.id ? 'expand_less' : 'expand_more'}
                            </span>
                          </button>
                        )}
                      </td>
                    </tr>
                    {expandedId === log.id && log.details && (
                      <tr key={`${log.id}-details`}>
                        <td colSpan={7} className="px-4 py-3 bg-slate-50">
                          <pre className="text-xs text-slate-600 whitespace-pre-wrap break-all font-mono bg-white rounded-lg p-3 border border-slate-200">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              แสดง {page * limit + 1}–{Math.min((page + 1) * limit, total)} จาก {total} รายการ
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                ก่อนหน้า
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                ถัดไป
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
