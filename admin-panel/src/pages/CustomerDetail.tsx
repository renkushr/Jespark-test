import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'purchases' | 'points' | 'redemptions'>('purchases');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [pointsHistory, setPointsHistory] = useState<any[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [tabLoading, setTabLoading] = useState(false);

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', tier: '', points: 0, wallet_balance: 0 });
  const [saving, setSaving] = useState(false);

  // Add points modal
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [pointsAmount, setPointsAmount] = useState('');
  const [pointsDesc, setPointsDesc] = useState('');
  const [addingPoints, setAddingPoints] = useState(false);

  useEffect(() => { if (id) loadCustomer(); }, [id]);
  useEffect(() => { if (customer) loadTabData(); }, [activeTab, customer]);

  const loadCustomer = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/customers/${id}`);
      if (res.ok) {
        const data = await res.json();
        const found = data.customer;
        if (found) {
          setCustomer(found);
          setEditForm({
            name: found.display_name || found.name || '',
            email: found.email || '',
            phone: found.phone || '',
            tier: found.tier || 'member',
            points: found.points || 0,
            wallet_balance: found.wallet_balance || 0,
          });
        }
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const loadTabData = async () => {
    setTabLoading(true);
    try {
      if (activeTab === 'purchases') {
        const res = await fetch(`${API_BASE}/admin/customer/${id}/transactions`);
        if (res.ok) { const data = await res.json(); setTransactions(data.transactions || []); }
      } else if (activeTab === 'points') {
        const res = await fetch(`${API_BASE}/admin/points/history?userId=${id}&limit=50`);
        if (res.ok) { const data = await res.json(); setPointsHistory(data.history || []); }
      } else if (activeTab === 'redemptions') {
        const res = await fetch(`${API_BASE}/admin/redemptions?userId=${id}&limit=50`);
        if (res.ok) { const data = await res.json(); setRedemptions(data.redemptions || []); }
        else setRedemptions([]);
      }
    } catch (err) { console.error(err); }
    finally { setTabLoading(false); }
  };

  const handleEditSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) { setShowEditModal(false); loadCustomer(); }
      else { const d = await res.json(); alert(d.error || 'เกิดข้อผิดพลาด'); }
    } catch (err) { alert('เกิดข้อผิดพลาด'); }
    finally { setSaving(false); }
  };

  const handleAddPoints = async () => {
    if (!pointsAmount || parseInt(pointsAmount) <= 0) return;
    setAddingPoints(true);
    try {
      const res = await fetch(`${API_BASE}/admin/points/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: parseInt(id!), points: parseInt(pointsAmount), title: pointsDesc || 'เพิ่มคะแนนจาก Admin' }),
      });
      if (res.ok) { setShowPointsModal(false); setPointsAmount(''); setPointsDesc(''); loadCustomer(); loadTabData(); }
      else { const d = await res.json(); alert(d.error || 'เกิดข้อผิดพลาด'); }
    } catch (err) { alert('เกิดข้อผิดพลาด'); }
    finally { setAddingPoints(false); }
  };

  const handleDelete = async () => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบลูกค้านี้? ข้อมูลจะถูกลบถาวร')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) { navigate('/customers'); }
      else { alert('ไม่สามารถลบได้'); }
    } catch (err) { alert('เกิดข้อผิดพลาด'); }
  };

  const getTierBadge = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'platinum': return <Badge variant="primary">Platinum</Badge>;
      case 'gold': return <Badge variant="warning">Gold</Badge>;
      case 'silver': return <Badge variant="neutral">Silver</Badge>;
      default: return <Badge variant="info">Member</Badge>;
    }
  };

  const tabs = [
    { key: 'purchases' as const, icon: 'shopping_cart', label: 'ประวัติการซื้อ' },
    { key: 'points' as const, icon: 'stars', label: 'ประวัติคะแนน' },
    { key: 'redemptions' as const, icon: 'redeem', label: 'การแลกของรางวัล' },
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
      <p className="text-sm text-slate-400 mt-3">กำลังโหลดข้อมูล...</p>
    </div>
  );

  if (!customer) return (
    <div className="flex flex-col items-center justify-center py-20">
      <span className="material-symbols-outlined text-slate-300 text-5xl">person_off</span>
      <p className="text-sm text-slate-400 mt-3">ไม่พบข้อมูลลูกค้า</p>
      <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/customers')}>กลับ</Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button onClick={() => navigate('/customers')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors shrink-0">
          <span className="material-symbols-outlined text-slate-500">arrow_back</span>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 truncate">รายละเอียดลูกค้า</h1>
          <p className="text-xs sm:text-sm text-slate-500 truncate">ID: {customer.id} · {customer.member_id || '-'}</p>
        </div>
        <Button variant="danger" icon="delete" size="sm" onClick={handleDelete} className="shrink-0">ลบ</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Customer Info */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-primary-900 via-primary to-primary-600 p-6 text-center text-white">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-4xl">person</span>
              </div>
              <h2 className="text-xl font-black">{customer.display_name || customer.name || 'ไม่ระบุชื่อ'}</h2>
              <p className="text-white/70 text-sm mt-1">{customer.member_id || '-'}</p>
              <div className="mt-2">{getTierBadge(customer.tier)}</div>
            </div>

            <div className="p-5 space-y-3">
              {[
                { icon: 'email', value: customer.email || '-' },
                { icon: 'phone', value: customer.phone || '-' },
                { icon: 'calendar_today', value: customer.created_at ? `สมัคร: ${new Date(customer.created_at).toLocaleDateString('th-TH')}` : '-' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="material-symbols-outlined text-slate-400 text-[18px]">{item.icon}</span>
                  <span className="text-slate-600">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="px-5 pb-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-primary-50 rounded-xl p-3 text-center border border-primary-100">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">คะแนน</p>
                  <p className="text-xl font-black text-primary">{(customer.points || 0).toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">กระเป๋า</p>
                  <p className="text-xl font-black text-slate-800">฿{(customer.wallet_balance || 0).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button icon="add" size="sm" fullWidth onClick={() => setShowPointsModal(true)}>เพิ่มคะแนน</Button>
                <Button variant="secondary" icon="edit" size="sm" fullWidth onClick={() => setShowEditModal(true)}>แก้ไข</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Activity */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-fit mb-5 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.key ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}>
                <span className="material-symbols-outlined text-[16px] sm:text-[18px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <Card noPadding>
            {tabLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <span className="material-symbols-outlined text-primary text-3xl animate-spin">progress_activity</span>
                <p className="text-xs text-slate-400 mt-2">กำลังโหลด...</p>
              </div>
            ) : (
              <>
                {/* Purchases */}
                {activeTab === 'purchases' && (transactions.length === 0 ? (
                  <div className="flex flex-col items-center py-12">
                    <span className="material-symbols-outlined text-slate-300 text-4xl">receipt_long</span>
                    <p className="text-sm text-slate-400 mt-2">ยังไม่มีประวัติการซื้อ</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {transactions.map((t: any) => (
                      <div key={t.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-[18px]">shopping_cart</span>
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">฿{t.amount?.toFixed(2)}</p>
                            <p className="text-[10px] text-slate-400">{t.createdAt ? new Date(t.createdAt).toLocaleString('th-TH') : '-'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-success">+{t.pointsEarned || t.points || 0}</span>
                          <p className="text-[10px] text-slate-400">{t.paymentMethod || 'cash'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}

                {/* Points History */}
                {activeTab === 'points' && (pointsHistory.length === 0 ? (
                  <div className="flex flex-col items-center py-12">
                    <span className="material-symbols-outlined text-slate-300 text-4xl">stars</span>
                    <p className="text-sm text-slate-400 mt-2">ยังไม่มีประวัติคะแนน</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {pointsHistory.map((h: any) => (
                      <div key={h.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${h.points > 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                            <span className={`material-symbols-outlined text-[18px] ${h.points > 0 ? 'text-success' : 'text-danger'}`}>
                              {h.points > 0 ? 'add_circle' : 'remove_circle'}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{h.description}</p>
                            <p className="text-[10px] text-slate-400">{h.created_at ? new Date(h.created_at).toLocaleString('th-TH') : '-'}</p>
                          </div>
                        </div>
                        <span className={`text-sm font-black ${h.points > 0 ? 'text-success' : 'text-danger'}`}>
                          {h.points > 0 ? '+' : ''}{h.points}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}

                {/* Redemptions */}
                {activeTab === 'redemptions' && (redemptions.length === 0 ? (
                  <div className="flex flex-col items-center py-12">
                    <span className="material-symbols-outlined text-slate-300 text-4xl">redeem</span>
                    <p className="text-sm text-slate-400 mt-2">ยังไม่มีการแลกของรางวัล</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {redemptions.map((r: any) => (
                      <div key={r.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-violet-500 text-[18px]">redeem</span>
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{r.rewardName || r.reward?.name || 'ของรางวัล'}</p>
                            <p className="text-[10px] text-slate-400">{r.created_at ? new Date(r.created_at).toLocaleString('th-TH') : '-'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-violet-600">-{r.points_used || 0}</span>
                          <p className="text-[10px]">
                            <Badge variant={r.status === 'approved' ? 'success' : r.status === 'rejected' ? 'danger' : 'warning'} hasDot>
                              {r.status === 'approved' ? 'อนุมัติ' : r.status === 'rejected' ? 'ปฏิเสธ' : 'รอดำเนินการ'}
                            </Badge>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </>
            )}
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="แก้ไขข้อมูลลูกค้า"
        footer={<><Button variant="secondary" onClick={() => setShowEditModal(false)}>ยกเลิก</Button><Button icon="save" onClick={handleEditSave} isLoading={saving}>บันทึก</Button></>}>
        <div className="space-y-4">
          <Input label="ชื่อ" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} icon="person" />
          <Input label="อีเมล" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} icon="email" />
          <Input label="เบอร์โทร" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} icon="phone" />
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tier</label>
            <select value={editForm.tier} onChange={(e) => setEditForm({ ...editForm, tier: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
              <option value="member">Member</option><option value="silver">Silver</option><option value="gold">Gold</option><option value="platinum">Platinum</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="คะแนน" type="number" value={editForm.points.toString()} onChange={(e) => setEditForm({ ...editForm, points: parseInt(e.target.value) || 0 })} icon="stars" />
            <Input label="ยอดกระเป๋า" type="number" value={editForm.wallet_balance.toString()} onChange={(e) => setEditForm({ ...editForm, wallet_balance: parseFloat(e.target.value) || 0 })} icon="account_balance_wallet" />
          </div>
        </div>
      </Modal>

      {/* Add Points Modal */}
      <Modal isOpen={showPointsModal} onClose={() => setShowPointsModal(false)} title="เพิ่มคะแนน"
        footer={<><Button variant="secondary" onClick={() => setShowPointsModal(false)}>ยกเลิก</Button><Button variant="success" icon="add" onClick={handleAddPoints} isLoading={addingPoints}>เพิ่มคะแนน</Button></>}>
        <div className="space-y-4">
          <Input label="จำนวนคะแนน" type="number" value={pointsAmount} onChange={(e) => setPointsAmount(e.target.value)} icon="stars" placeholder="0" min="1" />
          <Input label="หมายเหตุ" value={pointsDesc} onChange={(e) => setPointsDesc(e.target.value)} icon="notes" placeholder="เช่น โปรโมชั่น, ชดเชย" />
        </div>
      </Modal>
    </div>
  );
}
