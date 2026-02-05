import { useState } from 'react';
import adminApi from '../api/client';

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

export default function Cashier() {
  const [searchQuery, setSearchQuery] = useState('');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setError('');
    setCustomer(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'}/cashier/search?q=${encodeURIComponent(searchQuery)}`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'}/cashier/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify({
          customerId: customer.id,
          amount: parseFloat(amount),
        }),
      });

      if (!response.ok) {
        throw new Error('Checkout failed');
      }

      const data = await response.json();
      setSuccess(`✅ สำเร็จ! ให้คะแนน ${data.earnedPoints} คะแนน`);
      setAmount('');
      
      // Update customer points
      setCustomer({
        ...customer,
        points: data.totalPoints,
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
        setCustomer(null);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const calculatePoints = () => {
    if (!amount) return 0;
    return Math.floor(parseFloat(amount) * 0.1);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-2xl">point_of_sale</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Cashier System</h1>
          <p className="text-gray-500">ระบบให้คะแนนลูกค้า</p>
        </div>
      </div>

      {/* Search Customer */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
          <form onSubmit={handleCheckout} className="p-6 space-y-4">
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
            </div>

            {amount && parseFloat(amount) > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">คะแนนที่จะได้รับ:</span>
                  <span className="text-2xl font-bold text-primary">
                    +{calculatePoints()} คะแนน
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  (10% ของยอดซื้อ = {calculatePoints()} คะแนน)
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCustomer(null)}
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
              <span>ใส่ยอดซื้อของลูกค้า</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">3.</span>
              <span>ยืนยันการชำระเงิน - ระบบจะให้คะแนน 10% ของยอดซื้อโดยอัตโนมัติ</span>
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}
