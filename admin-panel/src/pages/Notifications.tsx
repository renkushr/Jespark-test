import { useState, useEffect } from 'react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendForm, setSendForm] = useState({ title: '', message: '', type: 'info', userIds: '' });
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const token = localStorage.getItem('admin_token');
  const authHeaders: HeadersInit = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  useEffect(() => { loadNotifications(); }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/notifications?limit=100`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setNotifications(data.notifications || []); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const showSuccess = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };
  const showError = (msg: string) => { setErrorMsg(msg); setTimeout(() => setErrorMsg(''), 3000); };

  const handleSend = async () => {
    if (!sendForm.title || !sendForm.message) { showError('กรุณากรอกหัวข้อและข้อความ'); return; }
    setSending(true);
    try {
      const userIds = sendForm.userIds ? sendForm.userIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [];
      const res = await fetch(`${API_BASE}/admin/notifications/send`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ title: sendForm.title, message: sendForm.message, type: sendForm.type, userIds }),
      });
      if (res.ok) {
        const data = await res.json();
        showSuccess(`ส่งแจ้งเตือนสำเร็จ ${data.count} รายการ`);
        setShowSendModal(false); setSendForm({ title: '', message: '', type: 'info', userIds: '' });
        loadNotifications();
      } else { const d = await res.json(); showError(d.error || 'เกิดข้อผิดพลาด'); }
    } catch (err) { showError('เกิดข้อผิดพลาด'); }
    finally { setSending(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('ลบการแจ้งเตือนนี้?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/notifications/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { showSuccess('ลบสำเร็จ'); loadNotifications(); }
    } catch (err) { showError('เกิดข้อผิดพลาด'); }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'success': return <Badge variant="success">สำเร็จ</Badge>;
      case 'warning': return <Badge variant="warning">เตือน</Badge>;
      case 'error': return <Badge variant="danger">ข้อผิดพลาด</Badge>;
      default: return <Badge variant="info">ข้อมูล</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {successMsg && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-success text-white rounded-xl shadow-lg animate-slideInRight">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span className="text-sm font-bold">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-danger text-white rounded-xl shadow-lg animate-slideInRight">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span className="text-sm font-bold">{errorMsg}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">การแจ้งเตือน</h1>
          <p className="text-sm text-slate-500 mt-0.5">ดูและส่งการแจ้งเตือนถึงลูกค้า</p>
        </div>
        <Button icon="send" size="sm" onClick={() => setShowSendModal(true)}>ส่งแจ้งเตือน</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'ทั้งหมด', value: notifications.length, icon: 'notifications', color: 'border-l-primary', iconBg: 'bg-primary-50 text-primary' },
          { label: 'ยังไม่อ่าน', value: notifications.filter(n => !n.is_read).length, icon: 'mark_email_unread', color: 'border-l-warning', iconBg: 'bg-amber-50 text-warning' },
          { label: 'อ่านแล้ว', value: notifications.filter(n => n.is_read).length, icon: 'mark_email_read', color: 'border-l-success', iconBg: 'bg-emerald-50 text-success' },
          { label: 'วันนี้', value: notifications.filter(n => new Date(n.created_at).toDateString() === new Date().toDateString()).length, icon: 'today', color: 'border-l-sky-400', iconBg: 'bg-sky-50 text-sky-500' },
        ].map((s, i) => (
          <div key={i} className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-4 border-l-4 ${s.color}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${s.iconBg}`}>
              <span className="material-symbols-outlined text-[16px]">{s.icon}</span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
          <p className="text-sm text-slate-400 mt-3">กำลังโหลด...</p>
        </div>
      ) : (
        <Card noPadding>
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <span className="material-symbols-outlined text-slate-300 text-5xl">notifications_off</span>
              <p className="text-sm text-slate-400 mt-3">ไม่มีการแจ้งเตือน</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {notifications.map((n) => (
                <div key={n.id} className={`flex items-start gap-4 p-4 hover:bg-slate-50/50 transition-colors ${!n.is_read ? 'bg-primary-50/30' : ''}`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    n.type === 'success' ? 'bg-emerald-50' : n.type === 'warning' ? 'bg-amber-50' : n.type === 'error' ? 'bg-red-50' : 'bg-sky-50'
                  }`}>
                    <span className={`material-symbols-outlined text-[18px] ${
                      n.type === 'success' ? 'text-success' : n.type === 'warning' ? 'text-warning' : n.type === 'error' ? 'text-danger' : 'text-sky-500'
                    }`}>
                      {n.type === 'success' ? 'check_circle' : n.type === 'warning' ? 'warning' : n.type === 'error' ? 'error' : 'info'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-800 text-sm">{n.title}</p>
                      {getTypeBadge(n.type)}
                      {!n.is_read && <span className="w-2 h-2 bg-primary rounded-full"></span>}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] text-slate-400">{n.user?.name || `User #${n.user_id}`}</span>
                      <span className="text-[10px] text-slate-300">·</span>
                      <span className="text-[10px] text-slate-400">{n.created_at ? new Date(n.created_at).toLocaleString('th-TH') : '-'}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(n.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors shrink-0" title="ลบ">
                    <span className="material-symbols-outlined text-slate-400 hover:text-danger text-[18px]">delete</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Send Modal */}
      <Modal isOpen={showSendModal} onClose={() => setShowSendModal(false)} title="ส่งการแจ้งเตือน" maxWidth="lg"
        footer={<><Button variant="secondary" onClick={() => setShowSendModal(false)}>ยกเลิก</Button><Button icon="send" onClick={handleSend} isLoading={sending}>ส่ง</Button></>}>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">หัวข้อ</label>
            <input type="text" value={sendForm.title} onChange={(e) => setSendForm({ ...sendForm, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="หัวข้อการแจ้งเตือน" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">ข้อความ</label>
            <textarea value={sendForm.message} onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="เนื้อหาการแจ้งเตือน..." rows={4} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">ประเภท</label>
            <select value={sendForm.type} onChange={(e) => setSendForm({ ...sendForm, type: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
              <option value="info">ข้อมูล</option><option value="success">สำเร็จ</option><option value="warning">เตือน</option><option value="error">ข้อผิดพลาด</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">User IDs (เว้นว่างเพื่อส่งทุกคน)</label>
            <input type="text" value={sendForm.userIds} onChange={(e) => setSendForm({ ...sendForm, userIds: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="เช่น: 1, 2, 3 (เว้นว่าง = ส่งทุกคน)" />
          </div>
        </div>
      </Modal>
    </div>
  );
}
