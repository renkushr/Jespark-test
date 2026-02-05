import { useState, useEffect } from 'react';

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

  useEffect(() => {
    if (activeTab === 'history') {
      loadTransactions();
    } else if (activeTab === 'summary') {
      loadSummary();
    }
  }, [activeTab]);

  const loadTransactions = async () => {
    setHistoryLoading(true);
    try {
      const response = await fetch(`${API_BASE}/cashier/transactions?limit=50`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      
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
      const response = await fetch(`${API_BASE}/cashier/my-summary`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      
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
      const response = await fetch(`${API_BASE}/cashier/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Customer not found');
      }

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
      const body: any = {
        customerId: customer.id,
        amount: parseFloat(amount),
        paymentMethod: paymentMethod,
      };

      if (usePoints > 0) {
        body.usePoints = usePoints;
      }

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Checkout failed');
      }

      const data = await response.json();
      const finalAmount = data.transaction?.finalAmount || data.transaction?.amount || parseFloat(amount);
      const earnedPoints = data.transaction?.pointsEarned || data.earnedPoints || 0;
      const discount = data.transaction?.discount || 0;

      let successMsg = `✅ สำเร็จ! ยอดชำระ ฿${finalAmount.toFixed(2)}`;
      if (discount > 0) {
        successMsg += ` (ส่วนลด ฿${discount.toFixed(2)})`;
      }
      successMsg += ` | ให้คะแนน +${earnedPoints} คะแนน`;

      setSuccess(successMsg);
      setAmount('');
      setUsePoints(0);
      
      // Update customer points
      setCustomer({
        ...customer,
        points: data.customer?.points || data.totalPoints || customer.points,
      });

      // Clear success message after 4 seconds
      setTimeout(() => {
        setSuccess('');
        setCustomer(null);
        setPaymentMethod('cash');
      }, 4000);
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        alert('คืนเงินสำเร็จ');
        loadTransactions();
      } else {
        const data = await response.json();
        alert(data.error || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Refund error:', error);
      alert('เกิดข้อผิดพลาด');
    }
  };

  const calculateDiscount = () => {
    return Math.min(usePoints, parseFloat(amount) || 0);
  };

  const calculateFinalAmount = () => {
    const baseAmount = parseFloat(amount) || 0;
    return Math.max(0, baseAmount - calculateDiscount());
  };

  const calculatePoints = () => {
    const finalAmount = calculateFinalAmount();
    return Math.floor(finalAmount * 0.1);
  };

  const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-2xl">point_of_sale</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Cashier System</h1>
            <p className="text-gray-500">ระบบให้คะแนนและขายหน้าร้าน</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('checkout')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'checkout'
                ? 'text-primary border-b-2 border-primary bg-green-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            💳 ชำระเงิน
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'history'
                ? 'text-primary border-b-2 border-primary bg-green-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            📜 ประวัติ
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'summary'
                ? 'text-primary border-b-2 border-primary bg-green-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            📊 สรุปยอดขาย
          </button>
        </div>

        {/* Checkout Tab */}
        {activeTab === 'checkout' && (
          <div className="p-6 space-y-6">
            {/* Search Customer */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">ค้นหาลูกค้า</h2>
              <form onSubmit={handleSearch} className="flex gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ใส่อีเมล, เบอร์โทร หรือรหัสสมาชิก..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg"
                  disabled={searching}
                />
                <button
                  type="submit"
                  disabled={searching || !searchQuery.trim()}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-dark-green transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">search</span>
                  {searching ? 'กำลังค้นหา...' : 'ค้นหา'}
                </button>
              </form>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-red-600">error</span>
                <p className="text-red-800">{error}</p>
                <button onClick={() => setError('')} className="ml-auto text-red-600 hover:text-red-800">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-green-600">check_circle</span>
                <p className="text-green-800 font-semibold">{success}</p>
              </div>
            )}

            {/* Customer Info & Checkout */}
            {customer && (
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                {/* Customer Header */}
                <div className="bg-gradient-to-r from-primary to-dark-green p-6 text-white">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      {customer.avatar ? (
                        <img src={customer.avatar} alt={customer.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-4xl">person</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold">{customer.name}</h3>
                      <p className="text-white text-opacity-90">{customer.email}</p>
                      <p className="text-white text-opacity-90">{customer.phone}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-semibold">
                        {customer.tier}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customer Stats */}
                <div className="grid grid-cols-2 gap-4 p-6 bg-gray-50">
                  <div className="bg-white rounded-lg p-4 text-center">
                    <p className="text-gray-600 text-sm mb-1">คะแนนปัจจุบัน</p>
                    <p className="text-3xl font-bold text-primary">{customer.points.toLocaleString()}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <p className="text-gray-600 text-sm mb-1">ยอดเงินในกระเป๋า</p>
                    <p className="text-3xl font-bold text-gray-800">฿{customer.walletBalance.toLocaleString()}</p>
                  </div>
                </div>

                {/* Checkout Form */}
                <form onSubmit={handleCheckout} className="p-6 space-y-6">
                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ยอดซื้อ (บาท)
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-2xl font-bold text-center"
                      disabled={loading}
                      required
                    />
                    {/* Quick Amount Buttons */}
                    <div className="grid grid-cols-6 gap-2 mt-3">
                      {quickAmounts.map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setAmount(amt.toString())}
                          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                          {amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Use Points */}
                  {customer.points > 0 && amount && parseFloat(amount) > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          ใช้คะแนนแลกส่วนลด
                        </label>
                        <span className="text-sm text-gray-500">
                          (1 คะแนน = 1 บาท)
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={Math.min(customer.points, parseFloat(amount) || 0)}
                        value={usePoints}
                        onChange={(e) => setUsePoints(parseInt(e.target.value))}
                        className="w-full"
                        disabled={loading}
                      />
                      <div className="flex justify-between text-sm text-gray-600 mt-1">
                        <span>0</span>
                        <span className="font-bold text-primary text-lg">{usePoints} คะแนน</span>
                        <span>{Math.min(customer.points, parseFloat(amount) || 0)}</span>
                      </div>
                    </div>
                  )}

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      วิธีชำระเงิน
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cash')}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          paymentMethod === 'cash'
                            ? 'border-primary bg-green-50 text-primary'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="material-symbols-outlined text-3xl mb-1">payments</span>
                        <p className="text-sm font-medium">เงินสด</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          paymentMethod === 'card'
                            ? 'border-primary bg-green-50 text-primary'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="material-symbols-outlined text-3xl mb-1">credit_card</span>
                        <p className="text-sm font-medium">บัตร</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('qr')}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          paymentMethod === 'qr'
                            ? 'border-primary bg-green-50 text-primary'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="material-symbols-outlined text-3xl mb-1">qr_code</span>
                        <p className="text-sm font-medium">QR Code</p>
                      </button>
                    </div>
                  </div>

                  {/* Summary */}
                  {amount && parseFloat(amount) > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-gray-700">
                        <span>ยอดซื้อ:</span>
                        <span className="font-semibold">฿{parseFloat(amount).toFixed(2)}</span>
                      </div>
                      {usePoints > 0 && (
                        <div className="flex justify-between text-red-600">
                          <span>ส่วนลด ({usePoints} คะแนน):</span>
                          <span className="font-semibold">-฿{calculateDiscount().toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-yellow-300">
                        <span>ยอดชำระ:</span>
                        <span>฿{calculateFinalAmount().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-primary pt-2 border-t border-yellow-300">
                        <span>คะแนนที่จะได้รับ:</span>
                        <span className="text-xl font-bold">+{calculatePoints()} คะแนน</span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setCustomer(null);
                        setAmount('');
                        setUsePoints(0);
                        setPaymentMethod('cash');
                      }}
                      className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                      disabled={loading}
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !amount || parseFloat(amount) <= 0}
                      className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-dark-green transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined">check_circle</span>
                      {loading ? 'กำลังดำเนินการ...' : 'ยืนยันการชำระเงิน'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Instructions */}
            {!customer && !error && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined">info</span>
                  วิธีใช้งาน
                </h3>
                <ol className="space-y-2 text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="font-bold">1.</span>
                    <span>ค้นหาลูกค้าด้วยอีเมล, เบอร์โทร หรือรหัสสมาชิก</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">2.</span>
                    <span>ใส่ยอดซื้อของลูกค้า (หรือคลิกปุ่มด่วน)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">3.</span>
                    <span>เลือกใช้คะแนนแลกส่วนลด (ถ้าต้องการ)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">4.</span>
                    <span>เลือกวิธีชำระเงิน (เงินสด/บัตร/QR)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">5.</span>
                    <span>ยืนยันการชำระเงิน - ระบบจะให้คะแนน 10% ของยอดชำระโดยอัตโนมัติ</span>
                  </li>
                </ol>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="p-6">
            {historyLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📜</div>
                <p className="text-gray-600 text-lg">ยังไม่มีประวัติ</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ลูกค้า</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ยอดเงิน</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ส่วนลด</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ยอดชำระ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">คะแนน</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">การชำระ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{t.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{t.customerName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">฿{t.amount.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                          {t.discount > 0 ? `-฿${t.discount.toFixed(2)}` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          ฿{t.finalAmount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="text-green-600">+{t.pointsEarned}</span>
                          {t.pointsUsed > 0 && <span className="text-red-600 ml-1">-{t.pointsUsed}</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {t.paymentMethod === 'cash' ? '💵 เงินสด' : 
                           t.paymentMethod === 'card' ? '💳 บัตร' : '📱 QR'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            t.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {t.status === 'completed' ? 'สำเร็จ' : 'คืนเงิน'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(t.createdAt).toLocaleString('th-TH')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {t.status === 'completed' && (
                            <button
                              onClick={() => handleRefund(t.id)}
                              className="text-red-600 hover:text-red-800 font-medium"
                            >
                              คืนเงิน
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div className="p-6">
            {summaryLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
              </div>
            ) : summary ? (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-600 text-sm">ธุรกรรมทั้งหมด</p>
                      <span className="material-symbols-outlined text-blue-500">receipt</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{summary.totalTransactions}</p>
                    <p className="text-sm text-gray-500 mt-1">สำเร็จ: {summary.completedTransactions}</p>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-600 text-sm">รายได้วันนี้</p>
                      <span className="material-symbols-outlined text-green-500">payments</span>
                    </div>
                    <p className="text-3xl font-bold text-green-600">฿{summary.totalRevenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-1">ส่วนลด: ฿{summary.totalDiscount.toFixed(2)}</p>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-600 text-sm">คะแนนที่แจก</p>
                      <span className="material-symbols-outlined text-yellow-500">star</span>
                    </div>
                    <p className="text-3xl font-bold text-yellow-600">{summary.totalPointsGiven.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-1">ใช้ไป: {summary.totalPointsUsed.toLocaleString()}</p>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-600 text-sm">ลูกค้า</p>
                      <span className="material-symbols-outlined text-purple-500">group</span>
                    </div>
                    <p className="text-3xl font-bold text-purple-600">{summary.uniqueCustomers}</p>
                    <p className="text-sm text-gray-500 mt-1">คนที่ซื้อวันนี้</p>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">การชำระเงิน</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-4xl mb-2">💵</p>
                      <p className="text-2xl font-bold text-gray-900">{summary.paymentMethods.cash}</p>
                      <p className="text-sm text-gray-600">เงินสด</p>
                    </div>
                    <div className="text-center">
                      <p className="text-4xl mb-2">💳</p>
                      <p className="text-2xl font-bold text-gray-900">{summary.paymentMethods.card}</p>
                      <p className="text-sm text-gray-600">บัตร</p>
                    </div>
                    <div className="text-center">
                      <p className="text-4xl mb-2">📱</p>
                      <p className="text-2xl font-bold text-gray-900">{summary.paymentMethods.qr}</p>
                      <p className="text-sm text-gray-600">QR Code</p>
                    </div>
                  </div>
                </div>

                {/* Recent Transactions */}
                {summary.recentTransactions && summary.recentTransactions.length > 0 && (
                  <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">ธุรกรรมล่าสุด</h3>
                    <div className="space-y-2">
                      {summary.recentTransactions.map((t: any) => (
                        <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">฿{t.amount.toFixed(2)}</p>
                            <p className="text-sm text-gray-600">{new Date(t.createdAt).toLocaleTimeString('th-TH')}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-green-600">+{t.pointsEarned} คะแนน</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              t.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {t.status === 'completed' ? 'สำเร็จ' : 'คืนเงิน'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-gray-600 text-lg">ไม่มีข้อมูล</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
