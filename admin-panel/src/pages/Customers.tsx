import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 20;

  // Points modal
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [pointsAmount, setPointsAmount] = useState('');
  const [pointsDescription, setPointsDescription] = useState('');
  const [addingPoints, setAddingPoints] = useState(false);

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', tier: '', points: 0, wallet_balance: 0 });
  const [saving, setSaving] = useState(false);

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const showToast = (type: 'success' | 'error', message: string) => { setToast({ type, message }); setTimeout(() => setToast(null), 3000); };

  const token = localStorage.getItem('admin_token');
  const authHeaders: HeadersInit = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  useEffect(() => { loadCustomers(); }, [searchTerm, tierFilter, page]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (tierFilter) params.append('tier', tierFilter);
      params.append('limit', String(PAGE_SIZE));
      params.append('offset', String((page - 1) * PAGE_SIZE));
      const res = await fetch(`${API_BASE}/admin/customers?${params}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        const list = data.customers || [];
        setCustomers(list);
        setTotalCount(data.total ?? data.pagination?.total ?? list.length);
        setError('');
      }
      else throw new Error('Failed to load');
    } catch (err: any) {
      console.error('Error loading customers:', err);
      setError(err.message || 'ไม่สามารถโหลดข้อมูลลูกค้าได้');
    } finally { setLoading(false); }
  };

  const getTierBadge = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'platinum': return <Badge variant="primary">Platinum</Badge>;
      case 'gold': return <Badge variant="warning">Gold</Badge>;
      case 'silver': return <Badge variant="neutral">Silver</Badge>;
      default: return <Badge variant="info">Member</Badge>;
    }
  };

  // Points
  const handleOpenPointsModal = (customer: any) => { setSelectedCustomer(customer); setPointsAmount(''); setPointsDescription(''); setShowPointsModal(true); };
  const handleClosePointsModal = () => { setShowPointsModal(false); setSelectedCustomer(null); };

  const handleAddPoints = async () => {
    if (!selectedCustomer || !pointsAmount || parseInt(pointsAmount) <= 0) { showToast('error', 'กรุณาใส่จำนวนคะแนนที่ถูกต้อง'); return; }
    try {
      setAddingPoints(true);
      const res = await fetch(`${API_BASE}/admin/points/add`, {
        method: 'POST', headers: authHeaders,
        body: JSON.stringify({ userId: selectedCustomer.id, points: parseInt(pointsAmount), title: pointsDescription || 'เพิ่มคะแนนจาก Admin' }),
      });
      if (res.ok) { showToast('success', 'เพิ่มคะแนนสำเร็จ!'); handleClosePointsModal(); loadCustomers(); }
      else { const d = await res.json(); showToast('error', d.error || 'ไม่สามารถเพิ่มคะแนนได้'); }
    } catch (err: any) { showToast('error', 'เกิดข้อผิดพลาด'); }
    finally { setAddingPoints(false); }
  };

  // Edit
  const handleOpenEditModal = (customer: any) => {
    setEditCustomer(customer);
    setEditForm({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      tier: customer.tier || 'Member',
      points: customer.points || 0,
      wallet_balance: customer.wallet_balance || 0,
    });
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    if (!editCustomer) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/admin/users/${editCustomer.id}`, {
        method: 'PUT', headers: authHeaders,
        body: JSON.stringify(editForm),
      });
      if (res.ok) { showToast('success', 'บันทึกสำเร็จ'); setShowEditModal(false); loadCustomers(); }
      else { const d = await res.json(); showToast('error', d.error || 'เกิดข้อผิดพลาด'); }
    } catch (err) { showToast('error', 'เกิดข้อผิดพลาด'); }
    finally { setSaving(false); }
  };

  // Delete — open approval modal
  const handleDelete = (customer: any) => {
    setDeleteTarget(customer);
    setDeleteConfirmText('');
    setShowDeleteModal(true);
  };

  const deleteTargetName = deleteTarget?.name || 'ลูกค้า';
  const isDeleteConfirmed = deleteConfirmText.trim() === deleteTargetName.trim();

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !isDeleteConfirmed) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/admin/users/${deleteTarget.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { showToast('success', 'ลบลูกค้าสำเร็จ'); setShowDeleteModal(false); setDeleteTarget(null); loadCustomers(); }
      else { showToast('error', 'ไม่สามารถลบได้'); }
    } catch (err) { showToast('error', 'เกิดข้อผิดพลาด'); }
    finally { setDeleting(false); }
  };

  const Loader = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
      <p className="text-sm text-slate-400 mt-3">กำลังโหลดข้อมูล...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 text-white rounded-xl shadow-lg ${toast.type === 'success' ? 'bg-success' : 'bg-danger'}`}>
          <span className="material-symbols-outlined text-[18px]">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">จัดการลูกค้า</h1>
          <p className="text-sm text-slate-500 mt-0.5">ดูและจัดการข้อมูลสมาชิกทั้งหมด</p>
        </div>
      </div>

      {/* Search & Filter */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
            <input
              type="text"
              placeholder="ค้นหาด้วยชื่อ, อีเมล, หรือเบอร์โทร..."
              value={searchTerm}
              onChange={(e) => { setPage(1); setSearchTerm(e.target.value); }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
            />
          </div>
          <select
            value={tierFilter}
            onChange={(e) => { setPage(1); setTierFilter(e.target.value); }}
            className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">ทุก Tier</option>
            <option value="Member">Member</option>
            <option value="Silver">Silver</option>
            <option value="Gold">Gold</option>
            <option value="Platinum">Platinum</option>
          </select>
        </div>
      </Card>

      {/* Error */}
      {error && !loading && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <span className="material-symbols-outlined text-danger text-[20px]">error</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-red-800">เกิดข้อผิดพลาด</p>
            <p className="text-xs text-red-600 mt-0.5">{error}</p>
          </div>
          <Button variant="danger" size="sm" onClick={loadCustomers}>ลองอีกครั้ง</Button>
        </div>
      )}

      {/* Table */}
      {loading ? <Loader /> : !error && (
        <Card noPadding>
          {customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <span className="material-symbols-outlined text-slate-300 text-5xl">people</span>
              <p className="text-sm text-slate-400 mt-3">ไม่พบข้อมูลลูกค้า</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[650px]">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">รหัส</th>
                      <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">ชื่อ</th>
                      <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">อีเมล</th>
                      <th className="px-3 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">Tier</th>
                      <th className="px-3 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">คะแนน</th>
                      <th className="px-3 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <tr key={customer.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-500">{customer.member_id || '-'}</td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-800">{customer.name || 'ไม่ระบุชื่อ'}</p>
                          {customer.phone && <p className="text-xs text-slate-400">{customer.phone}</p>}
                        </td>
                        <td className="px-4 py-3 text-slate-500">{customer.email || '-'}</td>
                        <td className="px-4 py-3 text-center">{getTierBadge(customer.tier || 'Member')}</td>
                        <td className="px-4 py-3 text-right font-black text-slate-800">{(customer.points || 0).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => handleOpenPointsModal(customer)} className="p-1.5 hover:bg-emerald-50 rounded-lg transition-colors" title="ให้คะแนน">
                              <span className="material-symbols-outlined text-success text-[18px]">add_circle</span>
                            </button>
                            <Link to={`/customers/${customer.id}`} className="p-1.5 hover:bg-primary-50 rounded-lg transition-colors" title="ดูรายละเอียด">
                              <span className="material-symbols-outlined text-primary text-[18px]">visibility</span>
                            </Link>
                            <button onClick={() => handleOpenEditModal(customer)} className="p-1.5 hover:bg-sky-50 rounded-lg transition-colors" title="แก้ไข">
                              <span className="material-symbols-outlined text-sky-500 text-[18px]">edit</span>
                            </button>
                            <button onClick={() => handleDelete(customer)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="ลบ">
                              <span className="material-symbols-outlined text-danger text-[18px]">delete</span>
                            </button>
                          </div>
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

      {/* Add Points Modal */}
      <Modal isOpen={showPointsModal && !!selectedCustomer} onClose={handleClosePointsModal} title="ให้คะแนน"
        footer={<><Button variant="secondary" onClick={handleClosePointsModal} disabled={addingPoints}>ยกเลิก</Button><Button variant="success" icon="add" onClick={handleAddPoints} isLoading={addingPoints}>เพิ่มคะแนน</Button></>}>
        {selectedCustomer && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">ลูกค้า</p>
              <p className="font-bold text-slate-800">{selectedCustomer.name || 'ไม่ระบุชื่อ'}</p>
              <p className="text-xs text-slate-500 mt-1">คะแนนปัจจุบัน: <span className="font-black text-primary">{(selectedCustomer.points || 0).toLocaleString()}</span></p>
            </div>
            <Input label="จำนวนคะแนน" type="number" value={pointsAmount} onChange={(e) => setPointsAmount(e.target.value)} placeholder="ใส่จำนวนคะแนน" icon="stars" min="1" required />
            <Input label="หมายเหตุ (ไม่บังคับ)" type="text" value={pointsDescription} onChange={(e) => setPointsDescription(e.target.value)} placeholder="เช่น ซื้อสินค้า, โปรโมชั่น" icon="notes" />
          </div>
        )}
      </Modal>

      {/* Edit Customer Modal */}
      <Modal isOpen={showEditModal && !!editCustomer} onClose={() => setShowEditModal(false)} title="แก้ไขข้อมูลลูกค้า" maxWidth="lg"
        footer={<><Button variant="secondary" onClick={() => setShowEditModal(false)} disabled={saving}>ยกเลิก</Button><Button icon="save" onClick={handleEditSave} isLoading={saving}>บันทึก</Button></>}>
        <div className="space-y-4">
          <Input label="ชื่อ" type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} icon="person" placeholder="ชื่อลูกค้า" />
          <Input label="อีเมล" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} icon="mail" placeholder="email@example.com" />
          <Input label="เบอร์โทร" type="tel" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} icon="phone" placeholder="0812345678" />
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">ระดับสมาชิก</label>
            <select value={editForm.tier} onChange={(e) => setEditForm({ ...editForm, tier: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
              <option value="Member">Member</option>
              <option value="Silver">Silver</option>
              <option value="Gold">Gold</option>
              <option value="Platinum">Platinum</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="คะแนน" type="number" value={editForm.points.toString()} onChange={(e) => setEditForm({ ...editForm, points: parseInt(e.target.value) || 0 })} icon="stars" />
            <Input label="ยอดกระเป๋า" type="number" value={editForm.wallet_balance.toString()} onChange={(e) => setEditForm({ ...editForm, wallet_balance: parseFloat(e.target.value) || 0 })} icon="account_balance_wallet" />
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal && !!deleteTarget} onClose={() => { setShowDeleteModal(false); setDeleteTarget(null); }} title="ยืนยันการลบลูกค้า"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }} disabled={deleting}>ยกเลิก</Button>
            <Button variant="danger" icon="delete" onClick={handleConfirmDelete} isLoading={deleting} disabled={!isDeleteConfirmed || deleting}>ยืนยันลบ</Button>
          </>
        }>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <span className="material-symbols-outlined text-danger text-[28px]">warning</span>
            <div>
              <p className="text-sm font-bold text-red-800">การลบนี้ไม่สามารถย้อนกลับได้</p>
              <p className="text-xs text-red-600 mt-0.5">ข้อมูลลูกค้าทั้งหมดจะถูกลบถาวร รวมถึงคะแนนและประวัติ</p>
            </div>
          </div>
          {deleteTarget && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">ลูกค้าที่จะลบ</p>
              <p className="font-bold text-slate-800">{deleteTargetName}</p>
              <p className="text-xs text-slate-500 mt-1">{deleteTarget.member_id || '-'} · {deleteTarget.email || deleteTarget.phone || '-'}</p>
            </div>
          )}
          <div className="space-y-2">
            <p className="text-sm text-slate-600">พิมพ์ชื่อ <span className="font-black text-danger">"{deleteTargetName}"</span> เพื่อยืนยันการลบ</p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={`พิมพ์ "${deleteTargetName}" ที่นี่`}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all"
              autoFocus
            />
            {deleteConfirmText.length > 0 && !isDeleteConfirmed && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">error</span>
                ชื่อไม่ตรงกัน กรุณาพิมพ์ให้ถูกต้อง
              </p>
            )}
            {isDeleteConfirmed && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                ยืนยันแล้ว สามารถกดปุ่ม "ยืนยันลบ" ได้
              </p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
