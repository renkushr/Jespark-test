import { useState, useEffect } from 'react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';

interface PointsHistory {
  id: number;
  user_id: number;
  points: number;
  type: string;
  description: string;
  created_at: string;
  expires_at?: string;
  user?: { name: string; email: string };
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
  const token = localStorage.getItem('admin_token');
  const authHeaders: HeadersInit = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  useEffect(() => {
    if (activeTab === 'history') loadHistory();
    else loadExpiringPoints();
  }, [activeTab, filterType]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/admin/points/history?limit=100`;
      if (filterType) url += `&type=${filterType}`;
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
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
      const response = await fetch(`${API_BASE}/admin/points/expiring?days=${expiringDays}`, { headers: { 'Authorization': `Bearer ${token}` } });
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

  const showSuccess = (message: string) => { setSuccessMessage(message); setTimeout(() => setSuccessMessage(''), 3000); };
  const showError = (message: string) => { setErrorMessage(message); setTimeout(() => setErrorMessage(''), 3000); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalType === 'bulk') { if (!bulkUserIds || !points || !reason) return; await handleBulkAdd(); }
    else { if (!selectedUserId || !points || !reason) return; await handleSingleOperation(); }
  };

  const handleSingleOperation = async () => {
    setSubmitting(true);
    try {
      const endpoint = modalType === 'add' ? '/admin/points/add' : '/admin/points/deduct';
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST', headers: authHeaders,
        body: JSON.stringify({ userId: parseInt(selectedUserId), points: parseInt(points), title: reason, reason }),
      });
      if (response.ok) { showSuccess(`${modalType === 'add' ? 'เพิ่ม' : 'หัก'}คะแนนสำเร็จ`); closeModal(); loadHistory(); }
      else { const data = await response.json(); showError(data.error || 'เกิดข้อผิดพลาด'); }
    } catch (error) { console.error('Error:', error); showError('เกิดข้อผิดพลาดในการดำเนินการ'); }
    finally { setSubmitting(false); }
  };

  const handleBulkAdd = async () => {
    setSubmitting(true);
    try {
      const userIds = bulkUserIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      if (userIds.length === 0) { showError('กรุณาใส่ User IDs ที่ถูกต้อง'); setSubmitting(false); return; }
      const response = await fetch(`${API_BASE}/admin/points/bulk-add`, {
        method: 'POST', headers: authHeaders,
        body: JSON.stringify({ userIds, points: parseInt(points), description: reason }),
      });
      if (response.ok) { const data = await response.json(); showSuccess(`เพิ่มคะแนนสำเร็จ ${data.summary.successful}/${data.summary.total} คน`); closeModal(); loadHistory(); }
      else { const data = await response.json(); showError(data.error || 'เกิดข้อผิดพลาด'); }
    } catch (error) { console.error('Error:', error); showError('เกิดข้อผิดพลาดในการดำเนินการ'); }
    finally { setSubmitting(false); }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const response = await fetch(`${API_BASE}/admin/points/export?format=${format}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) {
        if (format === 'csv') {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = `points-history-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a); a.click(); document.body.removeChild(a); window.URL.revokeObjectURL(url);
        } else {
          const data = await response.json();
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = `points-history-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a); a.click(); document.body.removeChild(a); window.URL.revokeObjectURL(url);
        }
        showSuccess('Export สำเร็จ');
      }
    } catch (error) { console.error('Export error:', error); showError('ไม่สามารถ export ได้'); }
  };

  const closeModal = () => { setShowModal(false); setSelectedUserId(''); setBulkUserIds(''); setPoints(''); setReason(''); };
  const openModal = (type: 'add' | 'deduct' | 'bulk') => { setModalType(type); setShowModal(true); };

  const filteredHistory = history.filter(item => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return item.user?.name?.toLowerCase().includes(s) || item.user?.email?.toLowerCase().includes(s) || item.description?.toLowerCase().includes(s);
  });

  const tabs = [
    { key: 'history' as const, icon: 'history', label: 'ประวัติ' },
    { key: 'expiring' as const, icon: 'schedule', label: 'กำลังหมดอายุ' },
  ];

  const Loader = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
      <p className="text-sm text-slate-400 mt-3">กำลังโหลดข้อมูล...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Toast Messages */}
      {successMessage && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-success text-white rounded-xl shadow-lg animate-slideInRight">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span className="text-sm font-bold">{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-danger text-white rounded-xl shadow-lg animate-slideInRight">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span className="text-sm font-bold">{errorMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">จัดการคะแนน</h1>
          <p className="text-sm text-slate-500 mt-0.5">เพิ่ม หัก และดูประวัติคะแนนทั้งหมด</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="success" icon="add" size="sm" onClick={() => openModal('add')}>เพิ่มคะแนน</Button>
          <Button variant="danger" icon="remove" size="sm" onClick={() => openModal('deduct')}>หักคะแนน</Button>
          <Button variant="outline" icon="group_add" size="sm" onClick={() => openModal('bulk')}>เพิ่มหลายคน</Button>
          <Button variant="secondary" icon="download" size="sm" onClick={() => handleExport('csv')}>Export</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-fit overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.key ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">{tab.icon}</span>
            {tab.label}
            {tab.key === 'expiring' && expiringPoints.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-danger text-white text-[10px] font-bold rounded-full">{expiringPoints.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Filters */}
          <Card>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ, อีเมล, หรือรายละเอียด..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">ทุกประเภท</option>
                <option value="earned">ได้รับ</option>
                <option value="added">เพิ่มโดย Admin</option>
                <option value="deducted">หักโดย Admin</option>
                <option value="redeemed">ใช้แลกของรางวัล</option>
              </select>
            </div>
          </Card>

          <Card noPadding>
            {loading ? <Loader /> : filteredHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <span className="material-symbols-outlined text-slate-300 text-5xl">stars</span>
                <p className="text-sm text-slate-400 mt-3">ไม่พบประวัติ</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">วันที่</th>
                      <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">ลูกค้า</th>
                      <th className="px-3 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">ประเภท</th>
                      <th className="px-3 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">คะแนน</th>
                      <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">รายละเอียด</th>
                      <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">หมดอายุ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((item) => (
                      <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {new Date(item.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-800">{item.user?.name || `User #${item.user_id}`}</p>
                          <p className="text-[10px] text-slate-400">{item.user?.email}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={item.type === 'earned' || item.type === 'added' ? 'success' : 'danger'}>
                            {item.type === 'earned' ? 'ได้รับ' : item.type === 'added' ? 'เพิ่ม' : item.type === 'deducted' ? 'หัก' : 'ใช้'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-black ${item.points > 0 ? 'text-success' : 'text-danger'}`}>
                            {item.points > 0 ? '+' : ''}{item.points.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate">{item.description}</td>
                        <td className="px-4 py-3 text-xs text-slate-400">{item.expires_at ? new Date(item.expires_at).toLocaleDateString('th-TH') : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Expiring Tab */}
      {activeTab === 'expiring' && (
        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-600">แสดงคะแนนที่จะหมดอายุใน:</span>
              <select
                value={expiringDays}
                onChange={(e) => { setExpiringDays(parseInt(e.target.value)); loadExpiringPoints(); }}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="7">7 วัน</option>
                <option value="14">14 วัน</option>
                <option value="30">30 วัน</option>
                <option value="60">60 วัน</option>
                <option value="90">90 วัน</option>
              </select>
              <Button variant="outline" icon="refresh" size="sm" onClick={loadExpiringPoints}>รีเฟรช</Button>
            </div>
          </Card>

          <Card noPadding>
            {expiringLoading ? <Loader /> : expiringPoints.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <span className="material-symbols-outlined text-success text-5xl">verified</span>
                <p className="text-sm text-slate-400 mt-3">ไม่มีคะแนนที่กำลังจะหมดอายุ</p>
              </div>
            ) : (
              <>
                <div className="px-4 py-3 bg-amber-50 border-b border-amber-100">
                  <p className="text-sm text-amber-800 font-bold">
                    <span className="material-symbols-outlined text-[16px] align-middle mr-1">warning</span>
                    มี {expiringPoints.length} รายการที่จะหมดอายุใน {expiringDays} วัน
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[550px]">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">ลูกค้า</th>
                        <th className="px-3 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">คะแนน</th>
                        <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">หมดอายุ</th>
                        <th className="px-3 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">เหลือ</th>
                        <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">รายละเอียด</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expiringPoints.map((item) => (
                        <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-bold text-slate-800">{item.userName}</p>
                            <p className="text-[10px] text-slate-400">{item.userEmail}</p>
                          </td>
                          <td className="px-4 py-3 text-right font-black text-warning">{item.points.toLocaleString()}</td>
                          <td className="px-4 py-3 text-xs text-slate-500">{new Date(item.expiresAt).toLocaleDateString('th-TH')}</td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant={item.daysLeft <= 7 ? 'danger' : item.daysLeft <= 14 ? 'warning' : 'neutral'} hasDot>
                              {item.daysLeft} วัน
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-slate-600 text-xs">{item.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </Card>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={modalType === 'add' ? 'เพิ่มคะแนน' : modalType === 'deduct' ? 'หักคะแนน' : 'เพิ่มคะแนนหลายคน'}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal} disabled={submitting}>ยกเลิก</Button>
            <Button
              variant={modalType === 'deduct' ? 'danger' : 'success'}
              onClick={handleSubmit as any}
              isLoading={submitting}
            >
              ยืนยัน
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {modalType === 'bulk' ? (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">User IDs (คั่นด้วย ,)</label>
              <textarea
                value={bulkUserIds}
                onChange={(e) => setBulkUserIds(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="เช่น: 1, 2, 3, 4, 5"
                rows={3}
                required
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">User ID</label>
              <input
                type="number"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="ใส่ User ID"
                required
              />
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">จำนวนคะแนน {modalType === 'bulk' && '(ต่อคน)'}</label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="0"
              min="1"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">เหตุผล/รายละเอียด</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="ระบุเหตุผล..."
              rows={3}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
