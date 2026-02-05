import { useState, useEffect } from 'react';

interface PointsHistory {
  id: number;
  user_id: number;
  points: number;
  type: string;
  description: string;
  created_at: string;
  expires_at?: string;
  user?: {
    name: string;
    email: string;
  };
}

interface ExpiringPoint {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  points: number;
  expiresAt: string;
  daysLeft: number;
  description: string;
}

export default function Points() {
  const [history, setHistory] = useState<PointsHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'deduct' | 'bulk'>('add');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [bulkUserIds, setBulkUserIds] = useState('');
  const [points, setPoints] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'history' | 'expiring'>('history');
  const [expiringPoints, setExpiringPoints] = useState<ExpiringPoint[]>([]);
  const [expiringDays, setExpiringDays] = useState(30);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [expiringLoading, setExpiringLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    } else {
      loadExpiringPoints();
    }
  }, [activeTab, filterType]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/admin/points/history?limit=100`;
      if (filterType) {
        url += `&type=${filterType}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Error loading history:', error);
      showError('ไม่สามารถโหลดประวัติได้');
    } finally {
      setLoading(false);
    }
  };

  const loadExpiringPoints = async () => {
    setExpiringLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/points/expiring?days=${expiringDays}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setExpiringPoints(data.expiringPoints || []);
      }
    } catch (error) {
      console.error('Error loading expiring points:', error);
      showError('ไม่สามารถโหลดคะแนนที่กำลังหมดอายุได้');
    } finally {
      setExpiringLoading(false);
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (modalType === 'bulk') {
      if (!bulkUserIds || !points || !reason) return;
      await handleBulkAdd();
    } else {
      if (!selectedUserId || !points || !reason) return;
      await handleSingleOperation();
    }
  };

  const handleSingleOperation = async () => {
    setSubmitting(true);
    try {
      const endpoint = modalType === 'add' ? '/users/points/add' : '/admin/points/deduct';
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify({
          userId: parseInt(selectedUserId),
          points: parseInt(points),
          title: reason,
          reason: reason,
        }),
      });

      if (response.ok) {
        showSuccess(`${modalType === 'add' ? 'เพิ่ม' : 'หัก'}คะแนนสำเร็จ`);
        closeModal();
        loadHistory();
      } else {
        const data = await response.json();
        showError(data.error || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error:', error);
      showError('เกิดข้อผิดพลาดในการดำเนินการ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkAdd = async () => {
    setSubmitting(true);
    try {
      const userIds = bulkUserIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      
      if (userIds.length === 0) {
        showError('กรุณาใส่ User IDs ที่ถูกต้อง');
        setSubmitting(false);
        return;
      }

      const response = await fetch(`${API_BASE}/admin/points/bulk-add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify({
          userIds,
          points: parseInt(points),
          description: reason,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        showSuccess(`เพิ่มคะแนนสำเร็จ ${data.summary.successful}/${data.summary.total} คน`);
        closeModal();
        loadHistory();
      } else {
        const data = await response.json();
        showError(data.error || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error:', error);
      showError('เกิดข้อผิดพลาดในการดำเนินการ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const response = await fetch(`${API_BASE}/admin/points/export?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });

      if (response.ok) {
        if (format === 'csv') {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `points-history-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        } else {
          const data = await response.json();
          const json = JSON.stringify(data, null, 2);
          const blob = new Blob([json], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `points-history-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }
        showSuccess('Export สำเร็จ');
      }
    } catch (error) {
      console.error('Export error:', error);
      showError('ไม่สามารถ export ได้');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUserId('');
    setBulkUserIds('');
    setPoints('');
    setReason('');
  };

  const openModal = (type: 'add' | 'deduct' | 'bulk') => {
    setModalType(type);
    setShowModal(true);
  };

  const filteredHistory = history.filter(item => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        item.user?.name?.toLowerCase().includes(search) ||
        item.user?.email?.toLowerCase().includes(search) ||
        item.description?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          ✅ {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          ❌ {errorMessage}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">จัดการคะแนน</h1>
        <div className="flex gap-3">
          <button
            onClick={() => openModal('add')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <span className="material-symbols-outlined">add</span>
            เพิ่มคะแนน
          </button>
          <button
            onClick={() => openModal('deduct')}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <span className="material-symbols-outlined">remove</span>
            หักคะแนน
          </button>
          <button
            onClick={() => openModal('bulk')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span className="material-symbols-outlined">group_add</span>
            เพิ่มหลายคน
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <span className="material-symbols-outlined">download</span>
            Export CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'history'
                ? 'text-primary border-b-2 border-primary bg-green-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            📜 ประวัติการเปลี่ยนแปลง
          </button>
          <button
            onClick={() => setActiveTab('expiring')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'expiring'
                ? 'text-primary border-b-2 border-primary bg-green-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            ⏰ คะแนนที่กำลังหมดอายุ
          </button>
        </div>

        <div className="p-6">
          {/* History Tab */}
          {activeTab === 'history' && (
            <>
              {/* Filters */}
              <div className="mb-6 flex gap-4">
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ, อีเมล, หรือรายละเอียด..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">ทุกประเภท</option>
                  <option value="earned">ได้รับ</option>
                  <option value="added">เพิ่มโดย Admin</option>
                  <option value="deducted">หักโดย Admin</option>
                  <option value="redeemed">ใช้แลกของรางวัล</option>
                </select>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                  <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-gray-600 text-lg">ไม่พบประวัติ</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ลูกค้า</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ประเภท</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">คะแนน</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">รายละเอียด</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">หมดอายุ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {filteredHistory.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(item.created_at).toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {item.user?.name || `User #${item.user_id}`}
                            </div>
                            <div className="text-xs text-gray-500">{item.user?.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              item.type === 'earned' || item.type === 'added' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {item.type === 'earned' ? 'ได้รับ' : 
                               item.type === 'added' ? 'เพิ่ม' :
                               item.type === 'deducted' ? 'หัก' : 'ใช้'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                            <span className={item.points > 0 ? 'text-green-600' : 'text-red-600'}>
                              {item.points > 0 ? '+' : ''}{item.points.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {item.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.expires_at ? new Date(item.expires_at).toLocaleDateString('th-TH') : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Expiring Points Tab */}
          {activeTab === 'expiring' && (
            <>
              {/* Days Filter */}
              <div className="mb-6 flex gap-4 items-center">
                <label className="text-sm font-medium text-gray-700">แสดงคะแนนที่จะหมดอายุใน:</label>
                <select
                  value={expiringDays}
                  onChange={(e) => {
                    setExpiringDays(parseInt(e.target.value));
                    loadExpiringPoints();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="7">7 วัน</option>
                  <option value="14">14 วัน</option>
                  <option value="30">30 วัน</option>
                  <option value="60">60 วัน</option>
                  <option value="90">90 วัน</option>
                </select>
                <button
                  onClick={loadExpiringPoints}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-dark-green transition-colors"
                >
                  รีเฟรช
                </button>
              </div>

              {expiringLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                  <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
                </div>
              ) : expiringPoints.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">✅</div>
                  <p className="text-gray-600 text-lg">ไม่มีคะแนนที่กำลังจะหมดอายุ</p>
                </div>
              ) : (
                <>
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800">
                      <strong>คำเตือน:</strong> มี {expiringPoints.length} รายการที่จะหมดอายุใน {expiringDays} วันข้างหน้า
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ลูกค้า</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">คะแนน</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">หมดอายุ</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">เหลือเวลา</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">รายละเอียด</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {expiringPoints.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{item.userName}</div>
                              <div className="text-xs text-gray-500">{item.userEmail}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-orange-600">
                              {item.points.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(item.expiresAt).toLocaleDateString('th-TH')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                item.daysLeft <= 7 ? 'bg-red-100 text-red-800' :
                                item.daysLeft <= 14 ? 'bg-orange-100 text-orange-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {item.daysLeft} วัน
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {item.description}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {modalType === 'add' ? 'เพิ่มคะแนน' : 
                 modalType === 'deduct' ? 'หักคะแนน' : 
                 'เพิ่มคะแนนหลายคน'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {modalType === 'bulk' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User IDs (คั่นด้วยเครื่องหมายจุลภาค)
                  </label>
                  <textarea
                    value={bulkUserIds}
                    onChange={(e) => setBulkUserIds(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="เช่น: 1, 2, 3, 4, 5"
                    rows={3}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">ใส่ User ID คั่นด้วยเครื่องหมายจุลภาค (,)</p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                  <input
                    type="number"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="ใส่ User ID"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  จำนวนคะแนน {modalType === 'bulk' && '(ต่อคน)'}
                </label>
                <input
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">เหตุผล/รายละเอียด</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="ระบุเหตุผล..."
                  rows={3}
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={submitting}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                    modalType === 'add' || modalType === 'bulk'
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {submitting ? 'กำลังดำเนินการ...' : 'ยืนยัน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
