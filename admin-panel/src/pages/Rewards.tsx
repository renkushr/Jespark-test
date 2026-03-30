import { useState, useEffect } from 'react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';

interface Reward {
  id: number;
  name: string;
  description: string;
  points_required: number;
  category: string;
  image_url: string;
  stock: number;
  is_active: boolean;
}

export default function Rewards() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [formData, setFormData] = useState({
    name: '', description: '', points_required: '', category: '', image_url: '', stock: '',
  });

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
  const token = localStorage.getItem('admin_token');
  const authHeaders: HeadersInit = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  useEffect(() => { loadRewards(); }, []);

  const loadRewards = async () => {
    try {
      const response = await fetch(`${API_BASE}/rewards/admin/all`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) { const data = await response.json(); setRewards(data.rewards || []); }
    } catch (error) { console.error('Error loading rewards:', error); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingReward ? `${API_BASE}/admin/rewards/${editingReward.id}` : `${API_BASE}/admin/rewards`;
      const response = await fetch(url, {
        method: editingReward ? 'PUT' : 'POST',
        headers: authHeaders,
        body: JSON.stringify({ name: formData.name, description: formData.description, points_required: parseInt(formData.points_required), category: formData.category, image_url: formData.image_url, stock: parseInt(formData.stock) }),
      });
      if (response.ok) {
        setShowModal(false); setEditingReward(null);
        setFormData({ name: '', description: '', points_required: '', category: '', image_url: '', stock: '' });
        loadRewards();
      }
    } catch (error) { console.error('Error:', error); }
  };

  const handleEdit = (reward: Reward) => {
    setEditingReward(reward);
    setFormData({
      name: reward.name, description: reward.description, points_required: reward.points_required.toString(),
      category: reward.category, image_url: reward.image_url, stock: reward.stock.toString(),
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('ต้องการลบของรางวัลนี้?')) return;
    try {
      const response = await fetch(`${API_BASE}/admin/rewards/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) loadRewards();
    } catch (error) { console.error('Error:', error); }
  };

  const getCategoryLabel = (cat: string) => {
    const map: Record<string, string> = { food: 'อาหาร', voucher: 'บัตรกำนัล', product: 'สินค้า', service: 'บริการ' };
    return map[cat] || cat;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">จัดการของรางวัล</h1>
          <p className="text-sm text-slate-500 mt-0.5">เพิ่ม แก้ไข และจัดการของรางวัลสำหรับแลกคะแนน</p>
        </div>
        <Button icon="add" size="sm" onClick={() => {
          setEditingReward(null);
          setFormData({ name: '', description: '', points_required: '', category: '', image_url: '', stock: '' });
          setShowModal(true);
        }}>
          เพิ่มของรางวัล
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
          <p className="text-sm text-slate-400 mt-3">กำลังโหลดข้อมูล...</p>
        </div>
      ) : rewards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200">
          <span className="material-symbols-outlined text-slate-300 text-5xl">card_giftcard</span>
          <p className="text-sm text-slate-400 mt-3">ยังไม่มีของรางวัล</p>
          <Button icon="add" size="sm" className="mt-4" onClick={() => setShowModal(true)}>เพิ่มของรางวัลแรก</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rewards.map((reward) => (
            <div key={reward.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
              <div className="relative">
                <img
                  src={reward.image_url || 'https://via.placeholder.com/400x200?text=No+Image'}
                  alt={reward.name}
                  className="w-full h-44 object-cover"
                />
                <div className="absolute top-3 right-3">
                  <Badge variant={reward.is_active ? 'success' : 'neutral'} hasDot>
                    {reward.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {reward.category && (
                  <div className="absolute top-3 left-3">
                    <Badge variant="primary">{getCategoryLabel(reward.category)}</Badge>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-slate-800 text-lg leading-tight">{reward.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{reward.description}</p>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">คะแนน</p>
                    <p className="text-lg font-black text-primary">{reward.points_required.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">คงเหลือ</p>
                    <p className={`text-lg font-black ${reward.stock <= 5 ? 'text-danger' : 'text-slate-800'}`}>{reward.stock}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleEdit(reward)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-primary-50 hover:text-primary text-xs font-bold transition-all border border-slate-100"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    แก้ไข
                  </button>
                  <button
                    onClick={() => handleDelete(reward.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-red-50 hover:text-danger text-xs font-bold transition-all border border-slate-100"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    ลบ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingReward ? 'แก้ไขของรางวัล' : 'เพิ่มของรางวัลใหม่'}
        maxWidth="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>ยกเลิก</Button>
            <Button onClick={handleSubmit as any}>{editingReward ? 'บันทึก' : 'เพิ่ม'}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">ชื่อของรางวัล</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">คำอธิบาย</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" rows={3} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">คะแนนที่ใช้</label>
              <input type="number" value={formData.points_required} onChange={(e) => setFormData({ ...formData, points_required: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" min="1" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">จำนวนคงเหลือ</label>
              <input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" min="0" required />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">หมวดหมู่</label>
            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" required>
              <option value="">เลือกหมวดหมู่</option>
              <option value="food">อาหารและเครื่องดื่ม</option>
              <option value="voucher">บัตรกำนัล</option>
              <option value="product">สินค้า</option>
              <option value="service">บริการ</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">URL รูปภาพ</label>
            <input type="url" value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="https://example.com/image.jpg" />
          </div>
        </form>
      </Modal>
    </div>
  );
}
