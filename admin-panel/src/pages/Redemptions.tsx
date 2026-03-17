import { useState, useEffect } from 'react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export default function Redemptions() {
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedRedemption, setSelectedRedemption] = useState<any>(null);
  const [actionNote, setActionNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => { loadRedemptions(); }, [statusFilter]);

  const loadRedemptions = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/admin/redemptions?limit=100`;
      if (statusFilter) url += `&status=${statusFilter}`;
      const res = await fetch(url);
      if (res.ok) { const data = await res.json(); setRedemptions(data.redemptions || []); }
    } catch (err) { console.error(err); showError('ไม่สามารถโหลดข้อมูลได้'); }
    finally { setLoading(false); }
  };

  const showSuccess = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };
  const showError = (msg: string) => { setErrorMsg(msg); setTimeout(() => setErrorMsg(''), 3000); };

  const handleAction = async (status: 'approved' | 'rejected') => {
    if (!selectedRedemption) return;
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/admin/redemptions/${selectedRedemption.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note: actionNote }),
      });
      if (res.ok) {
        showSuccess(status === 'approved' ? 'อนุมัติสำเร็จ' : 'ปฏิเสธสำเร็จ');
        setShowModal(false); setSelectedRedemption(null); setActionNote('');
        loadRedemptions();
      } else { const d = await res.json(); showError(d.error || 'เกิดข้อผิดพลาด'); }
    } catch (err) { showError('เกิดข้อผิดพลาด'); }
    finally { setProcessing(false); }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge variant="success" hasDot>อนุมัติ</Badge>;
      case 'rejected': return <Badge variant="danger" hasDot>ปฏิเสธ</Badge>;
      default: return <Badge variant="warning" hasDot>รอดำเนินการ</Badge>;
    }
  };

  const pendingCount = redemptions.filter(r => r.status === 'pending').length;

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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">จัดการการแลกของรางวัล</h1>
          <p className="text-sm text-slate-500 mt-0.5">อนุมัติหรือปฏิเสธคำขอแลกของรางวัล</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
            <span className="material-symbols-outlined text-warning text-[18px]">pending</span>
            <span className="text-sm font-bold text-amber-800">รอดำเนินการ {pendingCount} รายการ</span>
          </div>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[
          { key: '', label: 'ทั้งหมด' },
          { key: 'pending', label: 'รอดำเนินการ' },
          { key: 'approved', label: 'อนุมัติแล้ว' },
          { key: 'rejected', label: 'ปฏิเสธแล้ว' },
        ].map((f) => (
          <button key={f.key} onClick={() => setStatusFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              statusFilter === f.key ? 'bg-primary text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
            }`}>
            {f.label}
          </button>
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
          {redemptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <span className="material-symbols-outlined text-slate-300 text-5xl">redeem</span>
              <p className="text-sm text-slate-400 mt-3">ไม่มีรายการ</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">ID</th>
                    <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">ลูกค้า</th>
                    <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">ของรางวัล</th>
                    <th className="px-3 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">คะแนน</th>
                    <th className="px-3 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">สถานะ</th>
                    <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">วันที่</th>
                    <th className="px-3 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {redemptions.map((r) => (
                    <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-500">#{r.id}</td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-800">{r.user?.name || '-'}</p>
                        <p className="text-[10px] text-slate-400">{r.user?.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-800">{r.reward?.name || '-'}</p>
                        <p className="text-[10px] text-slate-400">{r.reward?.category}</p>
                      </td>
                      <td className="px-4 py-3 text-right font-black text-violet-600">{(r.points_used || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">{getStatusBadge(r.status)}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{r.created_at ? new Date(r.created_at).toLocaleDateString('th-TH') : '-'}</td>
                      <td className="px-4 py-3 text-center">
                        {r.status === 'pending' ? (
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => { setSelectedRedemption(r); setShowModal(true); }}
                              className="p-1.5 hover:bg-emerald-50 rounded-lg transition-colors" title="อนุมัติ/ปฏิเสธ">
                              <span className="material-symbols-outlined text-primary text-[18px]">rule</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Action Modal */}
      <Modal isOpen={showModal && !!selectedRedemption} onClose={() => { setShowModal(false); setSelectedRedemption(null); setActionNote(''); }}
        title="ดำเนินการแลกของรางวัล"
        footer={
          <>
            <Button variant="danger" icon="close" onClick={() => handleAction('rejected')} isLoading={processing} disabled={processing}>ปฏิเสธ</Button>
            <Button variant="success" icon="check" onClick={() => handleAction('approved')} isLoading={processing} disabled={processing}>อนุมัติ</Button>
          </>
        }>
        {selectedRedemption && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
              <div className="flex justify-between"><span className="text-xs text-slate-500">ลูกค้า</span><span className="text-sm font-bold">{selectedRedemption.user?.name}</span></div>
              <div className="flex justify-between"><span className="text-xs text-slate-500">ของรางวัล</span><span className="text-sm font-bold">{selectedRedemption.reward?.name}</span></div>
              <div className="flex justify-between"><span className="text-xs text-slate-500">คะแนนที่ใช้</span><span className="text-sm font-black text-violet-600">{selectedRedemption.points_used}</span></div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">หมายเหตุ (ไม่บังคับ)</label>
              <textarea value={actionNote} onChange={(e) => setActionNote(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="ระบุเหตุผล..." rows={3} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
