import { useState, useEffect } from 'react';

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
    name: '',
    description: '',
    points_required: '',
    category: '',
    image_url: '',
    stock: '',
  });

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'}/rewards`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setRewards(data.rewards || []);
      }
    } catch (error) {
      console.error('Error loading rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingReward 
        ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'}/admin/rewards/${editingReward.id}`
        : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'}/admin/rewards`;
      
      const response = await fetch(url, {
        method: editingReward ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify({
          ...formData,
          points_required: parseInt(formData.points_required),
          stock: parseInt(formData.stock),
        }),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingReward(null);
        setFormData({ name: '', description: '', points_required: '', category: '', image_url: '', stock: '' });
        loadRewards();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (reward: Reward) => {
    setEditingReward(reward);
    setFormData({
      name: reward.name,
      description: reward.description,
      points_required: reward.points_required.toString(),
      category: reward.category,
      image_url: reward.image_url,
      stock: reward.stock.toString(),
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('ต้องการลบของรางวัลนี้?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'}/admin/rewards/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });

      if (response.ok) {
        loadRewards();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">จัดการของรางวัล</h1>
        <button
          onClick={() => {
            setEditingReward(null);
            setFormData({ name: '', description: '', points_required: '', category: '', image_url: '', stock: '' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-dark-green transition-colors"
        >
          <span className="material-symbols-outlined">add</span>
          เพิ่มของรางวัล
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => (
            <div key={reward.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <img
                src={reward.image_url || 'https://via.placeholder.com/400x200'}
                alt={reward.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-800">{reward.name}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    reward.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {reward.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{reward.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-gray-500">คะแนนที่ใช้</p>
                    <p className="text-lg font-bold text-primary">{reward.points_required.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">คงเหลือ</p>
                    <p className="text-lg font-bold text-gray-800">{reward.stock}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(reward)}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    แก้ไข
                  </button>
                  <button
                    onClick={() => handleDelete(reward.id)}
                    className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editingReward ? 'แก้ไขของรางวัล' : 'เพิ่มของรางวัลใหม่'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อของรางวัล</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">คำอธิบาย</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">คะแนนที่ใช้</label>
                  <input
                    type="number"
                    value={formData.points_required}
                    onChange={(e) => setFormData({ ...formData, points_required: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">จำนวนคงเหลือ</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">หมวดหมู่</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">เลือกหมวดหมู่</option>
                  <option value="food">อาหารและเครื่องดื่ม</option>
                  <option value="voucher">บัตรกำนัล</option>
                  <option value="product">สินค้า</option>
                  <option value="service">บริการ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL รูปภาพ</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-dark-green transition-colors"
                >
                  {editingReward ? 'บันทึก' : 'เพิ่ม'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
