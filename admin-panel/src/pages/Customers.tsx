import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [pointsAmount, setPointsAmount] = useState('');
  const [pointsDescription, setPointsDescription] = useState('');
  const [addingPoints, setAddingPoints] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, [searchTerm, tierFilter]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getCustomers({
        search: searchTerm,
        tier: tierFilter,
        limit: 100
      });
      setCustomers(response.customers || []);
      setError('');
    } catch (err: any) {
      console.error('Error loading customers:', err);
      setError(err.message || 'ไม่สามารถโหลดข้อมูลลูกค้าได้');
    } finally {
      setLoading(false);
    }
  };

  const getTierBadgeClass = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'platinum': return 'bg-purple-100 text-purple-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const handleOpenPointsModal = (customer: any) => {
    setSelectedCustomer(customer);
    setPointsAmount('');
    setPointsDescription('');
    setShowPointsModal(true);
  };

  const handleClosePointsModal = () => {
    setShowPointsModal(false);
    setSelectedCustomer(null);
    setPointsAmount('');
    setPointsDescription('');
  };

  const handleAddPoints = async () => {
    if (!selectedCustomer || !pointsAmount || parseFloat(pointsAmount) <= 0) {
      alert('กรุณาใส่จำนวนคะแนนที่ถูกต้อง');
      return;
    }

    try {
      setAddingPoints(true);
      await apiClient.addPoints(
        selectedCustomer.id,
        parseFloat(pointsAmount),
        pointsDescription || 'เพิ่มคะแนนจาก Admin'
      );
      
      alert('เพิ่มคะแนนสำเร็จ!');
      handleClosePointsModal();
      loadCustomers(); // Reload customers to show updated points
    } catch (err: any) {
      console.error('Error adding points:', err);
      alert(err.message || 'ไม่สามารถเพิ่มคะแนนได้');
    } finally {
      setAddingPoints(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">จัดการลูกค้า</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-dark-green transition-colors">
          <span className="material-symbols-outlined">person_add</span>
          เพิ่มลูกค้า
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="ค้นหาด้วยชื่อ, อีเมล, หรือรหัสสมาชิก..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select 
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">ทุก Tier</option>
            <option value="member">Member</option>
            <option value="silver">Silver</option>
            <option value="gold">Gold</option>
            <option value="platinum">Platinum</option>
          </select>
          <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          <p className="font-medium">เกิดข้อผิดพลาด</p>
          <p className="text-sm mt-1">{error}</p>
          <button 
            onClick={loadCustomers}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            ลองอีกครั้ง
          </button>
        </div>
      )}

      {/* Customers Table */}
      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {customers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg font-medium">ไม่พบข้อมูลลูกค้า</p>
              <p className="text-sm mt-2">ลองค้นหาด้วยคำอื่นหรือเปลี่ยนตัวกรอง</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    รหัสสมาชิก
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ชื่อ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    อีเมล
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    คะแนน
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {customer.member_id || customer.memberId || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.display_name || customer.name || 'ไม่ระบุชื่อ'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTierBadgeClass(customer.tier || 'member')}`}>
                        {customer.tier || 'Member'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(customer.points || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        customer.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {customer.is_verified ? 'Active' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenPointsModal(customer)}
                          className="text-green-600 hover:text-green-800"
                          title="ให้คะแนน"
                        >
                          <span className="material-symbols-outlined">add_circle</span>
                        </button>
                        <Link
                          to={`/customers/${customer.id}`}
                          className="text-primary hover:text-dark-green"
                          title="ดูรายละเอียด"
                        >
                          <span className="material-symbols-outlined">visibility</span>
                        </Link>
                        <button className="text-blue-600 hover:text-blue-800" title="แก้ไข">
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && customers.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            แสดง <span className="font-medium">1</span> ถึง <span className="font-medium">{customers.length}</span> จาก{' '}
            <span className="font-medium">{customers.length}</span> รายการ
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50" disabled>
              ก่อนหน้า
            </button>
            <button className="px-3 py-1 bg-primary text-white rounded-lg">1</button>
            <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50" disabled>
              ถัดไป
            </button>
          </div>
        </div>
      )}

      {/* Add Points Modal */}
      {showPointsModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">ให้คะแนน</h2>
              <button
                onClick={handleClosePointsModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">ลูกค้า</p>
              <p className="text-lg font-semibold text-gray-800">
                {selectedCustomer.display_name || selectedCustomer.name || 'ไม่ระบุชื่อ'}
              </p>
              <p className="text-sm text-gray-500">
                คะแนนปัจจุบัน: <span className="font-semibold">{(selectedCustomer.points || 0).toLocaleString()}</span>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  จำนวนคะแนน *
                </label>
                <input
                  type="number"
                  value={pointsAmount}
                  onChange={(e) => setPointsAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="ใส่จำนวนคะแนน"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  หมายเหตุ (ไม่บังคับ)
                </label>
                <input
                  type="text"
                  value={pointsDescription}
                  onChange={(e) => setPointsDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="เช่น ซื้อสินค้า, โปรโมชั่น"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleClosePointsModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={addingPoints}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleAddPoints}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-dark-green transition-colors disabled:opacity-50"
                disabled={addingPoints}
              >
                {addingPoints ? 'กำลังเพิ่ม...' : 'เพิ่มคะแนน'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
