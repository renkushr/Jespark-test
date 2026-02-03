
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../src/api/client';

const Coupons: React.FC = () => {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useLoading, setUseLoading] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient.getCoupons();
        setCoupons(res.coupons || []);
      } catch (err: any) {
        setError(err.message || 'โหลดคูปองไม่สำเร็จ');
        setCoupons([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleUse = async (id: number) => {
    try {
      setUseLoading(id);
      await apiClient.useCoupon(id);
      setCoupons(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      setError(err.message || 'ใช้คูปองไม่สำเร็จ');
    } finally {
      setUseLoading(null);
    }
  };

  const formatExpiry = (d: string | null) => {
    if (!d) return 'ไม่มีวันหมดอายุ';
    const date = new Date(d);
    const now = new Date();
    const days = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'หมดอายุแล้ว';
    if (days <= 2) return 'เหลืออีก 2 วัน';
    return `ใช้ได้ถึง ${date.toLocaleDateString('th-TH')}`;
  };

  const offerText = (c: any) => {
    if (c.discountType === 'percentage') return `${c.discountValue}% OFF`;
    if (c.discountType === 'fixed') return `ลด ฿${Number(c.discountValue).toFixed(0)}`;
    return c.title || 'ส่วนลดพิเศษ';
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 animate-fade-in pb-32">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="flex items-center p-4 justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="size-10 flex items-center justify-center rounded-full hover:bg-gray-100">
              <span className="material-symbols-outlined">arrow_back_ios_new</span>
            </button>
            <h1 className="text-xl font-black tracking-tight">คูปองของฉัน</h1>
          </div>
          <div className="size-10" />
        </div>
        <div className="flex border-b border-gray-50 px-4">
          <button className="flex-1 py-4 text-sm font-black text-primary border-b-[3px] border-primary">ใช้ได้</button>
          <button className="flex-1 py-4 text-sm font-bold text-gray-400">ใช้แล้ว/หมดอายุ</button>
        </div>
      </header>

      {loading ? (
        <div className="p-8 flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
        </div>
      ) : error ? (
        <div className="p-6 mx-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
          {error}
        </div>
      ) : coupons.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          <span className="material-symbols-outlined text-4xl mb-2">confirmation_number</span>
          <p className="text-sm font-bold">ยังไม่มีคูปอง</p>
          <p className="text-xs mt-1">แลกของรางวัลเพื่อรับคูปอง</p>
        </div>
      ) : (
        <main className="p-4 space-y-5">
          {coupons.map((coupon) => {
            const urgent = coupon.expiryDate && (new Date(coupon.expiryDate).getTime() - Date.now()) < 2 * 24 * 60 * 60 * 1000;
            return (
              <div
                key={coupon.id}
                className={`relative flex items-stretch bg-white rounded-2xl overflow-hidden shadow-xl border ${urgent ? 'border-primary/50' : 'border-gray-100'}`}
              >
                {urgent && (
                  <div className="absolute top-0 right-0 bg-primary text-dark-green text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">
                    ใกล้หมดอายุ
                  </div>
                )}
                <div className="flex flex-[1.8_1.8_0px] flex-col gap-4 p-5">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{coupon.title}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black leading-none">{offerText(coupon)}</p>
                    <p className={`text-[10px] font-bold mt-1.5 uppercase tracking-wider ${urgent ? 'text-orange-500' : 'text-gray-400'}`}>
                      {formatExpiry(coupon.expiryDate)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUse(coupon.id)}
                    disabled={useLoading === coupon.id}
                    className="w-full bg-primary text-dark-green py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-transform disabled:opacity-50"
                  >
                    {useLoading === coupon.id ? 'กำลังใช้...' : 'ใช้เลย'}
                  </button>
                </div>
                <div className="coupon-tear-off my-6" />
                <div className="flex-1 min-w-[120px] bg-gray-100 m-3 rounded-xl" />
              </div>
            );
          })}
        </main>
      )}
    </div>
  );
};

export default Coupons;
