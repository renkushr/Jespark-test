
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
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
  memberId?: string;
}

type PaymentMode = 'cash' | 'wallet';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

const Cashier: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [scanning, setScanning] = useState(false);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // Autocomplete customer search with debounce
  const searchCustomers = useCallback(async (query: string) => {
    if (query.length < 1) { setSearchResults([]); return; }
    setSearching(true);
    try {
      // Try member_id lookup first
      if (query.startsWith('JSP-')) {
        try {
          const response = await apiClient.scanLookup(query);
          setSearchResults([response.user]);
          setSearching(false);
          return;
        } catch { /* fallback */ }
      }
      const params = new URLSearchParams({ search: query, limit: '10' });
      const res = await fetch(`${API_BASE}/admin/customers?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults((data.customers || []).map((c: any) => ({
          id: c.id,
          name: c.name || 'ไม่ระบุชื่อ',
          email: c.email,
          phone: c.phone,
          tier: c.tier,
          points: c.points,
          walletBalance: c.wallet_balance || 0,
          avatar: '',
          memberId: c.member_id || '',
        })));
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally { setSearching(false); }
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!customer && searchQuery.length >= 1) {
      searchTimeoutRef.current = setTimeout(() => searchCustomers(searchQuery), 300);
    } else { setSearchResults([]); }
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [searchQuery, searchCustomers, customer]);

  const selectCustomer = (c: Customer) => {
    setCustomer(c);
    setSearchQuery('');
    setSearchResults([]);
    setSuccess('พบข้อมูลลูกค้า');
    setTimeout(() => setSuccess(''), 2000);
  };

  const startScanner = async () => {
    setScanning(true);
    setError('');

    try {
      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          // Stop scanner immediately
          await html5QrCode.stop();
          scannerRef.current = null;
          setScanning(false);

          try {
            const qrData = JSON.parse(decodedText);
            const memberId = qrData.memberId;
            const type = qrData.type; // 'earn' or 'pay'

            if (!memberId) {
              setError('QR Code ไม่ถูกต้อง');
              return;
            }

            // Set payment mode based on QR type
            if (type === 'pay') {
              setPaymentMode('wallet');
            } else {
              setPaymentMode('cash');
            }

            // Lookup customer by member_id
            setSearching(true);
            const response = await apiClient.scanLookup(memberId);
            setCustomer(response.user);
            setSearchQuery(memberId);
            setSuccess(`สแกนสำเร็จ! พบลูกค้า: ${response.user.name}`);
            setTimeout(() => setSuccess(''), 3000);
          } catch (err: any) {
            setError(err.message || 'ไม่พบข้อมูลจาก QR Code นี้');
          } finally {
            setSearching(false);
          }
        },
        () => {} // ignore errors during scanning
      );
    } catch (err: any) {
      setScanning(false);
      setError('ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตการใช้กล้อง');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    setScanning(false);
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

      if (paymentMode === 'wallet') {
        // Wallet Pay
        const response = await apiClient.walletPay(customer.id, amountNum);
        setSuccess(`✅ ชำระผ่านวอลเล็ตสำเร็จ! ได้รับ ${response.earnedPoints} คะแนน | คงเหลือ ฿${response.walletBalance.toLocaleString()}`);
        setAmount('');
        // Refresh customer
        try {
          const updated = await apiClient.scanLookup(customer.memberId || searchQuery);
          setCustomer(updated.user);
        } catch {
          setCustomer(prev => prev ? { ...prev, points: response.totalPoints, walletBalance: response.walletBalance } : null);
        }
      } else {
        // Cash checkout
        const response = await apiClient.cashierCheckout(customer.id, amountNum);
        setSuccess(`✅ คิดเงินสำเร็จ! ลูกค้าได้รับ ${response.earnedPoints} คะแนน`);
        setAmount('');
        // Refresh customer
        try {
          const updated = await apiClient.searchCustomer(searchQuery);
          setCustomer(updated.user);
        } catch {
          setCustomer(prev => prev ? { ...prev, points: response.totalPoints } : null);
        }
      }
      
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const earnedPoints = amount ? Math.floor(parseFloat(amount) / 35) * 5 : 0;

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
              <p className="text-xs text-gray-500">สแกน QR · คิดเงิน · ให้คะแนน</p>
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

      <div className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-6">

        {/* QR Scanner */}
        {scanning && (
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-dark-green flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">qr_code_scanner</span>
                กำลังสแกน QR Code...
              </h2>
              <button onClick={stopScanner} className="px-4 py-2 bg-red-100 text-red-600 rounded-xl font-bold text-sm hover:bg-red-200 transition-colors">
                ยกเลิก
              </button>
            </div>
            <div id="qr-reader" className="rounded-xl overflow-hidden" style={{ width: '100%' }}></div>
          </div>
        )}

        {/* Search + Scan */}
        {!scanning && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-black text-dark-green mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">person_search</span>
              ค้นหาลูกค้า
            </h2>
            
            {customer ? (
              <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-xl mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-xl">person</span>
                  </div>
                  <div>
                    <p className="font-bold text-dark-green text-sm">{customer.name}</p>
                    <p className="text-[10px] text-gray-500">{customer.tier} · {customer.points?.toLocaleString()} แต้ม{customer.phone ? ` · ${customer.phone}` : ''}</p>
                  </div>
                </div>
                <button onClick={() => { setCustomer(null); setSearchQuery(''); }} className="p-1.5 hover:bg-white rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-gray-400 text-lg">close</span>
                </button>
              </div>
            ) : (
              <div className="relative mb-3">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">search</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="พิมพ์ชื่อ, เบอร์โทร หรือรหัสสมาชิก..."
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none font-medium text-sm"
                  />
                  {searching && (
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary text-lg animate-spin">progress_activity</span>
                  )}
                </div>
                {searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                    {searchResults.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => selectCustomer(c)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 text-left"
                      >
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-gray-400 text-base">person</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-dark-green text-sm truncate">{c.name}</p>
                          <p className="text-[10px] text-gray-400 truncate">{c.phone || ''}{c.phone && c.email ? ' · ' : ''}{c.email || ''}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[10px] font-bold text-primary">{c.points?.toLocaleString()} แต้ม</p>
                          <p className="text-[10px] text-gray-400">{c.tier}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {searchQuery.length >= 1 && !searching && searchResults.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-3">ไม่พบลูกค้า</p>
                )}
              </div>
            )}

            {/* Scan QR Button */}
            <button
              onClick={startScanner}
              className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-black text-base hover:brightness-110 transition-all flex items-center justify-center gap-3 shadow-lg"
            >
              <span className="material-symbols-outlined text-2xl">qr_code_scanner</span>
              สแกน QR Code ลูกค้า
            </button>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
            <span className="material-symbols-outlined text-red-600">error</span>
            <span className="text-red-600 font-bold text-sm">{error}</span>
            <button onClick={() => setError('')} className="ml-auto">
              <span className="material-symbols-outlined text-red-400 text-sm">close</span>
            </button>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
            <span className="material-symbols-outlined text-green-600">check_circle</span>
            <span className="text-green-600 font-bold text-sm">{success}</span>
          </div>
        )}

        {/* Customer Info */}
        {customer && (
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in">
            <h2 className="text-lg font-black text-dark-green mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">person</span>
              ข้อมูลลูกค้า
            </h2>
            
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-xl">
              <div className="size-16 rounded-full bg-primary/10 border-4 border-white shadow-lg flex items-center justify-center">
                {customer.avatar ? (
                  <img src={customer.avatar} alt={customer.name} className="size-full rounded-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-primary text-2xl">person</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black text-dark-green truncate">{customer.name}</h3>
                {customer.memberId && (
                  <p className="text-xs font-mono text-primary font-bold">{customer.memberId}</p>
                )}
                <p className="text-xs text-gray-500 truncate">{customer.email} · {customer.phone}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="px-3 py-1 bg-primary/10 rounded-full mb-1">
                  <span className="text-xs font-black text-primary">{customer.tier}</span>
                </div>
                <div className="text-xl font-black text-primary">{customer.points.toLocaleString()}</div>
                <div className="text-[10px] text-gray-500">คะแนนสะสม</div>
              </div>
            </div>

            {/* Wallet Balance */}
            <div className="mt-3 p-3 bg-blue-50 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-lg">account_balance_wallet</span>
                <span className="text-sm font-bold text-blue-700">วอลเล็ต</span>
              </div>
              <span className="text-lg font-black text-blue-800">฿{(customer.walletBalance || 0).toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Checkout */}
        {customer && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-black text-dark-green mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">payments</span>
              คิดเงิน
            </h2>
            
            <div className="space-y-4">
              {/* Payment Mode */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">วิธีชำระเงิน</label>
                <div className="flex h-12 w-full items-center justify-center rounded-xl bg-gray-100 p-1.5">
                  <button
                    onClick={() => setPaymentMode('cash')}
                    className={`flex-1 h-full rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      paymentMode === 'cash' ? 'bg-white text-dark-green shadow-md' : 'text-gray-400'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">payments</span>
                    เงินสด
                  </button>
                  <button
                    onClick={() => setPaymentMode('wallet')}
                    className={`flex-1 h-full rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      paymentMode === 'wallet' ? 'bg-white text-blue-700 shadow-md' : 'text-gray-400'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
                    วอลเล็ต
                  </button>
                </div>
              </div>

              {/* Amount */}
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

              {/* Quick Amount */}
              <div className="grid grid-cols-4 gap-2">
                {[100, 200, 500, 1000].map(val => (
                  <button
                    key={val}
                    onClick={() => setAmount(String(val))}
                    className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all font-bold text-gray-700 text-sm border border-gray-200"
                  >
                    {val} ฿
                  </button>
                ))}
              </div>

              {/* Points Preview */}
              {amount && parseFloat(amount) > 0 && (
                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-700">คะแนนที่จะได้รับ (ทุก 35฿ = 5 แต้ม)</span>
                    <span className="text-2xl font-black text-green-600">+{earnedPoints}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-green-200">
                    <span className="text-sm font-bold text-gray-700">คะแนนรวมหลังซื้อ</span>
                    <span className="text-lg font-black text-primary">{(customer.points + earnedPoints).toLocaleString()}</span>
                  </div>
                  {paymentMode === 'wallet' && (
                    <div className="flex items-center justify-between pt-2 border-t border-green-200">
                      <span className="text-sm font-bold text-gray-700">วอลเล็ตคงเหลือหลังชำระ</span>
                      <span className={`text-lg font-black ${
                        (customer.walletBalance || 0) >= parseFloat(amount) ? 'text-blue-600' : 'text-red-600'
                      }`}>
                        ฿{((customer.walletBalance || 0) - parseFloat(amount)).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Wallet insufficient warning */}
              {paymentMode === 'wallet' && amount && parseFloat(amount) > (customer.walletBalance || 0) && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-500 text-lg">warning</span>
                  <span className="text-sm font-bold text-red-600">ยอดเงินในวอลเล็ตไม่เพียงพอ</span>
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={loading || !amount || (paymentMode === 'wallet' && parseFloat(amount) > (customer.walletBalance || 0))}
                className={`w-full py-4 rounded-xl font-black text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  paymentMode === 'wallet'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:brightness-110'
                    : 'bg-primary text-white hover:brightness-110'
                }`}
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    กำลังประมวลผล...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">
                      {paymentMode === 'wallet' ? 'account_balance_wallet' : 'check_circle'}
                    </span>
                    {paymentMode === 'wallet' ? 'ชำระผ่านวอลเล็ต' : 'ยืนยันการชำระเงินสด'}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cashier;
