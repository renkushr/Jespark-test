import { useState, useEffect } from 'react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
const getToken = () => localStorage.getItem('admin_token');

interface SlipTransaction {
  id: number;
  slipImageUrl: string;
  ocrAmount: number | null;
  confirmedAmount: number;
  pointsEarned: number;
  customerId: number;
  customerName: string;
  staffName: string;
  status: string;
  note: string | null;
  createdAt: string;
  confirmedAt: string | null;
}

export default function SlipLog() {
  const [logs, setLogs] = useState<SlipTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [staffFilter, setStaffFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Detail modal
  const [selectedLog, setSelectedLog] = useState<SlipTransaction | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // Image modal
  const [showImage, setShowImage] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => { loadLogs(); }, [statusFilter, staffFilter, dateFrom, dateTo]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (staffFilter) params.append('staffName', staffFilter);
      if (dateFrom) params.append('dateFrom', new Date(dateFrom).toISOString());
      if (dateTo) params.append('dateTo', new Date(dateTo + 'T23:59:59').toISOString());
      params.append('limit', '100');

      const res = await fetch(`${API_BASE}/slip-cashier/logs?${params}`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setTotal(data.total || 0);
        setError('');
      } else {
        throw new Error('Failed to load');
      }
    } catch (err: any) {
      console.error('Error loading logs:', err);
      setError(err.message || 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const openDetail = (log: SlipTransaction) => {
    setSelectedLog(log);
    setShowDetail(true);
  };

  const openImage = (url: string) => {
    setImageUrl(url);
    setShowImage(true);
  };

  // Stats
  const totalAmount = logs.reduce((sum, l) => sum + (l.confirmedAmount || 0), 0);
  const totalPoints = logs.reduce((sum, l) => sum + (l.pointsEarned || 0), 0);
  const confirmedCount = logs.filter(l => l.status === 'confirmed').length;

  const Loader = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
      <p className="text-sm text-slate-400 mt-3">กำลังโหลดข้อมูล...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">ประวัติสลิป</h1>
        <p className="text-sm text-slate-500 mt-0.5">ดู log สลิปทั้งหมด พร้อมรูปแนบ พนักงาน และรายละเอียด</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { icon: 'receipt_long', label: 'รายการทั้งหมด', value: total.toLocaleString(), color: 'bg-primary-50 text-primary' },
          { icon: 'check_circle', label: 'ยืนยันแล้ว', value: confirmedCount.toLocaleString(), color: 'bg-emerald-50 text-success' },
          { icon: 'payments', label: 'ยอดรวม', value: `฿${totalAmount.toLocaleString()}`, color: 'bg-sky-50 text-sky-600' },
          { icon: 'stars', label: 'แต้มรวม', value: totalPoints.toLocaleString(), color: 'bg-amber-50 text-amber-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color.split(' ')[0]}`}>
                <span className={`material-symbols-outlined text-[18px] ${s.color.split(' ')[1]}`}>{s.icon}</span>
              </div>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</p>
            <p className="text-lg sm:text-xl font-black text-slate-800 mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">ทุกสถานะ</option>
            <option value="confirmed">ยืนยันแล้ว</option>
            <option value="pending">รอดำเนินการ</option>
            <option value="rejected">ปฏิเสธ</option>
          </select>

          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
            <input
              type="text"
              placeholder="ค้นหาพนักงาน..."
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
            />
          </div>

          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />

          <Button variant="secondary" icon="refresh" size="sm" onClick={loadLogs}>รีเฟรช</Button>
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
          <Button variant="danger" size="sm" onClick={loadLogs}>ลองอีกครั้ง</Button>
        </div>
      )}

      {/* Table */}
      {loading ? <Loader /> : !error && (
        <Card noPadding>
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <span className="material-symbols-outlined text-slate-300 text-5xl">receipt_long</span>
              <p className="text-sm text-slate-400 mt-3">ยังไม่มีประวัติสลิป</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">สลิป</th>
                    <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">ลูกค้า</th>
                    <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">พนักงาน</th>
                    <th className="px-3 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">ยอดเงิน</th>
                    <th className="px-3 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">แต้ม</th>
                    <th className="px-3 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">สถานะ</th>
                    <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">วันที่</th>
                    <th className="px-3 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">ดู</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-3 py-3">
                        <button
                          onClick={() => openImage(log.slipImageUrl)}
                          className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden hover:ring-2 hover:ring-primary/30 transition-all"
                        >
                          <img src={log.slipImageUrl} alt="slip" className="w-full h-full object-cover" />
                        </button>
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-bold text-slate-800">{log.customerName || '-'}</p>
                      </td>
                      <td className="px-3 py-3 text-slate-600">{log.staffName}</td>
                      <td className="px-3 py-3 text-right font-black text-slate-800">฿{log.confirmedAmount?.toLocaleString()}</td>
                      <td className="px-3 py-3 text-right font-black text-success">+{log.pointsEarned?.toLocaleString()}</td>
                      <td className="px-3 py-3 text-center">
                        <Badge variant={log.status === 'confirmed' ? 'success' : log.status === 'rejected' ? 'danger' : 'warning'} hasDot>
                          {log.status === 'confirmed' ? 'ยืนยัน' : log.status === 'rejected' ? 'ปฏิเสธ' : 'รอ'}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-500">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button onClick={() => openDetail(log)} className="p-1.5 hover:bg-primary-50 rounded-lg transition-colors">
                          <span className="material-symbols-outlined text-primary text-[18px]">visibility</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Pagination info */}
      {!loading && !error && logs.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">แสดง <span className="font-bold text-slate-600">{logs.length}</span> จาก <span className="font-bold text-slate-600">{total}</span> รายการ</p>
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={showDetail && !!selectedLog} onClose={() => setShowDetail(false)} title="รายละเอียดสลิป" maxWidth="lg"
        footer={<Button variant="secondary" onClick={() => setShowDetail(false)}>ปิด</Button>}
      >
        {selectedLog && (
          <div className="space-y-4">
            {/* Slip Image */}
            <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
              <img
                src={selectedLog.slipImageUrl}
                alt="slip"
                className="w-full max-h-96 object-contain rounded-lg cursor-pointer"
                onClick={() => { setShowDetail(false); openImage(selectedLog.slipImageUrl); }}
              />
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-primary-50 rounded-xl p-3 text-center border border-primary-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">ยอดเงิน</p>
                <p className="text-xl font-black text-primary">฿{selectedLog.confirmedAmount?.toLocaleString()}</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">แต้ม</p>
                <p className="text-xl font-black text-success">+{selectedLog.pointsEarned?.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { label: 'ลูกค้า', value: selectedLog.customerName || '-' },
                { label: 'พนักงาน', value: selectedLog.staffName },
                { label: 'สถานะ', value: selectedLog.status === 'confirmed' ? 'ยืนยันแล้ว' : selectedLog.status === 'rejected' ? 'ปฏิเสธ' : 'รอดำเนินการ' },
                { label: 'OCR อ่านได้', value: selectedLog.ocrAmount ? `฿${selectedLog.ocrAmount.toLocaleString()}` : 'ไม่มี' },
                { label: 'วันที่สร้าง', value: selectedLog.createdAt ? new Date(selectedLog.createdAt).toLocaleString('th-TH') : '-' },
                { label: 'วันที่ยืนยัน', value: selectedLog.confirmedAt ? new Date(selectedLog.confirmedAt).toLocaleString('th-TH') : '-' },
                { label: 'หมายเหตุ', value: selectedLog.note || '-' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between text-sm py-1 border-b border-slate-50 last:border-b-0">
                  <span className="text-slate-400">{item.label}</span>
                  <span className="font-bold text-slate-800">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Full Image Modal */}
      <Modal isOpen={showImage} onClose={() => setShowImage(false)} title="รูปสลิป" maxWidth="lg"
        footer={<Button variant="secondary" onClick={() => setShowImage(false)}>ปิด</Button>}
      >
        <div className="bg-slate-50 rounded-xl p-2">
          <img src={imageUrl} alt="slip full" className="w-full object-contain rounded-lg" />
        </div>
      </Modal>
    </div>
  );
}
