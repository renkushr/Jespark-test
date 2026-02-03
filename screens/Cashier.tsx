
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../src/api/client';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  tier: string;
  points: number;
  walletBalance: number;
  avatar: string;
}

const Cashier: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('กรุณาใส่อีเมลหรือเบอร์โทรศัพท์');
      return;
    }

    try {
      setSearching(true);
      setError('');
      setCustomer(null);
      
      const response = await apiClient.searchCustomer(searchQuery);
      setCustomer(response.user);
      setSuccess('พบข้อมูลลูกค้า');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err: any) {
      setError(err.message || 'ไม่พบข้อมูลลูกค้า');
      setCustomer(null);
    } finally {
      setSearching(false);
    }
  };

  const handleCheckout = async () => {
    if (!customer) {
      setError('กรุณาค้นหาลูกค้าก่อน');
      return;
    }

    const amountNum = parseFloat(amount);
    if (!amount || amountNum <= 0) {
      setError('กรุณาใส่จำนวนเงินที่ถูกต้อง');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await apiClient.cashierCheckout(customer.id, amountNum);
      
      setSuccess(`✅ คิดเงินสำเร็จ! ลูกค้าได้รับ ${response.earnedPoints} คะแนน`);
      setAmount('');
      
      // Refresh customer data
      const updatedCustomer = await apiClient.searchCustomer(searchQuery);
      setCustomer(updatedCustomer.user);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const earnedPoints = amount ? Math.floor(parseFloat(amount) * 0.1) : 0;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl">point_of_sale</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-dark-green">ระบบแคชเชียร์</h1>
              <p className="text-xs text-gray-500">คิดเงินและให้คะแนนลูกค้า</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="size-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <span className="material-symbols-outlined text-gray-600">close</span>
          </button>
        </div>
      </header>

      <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
        {/* Search Customer */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-black text-dark-green mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">search</span>
            ค้นหาลูกค้า
          </h2>
          
          <div className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="อีเมลหรือเบอร์โทรศัพท์"
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none font-medium"
            />
            <button
              onClick={handleSearch}
              disabled={searching}
              className="px-6 py-3 bg-primary text-white rounded-xl font-black hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {searching ? (
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined">search</span>
              )}
              ค้นหา
            </button>
          </div>
        </div>

        {/* Customer Info */}
        {customer && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-fade-in">
            <h2 className="text-lg font-black text-dark-green mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">person</span>
              ข้อมูลลูกค้า
            </h2>
            
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-xl">
              <img 
                src={customer.avatar} 
                alt={customer.name}
                className="size-16 rounded-full border-4 border-white shadow-lg"
              />
              <div className="flex-1">
                <h3 className="text-xl font-black text-dark-green">{customer.name}</h3>
                <p className="text-sm text-gray-600">{customer.email}</p>
                <p className="text-sm text-gray-600">{customer.phone}</p>
              </div>
              <div className="text-right">
                <div className="px-4 py-1 bg-primary/10 rounded-full mb-2">
                  <span className="text-sm font-black text-primary">{customer.tier}</span>
                </div>
                <div className="text-2xl font-black text-primary">{customer.points.toLocaleString()}</div>
                <div className="text-xs text-gray-500">คะแนนสะสม</div>
              </div>
            </div>
          </div>
        )}

        {/* Checkout */}
        {customer && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-black text-dark-green mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">payments</span>
              คิดเงิน
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">จำนวนเงิน (บาท)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none font-bold text-2xl text-right"
                />
              </div>

              {amount && (
                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-700">คะแนนที่จะได้รับ (10%)</span>
                    <span className="text-2xl font-black text-green-600">+{earnedPoints}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-green-200">
                    <span className="text-sm font-bold text-gray-700">คะแนนรวมหลังซื้อ</span>
                    <span className="text-lg font-black text-primary">{(customer.points + earnedPoints).toLocaleString()}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={loading || !amount}
                className="w-full py-4 bg-primary text-white rounded-xl font-black text-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    กำลังประมวลผล...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">check_circle</span>
                    ยืนยันการชำระเงิน
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4 flex items-center gap-3 animate-fade-in">
            <span className="material-symbols-outlined text-red-600">error</span>
            <span className="text-red-600 font-bold">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-4 flex items-center gap-3 animate-fade-in">
            <span className="material-symbols-outlined text-green-600">check_circle</span>
            <span className="text-green-600 font-bold">{success}</span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setAmount('100')}
            className="p-4 bg-white rounded-xl shadow hover:shadow-lg transition-all font-bold text-gray-700"
          >
            100 ฿
          </button>
          <button
            onClick={() => setAmount('500')}
            className="p-4 bg-white rounded-xl shadow hover:shadow-lg transition-all font-bold text-gray-700"
          >
            500 ฿
          </button>
          <button
            onClick={() => setAmount('1000')}
            className="p-4 bg-white rounded-xl shadow hover:shadow-lg transition-all font-bold text-gray-700"
          >
            1000 ฿
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cashier;
