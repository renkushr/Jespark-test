import { useState, useEffect } from 'react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export default function Coupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ code: '', title: '', description: '', discount_type: 'percent', discount_value: '', min_purchase: '', expires_at: '', user_id: '' });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 20;

  const token = localStorage.getItem('admin_token');
  const authHeaders: HeadersInit = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  useEffect(() => { loadCoupons(); }, [page]);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * PAGE_SIZE;
      const res = await fetch(`${API_BASE}/admin/coupons?limit=${PAGE_SIZE}&offset=${offset}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        const list = data.coupons || [];
        setCoupons(list);
        setTotalCount(data.total ?? data.pagination?.total ?? list.length);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const showSuccess = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };
  const showError = (msg: string) => { setErrorMsg(msg); setTimeout(() => setErrorMsg(''), 3000); };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'JSP-';
    for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    setForm({ ...form, code });
  };

  const handleCreate = async () => {
    if (!form.code || !form.title || !form.discount_value) { showError('กรุณากรอกข้อมูลให้ครบ'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/admin/coupons`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          ...form,
          discount_value: parseFloat(form.discount_value),
          min_purchase: form.min_purchase ? parseFloat(form.min_purchase) : 0,
          user_id: form.user_id ? parseInt(form.user_id) : null,
          expires_at: form.expires_at || null,
        }),
      });
      if (res.ok) {
        showSuccess('สร้างคูปองสำเร็จ');
        setShowModal(false);
        setForm({ code: '', title: '', description: '', discount_type: 'percent', discount_value: '', min_purchase: '', expires_at: '', user_id: '' });
        loadCoupons();
      } else { const d = await res.json(); showError(d.error || 'เกิดข้อผิดพลาด'); }
    } catch (err) { showError('เกิดข้อผิดพลาด'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('ลบคูปองนี้?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/coupons/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { showSuccess('ลบสำเร็จ'); loadCoupons(); }
    } catch (err) { showError('เกิดข้อผิดพลาด'); }
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
          <h1 className="text-2xl font-black text-slate-900">จัดการคูปอง</h1>
          <p className="text-sm text-slate-500 mt-0.5">สร้างและจัดการคูปองส่วนลด</p>
        </div>
        <Button icon="add" size="sm" onClick={() => { generateCode(); setShowModal(true); }}>สร้างคูปอง</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: 'ทั้งหมด', value: totalCount, icon: 'confirmation_number', color: 'border-l-primary', iconBg: 'bg-primary-50 text-primary' },
          { label: 'ยังไม่ใช้', value: coupons.filter(c => !c.is_used).length, icon: 'new_releases', color: 'border-l-success', iconBg: 'bg-emerald-50 text-success' },
          { label: 'ใช้แล้ว', value: coupons.filter(c => c.is_used).length, icon: 'check_circle', color: 'border-l-slate-400', iconBg: 'bg-slate-100 text-slate-500' },
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

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
          <p className="text-sm text-slate-400 mt-3">กำลังโหลด...</p>
        </div>
      ) : (
        <Card noPadding>
          {coupons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <span className="material-symbols-outlined text-slate-300 text-5xl">confirmation_number</span>
              <p className="text-sm text-slate-400 mt-3">ยังไม่มีคูปอง</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">รหัส</th>
                      <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">ชื่อ</th>
                      <th className="px-3 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">ส่วนลด</th>
                      <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">ลูกค้า</th>
                      <th className="px-3 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">สถานะ</th>
                      <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">หมดอายุ</th>
                      <th className="px-3 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((c) => (
                      <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono font-black text-primary bg-primary-50 px-2 py-1 rounded-md text-xs">{c.code}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-800">{c.title}</p>
                          <p className="text-[10px] text-slate-400">{c.description}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-black text-success">
                            {c.discount_type === 'percent' ? `${c.discount_value}%` : `฿${c.discount_value}`}
                          </span>
                          {c.min_purchase > 0 && <p className="text-[10px] text-slate-400">ขั้นต่ำ ฿{c.min_purchase}</p>}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">{c.user?.name || 'ทุกคน'}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={c.is_used ? 'neutral' : 'success'} hasDot>{c.is_used ? 'ใช้แล้ว' : 'พร้อมใช้'}</Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">{c.expires_at ? new Date(c.expires_at).toLocaleDateString('th-TH') : 'ไม่หมดอายุ'}</td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => handleDelete(c.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="ลบ">
                            <span className="material-symbols-outlined text-slate-400 hover:text-danger text-[18px]">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalCount > 0 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    แสดง {Math.min((page - 1) * PAGE_SIZE + 1, totalCount)}-{Math.min(page * PAGE_SIZE, totalCount)} จาก {totalCount} รายการ
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                    >
                      ก่อนหน้า
                    </button>
                    <span className="px-3 py-1.5 text-xs font-bold text-slate-600">
                      หน้า {page} / {Math.max(1, Math.ceil(totalCount / PAGE_SIZE))}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPage(p => p + 1)}
                      disabled={page * PAGE_SIZE >= totalCount}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                    >
                      ถัดไป
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      )}

      {/* Create Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="สร้างคูปองใหม่" maxWidth="lg"
        footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>ยกเลิก</Button><Button icon="add" onClick={handleCreate} isLoading={saving}>สร้าง</Button></>}>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">รหัสคูปอง</label>
            <div className="flex gap-2">
              <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="JSP-XXXXXX" required />
              <Button variant="outline" size="sm" onClick={generateCode}>สุ่ม</Button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">ชื่อคูปอง</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="เช่น ส่วนลด 10%" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">คำอธิบาย</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" rows={2} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">ประเภทส่วนลด</label>
              <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                <option value="percent">เปอร์เซ็นต์ (%)</option><option value="fixed">จำนวนเงิน (฿)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">มูลค่าส่วนลด</label>
              <input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="0" min="1" required />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">ยอดซื้อขั้นต่ำ (฿)</label>
              <input type="number" value={form.min_purchase} onChange={(e) => setForm({ ...form, min_purchase: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">วันหมดอายุ</label>
              <input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">User ID (เว้นว่าง = ใช้ได้ทุกคน)</label>
            <input type="number" value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="เว้นว่าง = ทุกคน" />
          </div>
        </div>
      </Modal>
    </div>
  );
}
