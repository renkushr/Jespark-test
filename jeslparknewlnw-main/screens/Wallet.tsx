
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import apiClient from '../src/api/client';

interface WalletProps {
  user: User;
}

const typeIcons: Record<string, string> = {
  topup: 'account_balance',
  payment: 'local_mall',
  refund: 'replay',
};

const Wallet: React.FC<WalletProps> = ({ user }) => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient.getTransactions(50, 0);
        setTransactions(res.transactions || []);
      } catch (err: any) {
        setError(err.message || 'โหลดรายการไม่สำเร็จ');
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const byDate = transactions.reduce((acc: Record<string, any[]>, t) => {
    const d = t.date || '';
    if (!acc[d]) acc[d] = [];
    acc[d].push(t);
    return acc;
  }, {});
  const dateGroups = Object.keys(byDate).sort((a, b) => {
    const da = byDate[a][0]?.created_at ? new Date(byDate[a][0].created_at).getTime() : 0;
    const db = byDate[b][0]?.created_at ? new Date(byDate[b][0].created_at).getTime() : 0;
    return db - da;
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 animate-fade-in">
      <header className="bg-dark-green text-white pt-10 pb-8 px-4 rounded-b-[2.5rem] shadow-xl relative z-20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="size-10 rounded-full bg-white/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">arrow_back</span>
            </button>
            <h2 className="text-lg font-bold tracking-tight">กระเป๋าเงินของฉัน</h2>
          </div>
          <button onClick={() => navigate('/notifications')} className="size-10 rounded-full bg-white/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-white">notifications</span>
          </button>
        </div>

        <div className="text-center pb-2">
          <p className="text-primary/80 text-xs font-bold tracking-[0.2em] uppercase mb-1">ยอดเงินทั้งหมด</p>
          <h1 className="text-5xl font-extrabold tracking-tighter mb-4">฿{user.walletBalance.toLocaleString()}</h1>
          <div
            className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10 cursor-pointer"
            onClick={() => navigate('/history')}
          >
            <span className="material-symbols-outlined text-primary text-sm">stars</span>
            <span className="text-xs font-semibold">{user.points.toLocaleString()} คะแนน Jespark</span>
          </div>
        </div>
      </header>

      <div className="px-4 -mt-8 mb-6 relative z-30">
        <div className="bg-white rounded-2xl shadow-xl p-5 flex justify-between items-center gap-4 border border-gray-100">
          {[
            { label: 'เติมเงิน', icon: 'add_circle', color: 'bg-primary/10 text-primary' },
            { label: 'โอนเงิน', icon: 'send', color: 'bg-primary text-dark-green shadow-lg shadow-primary/20' },
            { label: 'ถอนเงิน', icon: 'account_balance_wallet', color: 'bg-primary/10 text-primary' },
          ].map((action) => (
            <div key={action.label} className="flex flex-col items-center flex-1 gap-2 cursor-pointer">
              <div className={`size-12 rounded-2xl flex items-center justify-center ${action.color}`}>
                <span className="material-symbols-outlined">{action.icon}</span>
              </div>
              <p className="text-gray-600 text-[11px] font-bold uppercase tracking-tighter">{action.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 pb-24 overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold">รายการล่าสุด</h3>
          <button onClick={() => navigate('/history')} className="text-primary text-sm font-bold">ดูทั้งหมด</button>
        </div>

        {loading ? (
          <div className="py-8 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
          </div>
        ) : error ? (
          <div className="py-6 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
            {error}
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <span className="material-symbols-outlined text-4xl mb-2">receipt_long</span>
            <p className="text-sm font-bold">ยังไม่มีรายการ</p>
          </div>
        ) : (
          <div className="space-y-8">
            {dateGroups.map((dateGroup) => (
              <div key={dateGroup} className="space-y-4">
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{dateGroup}</p>
                {byDate[dateGroup].map((tx: any) => {
                  const isTopup = tx.type === 'topup';
                  const amount = Number(tx.amount);
                  const icon = typeIcons[tx.type] || 'receipt';
                  return (
                    <div key={tx.id} className="flex items-center gap-4 group">
                      <div className={`size-12 rounded-xl flex items-center justify-center transition-transform group-active:scale-95 ${amount > 0 ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'}`}>
                        <span className="material-symbols-outlined">{icon}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold">{tx.description || (isTopup ? 'เติมเงิน' : 'ชำระเงิน')}</h4>
                        <p className="text-gray-500 text-xs font-medium">{tx.time ? `${tx.date} ${tx.time}` : tx.date}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${amount > 0 ? 'text-primary' : ''}`}>
                          {amount > 0 ? '+' : ''}฿{Math.abs(amount).toFixed(2)}
                        </p>
                        <p className="text-gray-400 text-[9px] font-medium uppercase tracking-wider">{tx.status || 'completed'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;
