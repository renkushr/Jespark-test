import { useState, useEffect } from 'react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  tier: string;
  points: number;
  walletBalance: number;
  avatar?: string;
}

interface Transaction {
  id: number;
  customerId: number;
  customerName: string;
  amount: number;
  discount: number;
  finalAmount: number;
  pointsEarned: number;
  pointsUsed: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

export default function Cashier() {
  const [searchQuery, setSearchQuery] = useState('');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [amount, setAmount] = useState('');
  const [usePoints, setUsePoints] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'checkout' | 'history' | 'summary'>('checkout');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
  const token = localStorage.getItem('admin_token');
  const authHeaders: HeadersInit = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  useEffect(() => {
    if (activeTab === 'history') loadTransactions();
    else if (activeTab === 'summary') loadSummary();
  }, [activeTab]);

  const loadTransactions = async () => {
    setHistoryLoading(true);
    try {
      const response = await fetch(`${API_BASE}/cashier/transactions?limit=50`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadSummary = async () => {
    setSummaryLoading(true);
    try {
      const response = await fetch(`${API_BASE}/cashier/my-summary`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (error) {
      console.error('Error loading summary:', error);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    setError('');
    setCustomer(null);
    try {
      const response = await fetch(`${API_BASE}/cashier/search?q=${encodeURIComponent(searchQuery)}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!response.ok) throw new Error('Customer not found');
      const data = await response.json();
      setCustomer(data.user);
      setSearchQuery('');
      setUsePoints(0);
    } catch (err: any) {
      setError(err.message || 'ไม่พบลูกค้า');
    } finally {
      setSearching(false);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || !amount || parseFloat(amount) <= 0) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const endpoint = usePoints > 0 ? '/cashier/checkout-with-points' : '/cashier/checkout';
      const body: any = { customerId: customer.id, amount: parseFloat(amount), paymentMethod };
      if (usePoints > 0) body.usePoints = usePoints;

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Checkout failed');
      }
      const data = await response.json();
      const finalAmt = data.transaction?.finalAmount || data.transaction?.amount || parseFloat(amount);
      const earned = data.transaction?.pointsEarned || data.earnedPoints || 0;
      const disc = data.transaction?.discount || 0;

      let msg = `สำเร็จ! ยอดชำระ ฿${finalAmt.toFixed(2)}`;
      if (disc > 0) msg += ` (ส่วนลด ฿${disc.toFixed(2)})`;
      msg += ` | ได้รับ +${earned} คะแนน`;

      setSuccess(msg);
      setAmount('');
      setUsePoints(0);
      setCustomer({ ...customer, points: data.customer?.points || data.totalPoints || customer.points });
      setTimeout(() => { setSuccess(''); setCustomer(null); setPaymentMethod('cash'); }, 4000);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (transactionId: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการคืนเงินรายการนี้?')) return;
    try {
      const reason = prompt('กรุณาระบุเหตุผล:');
      if (!reason) return;
      const response = await fetch(`${API_BASE}/cashier/refund/${transactionId}`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ reason }),
      });
      if (response.ok) { alert('คืนเงินสำเร็จ'); loadTransactions(); }
      else { const data = await response.json(); alert(data.error || 'เกิดข้อผิดพลาด'); }
    } catch (error) {
      console.error('Refund error:', error);
      alert('เกิดข้อผิดพลาด');
    }
  };

  const POINTS_PER_BAHT = 100;
  const calcDiscount = () => Math.min(usePoints / POINTS_PER_BAHT, parseFloat(amount) || 0);
  const calcFinal = () => Math.max(0, (parseFloat(amount) || 0) - calcDiscount());
  const calcPoints = () => Math.floor(calcFinal() / 35) * 5;

  const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

  const tabs = [
    { key: 'checkout' as const, icon: 'point_of_sale', label: 'ชำระเงิน' },
    { key: 'history' as const, icon: 'receipt_long', label: 'ประวัติ' },
    { key: 'summary' as const, icon: 'analytics', label: 'สรุปยอด' },
  ];

  const paymentMethods = [
    { key: 'cash', icon: 'payments', label: 'เงินสด' },
    { key: 'card', icon: 'credit_card', label: 'บัตร' },
    { key: 'qr', icon: 'qr_code', label: 'QR Code' },
  ];

  const Loader = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
      <p className="text-sm text-slate-400 mt-3">กำลังโหลดข้อมูล...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Cashier System</h1>
        <p className="text-sm text-slate-500 mt-0.5">ระบบให้คะแนนและขายหน้าร้าน · ทุก 35 บาท = 5 แต้ม</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-fit overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ==================== CHECKOUT TAB ==================== */}
      {activeTab === 'checkout' && (
        <div className="space-y-5">
          {/* Search */}
          <Card>
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาด้วยเบอร์โทร, อีเมล หรือชื่อ..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
                  disabled={searching}
                />
              </div>
              <Button type="submit" icon="search" isLoading={searching} disabled={!searchQuery.trim()}>
                ค้นหา
              </Button>
            </form>
          </Card>

          {/* Alerts */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl animate-fadeIn">
              <span className="material-symbols-outlined text-danger text-[20px]">error</span>
              <p className="text-sm font-medium text-red-800 flex-1">{error}</p>
              <button onClick={() => setError('')} className="p-1 hover:bg-red-100 rounded-lg"><span className="material-symbols-outlined text-red-400 text-[18px]">close</span></button>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-fadeIn">
              <span className="material-symbols-outlined text-success text-[20px]">check_circle</span>
              <p className="text-sm font-bold text-emerald-800 flex-1">{success}</p>
            </div>
          )}

          {/* Customer Card + Checkout */}
          {customer && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Customer header */}
              <div className="bg-gradient-to-r from-primary-900 via-primary to-primary-600 p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                    {customer.avatar ? (
                      <img src={customer.avatar} alt={customer.name} className="w-full h-full rounded-2xl object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-3xl">person</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-black truncate">{customer.name}</h3>
                    <p className="text-white/70 text-sm">{customer.phone} · {customer.email}</p>
                  </div>
                  <Badge variant="info" className="!bg-white/20 !text-white !border-white/30">{customer.tier}</Badge>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 p-4 sm:p-5 bg-slate-50 border-b border-slate-100">
                <div className="bg-white rounded-xl p-4 text-center border border-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">คะแนนปัจจุบัน</p>
                  <p className="text-2xl font-black text-primary">{customer.points.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center border border-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">ยอดในกระเป๋า</p>
                  <p className="text-2xl font-black text-slate-800">฿{customer.walletBalance?.toLocaleString() || '0'}</p>
                </div>
              </div>

              {/* Checkout form */}
              <form onSubmit={handleCheckout} className="p-5 space-y-5">
                {/* Amount */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">ยอดซื้อ (บาท)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-4 border border-slate-200 rounded-xl text-3xl font-black text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    disabled={loading}
                    required
                  />
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {quickAmounts.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setAmount(amt.toString())}
                        className="py-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-primary-50 hover:text-primary text-sm font-bold transition-all border border-slate-100"
                      >
                        {amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Use Points */}
                {customer.points > 0 && amount && parseFloat(amount) > 0 && (
                  <div className="space-y-2 bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">ใช้คะแนนแลกส่วนลด</label>
                      <span className="text-[10px] font-medium text-slate-400">100 คะแนน = 1 บาท</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={Math.min(customer.points, Math.ceil((parseFloat(amount) || 0) * POINTS_PER_BAHT))}
                      step={POINTS_PER_BAHT}
                      value={usePoints}
                      onChange={(e) => setUsePoints(parseInt(e.target.value))}
                      className="w-full accent-primary"
                      disabled={loading}
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>0</span>
                      <span className="text-base font-black text-primary">{usePoints} คะแนน (= ฿{(usePoints / POINTS_PER_BAHT).toFixed(2)})</span>
                      <span>{Math.min(customer.points, Math.ceil((parseFloat(amount) || 0) * POINTS_PER_BAHT)).toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {/* Payment Method */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">วิธีชำระเงิน</label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {paymentMethods.map((pm) => (
                      <button
                        key={pm.key}
                        type="button"
                        onClick={() => setPaymentMethod(pm.key)}
                        className={`flex flex-col items-center gap-1 sm:gap-1.5 p-3 sm:p-4 rounded-xl border-2 transition-all ${
                          paymentMethod === pm.key
                            ? 'border-primary bg-primary-50 text-primary'
                            : 'border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[24px]">{pm.icon}</span>
                        <p className="text-xs font-bold">{pm.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                {amount && parseFloat(amount) > 0 && (
                  <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>ยอดซื้อ</span>
                      <span className="font-bold">฿{parseFloat(amount).toFixed(2)}</span>
                    </div>
                    {usePoints > 0 && (
                      <div className="flex justify-between text-sm text-danger">
                        <span>ส่วนลด ({usePoints} คะแนน)</span>
                        <span className="font-bold">-฿{calcDiscount().toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-black text-slate-900 pt-2 border-t border-primary-100">
                      <span>ยอดชำระ</span>
                      <span>฿{calcFinal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-primary-100">
                      <span className="text-slate-500">คะแนนที่จะได้รับ</span>
                      <span className="text-lg font-black text-success">+{calcPoints()} คะแนน</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => { setCustomer(null); setAmount(''); setUsePoints(0); setPaymentMethod('cash'); }}
                    disabled={loading}
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    type="submit"
                    fullWidth
                    icon="check_circle"
                    isLoading={loading}
                    disabled={!amount || parseFloat(amount) <= 0}
                  >
                    ยืนยันชำระเงิน
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Instructions */}
          {!customer && !error && !success && (
            <Card>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-[20px]">info</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-2">วิธีใช้งาน</h3>
                  <ol className="space-y-1.5 text-sm text-slate-600">
                    <li><span className="font-bold text-primary mr-1">1.</span> ค้นหาลูกค้าด้วยเบอร์โทร, อีเมล หรือชื่อ</li>
                    <li><span className="font-bold text-primary mr-1">2.</span> ใส่ยอดซื้อ หรือคลิกปุ่มจำนวนด่วน</li>
                    <li><span className="font-bold text-primary mr-1">3.</span> เลือกใช้คะแนนแลกส่วนลด (ถ้าต้องการ)</li>
                    <li><span className="font-bold text-primary mr-1">4.</span> เลือกวิธีชำระเงิน แล้วกดยืนยัน</li>
                    <li><span className="font-bold text-primary mr-1">5.</span> ระบบจะให้คะแนนอัตโนมัติ (ทุก 35 บาท = 5 แต้ม)</li>
                  </ol>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ==================== HISTORY TAB ==================== */}
      {activeTab === 'history' && (
        <Card noPadding>
          {historyLoading ? <Loader /> : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <span className="material-symbols-outlined text-slate-300 text-5xl">receipt_long</span>
              <p className="text-sm text-slate-400 mt-3">ยังไม่มีประวัติธุรกรรม</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">ID</th>
                    <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">ลูกค้า</th>
                    <th className="px-3 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">ยอดเงิน</th>
                    <th className="px-3 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">ส่วนลด</th>
                    <th className="px-3 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">ชำระ</th>
                    <th className="px-3 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">คะแนน</th>
                    <th className="px-3 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">สถานะ</th>
                    <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">วันที่</th>
                    <th className="px-3 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400"></th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-3 py-3 font-bold text-slate-500">#{t.id}</td>
                      <td className="px-3 py-3 font-bold text-slate-800">{t.customerName}</td>
                      <td className="px-3 py-3 text-right text-slate-600">฿{t.amount?.toFixed(2)}</td>
                      <td className="px-3 py-3 text-right text-danger">{t.discount > 0 ? `-฿${t.discount.toFixed(2)}` : '-'}</td>
                      <td className="px-3 py-3 text-right font-bold text-slate-900">฿{t.finalAmount?.toFixed(2)}</td>
                      <td className="px-3 py-3 text-center">
                        <span className="text-success font-bold">+{t.pointsEarned}</span>
                        {t.pointsUsed > 0 && <span className="text-danger font-bold ml-1">-{t.pointsUsed}</span>}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <Badge variant={t.status === 'completed' ? 'success' : 'danger'} hasDot>
                          {t.status === 'completed' ? 'สำเร็จ' : 'คืนเงิน'}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-slate-500 text-xs">{new Date(t.createdAt).toLocaleString('th-TH')}</td>
                      <td className="px-3 py-3 text-center">
                        {t.status === 'completed' && (
                          <button onClick={() => handleRefund(t.id)} className="text-xs font-bold text-danger hover:underline">คืนเงิน</button>
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

      {/* ==================== SUMMARY TAB ==================== */}
      {activeTab === 'summary' && (
        <div className="space-y-5">
          {summaryLoading ? <Loader /> : summary ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { label: 'ธุรกรรมทั้งหมด', value: summary.totalTransactions, sub: `สำเร็จ: ${summary.completedTransactions}`, icon: 'receipt', accent: 'border-l-primary', iconBg: 'bg-primary-50 text-primary' },
                  { label: 'รายได้วันนี้', value: `฿${summary.totalRevenue?.toLocaleString()}`, sub: `ส่วนลด: ฿${summary.totalDiscount?.toFixed(2)}`, icon: 'payments', accent: 'border-l-success', iconBg: 'bg-emerald-50 text-success' },
                  { label: 'คะแนนที่แจก', value: summary.totalPointsGiven?.toLocaleString(), sub: `ใช้ไป: ${summary.totalPointsUsed?.toLocaleString()}`, icon: 'stars', accent: 'border-l-warning', iconBg: 'bg-amber-50 text-warning' },
                  { label: 'ลูกค้าวันนี้', value: summary.uniqueCustomers, sub: 'คนที่ซื้อวันนี้', icon: 'group', accent: 'border-l-violet-500', iconBg: 'bg-violet-50 text-violet-600' },
                ].map((s, i) => (
                  <div key={i} className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-5 border-l-4 ${s.accent}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.iconBg}`}>
                        <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
                      </div>
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{s.label}</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{s.value}</p>
                    <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Payment Methods */}
              <Card title="วิธีชำระเงิน">
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  {[
                    { icon: 'payments', label: 'เงินสด', count: summary.paymentMethods?.cash || 0 },
                    { icon: 'credit_card', label: 'บัตร', count: summary.paymentMethods?.card || 0 },
                    { icon: 'qr_code', label: 'QR Code', count: summary.paymentMethods?.qr || 0 },
                  ].map((pm, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 sm:gap-2 p-3 sm:p-4 bg-slate-50 rounded-xl">
                      <span className="material-symbols-outlined text-slate-400 text-[28px]">{pm.icon}</span>
                      <p className="text-2xl font-black text-slate-900">{pm.count}</p>
                      <p className="text-xs font-medium text-slate-500">{pm.label}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recent Transactions */}
              {summary.recentTransactions && summary.recentTransactions.length > 0 && (
                <Card title="ธุรกรรมล่าสุด">
                  <div className="space-y-2">
                    {summary.recentTransactions.map((t: any) => (
                      <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div>
                          <p className="font-bold text-slate-800">฿{t.amount?.toFixed(2)}</p>
                          <p className="text-xs text-slate-400">{new Date(t.createdAt).toLocaleTimeString('th-TH')}</p>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <span className="text-sm font-bold text-success">+{t.pointsEarned}</span>
                          <Badge variant={t.status === 'completed' ? 'success' : 'danger'} hasDot>
                            {t.status === 'completed' ? 'สำเร็จ' : 'คืนเงิน'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <span className="material-symbols-outlined text-slate-300 text-5xl">analytics</span>
              <p className="text-sm text-slate-400 mt-3">ไม่มีข้อมูล</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
