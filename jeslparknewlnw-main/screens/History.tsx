
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../src/api/client';

type ActivityType = 'All' | 'Points' | 'Wallet';

interface ActivityItem {
  id: string;
  title: string;
  date: string;
  dateGroup: string;
  amount: string;
  type: 'Points' | 'Wallet';
  icon: string;
  isGain: boolean;
  sortAt: number;
}

const History: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ActivityType>('All');
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tabs: ActivityType[] = ['All', 'Points', 'Wallet'];

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const [txRes, redemptionsRes] = await Promise.all([
          apiClient.getTransactions(50, 0),
          apiClient.getRedemptions().catch(() => ({ redemptions: [] })),
        ]);

        const items: ActivityItem[] = [];

        (txRes.transactions || []).forEach((t: any) => {
          const d = t.created_at ? new Date(t.created_at) : new Date();
          const isTopup = t.type === 'topup';
          items.push({
            id: `tx-${t.id}`,
            title: t.description || (isTopup ? 'เติมเงิน' : 'ชำระเงิน'),
            date: t.date && t.time ? `${t.date} ${t.time}` : t.date || '-',
            dateGroup: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'),
            amount: isTopup ? `+฿${Number(t.amount).toFixed(2)}` : `-฿${Math.abs(Number(t.amount)).toFixed(2)}`,
            type: 'Wallet',
            icon: isTopup ? 'account_balance_wallet' : 'local_mall',
            isGain: isTopup,
            sortAt: d.getTime(),
          });
        });

        (redemptionsRes.redemptions || []).forEach((r: any) => {
          const d = r.createdAt ? new Date(r.createdAt) : r.created_at ? new Date(r.created_at) : new Date();
          items.push({
            id: `red-${r.id}`,
            title: (r.reward && r.reward.title) || 'แลกคะแนน',
            date: d.toLocaleDateString('th-TH') + ' ' + d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
            dateGroup: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'),
            amount: `-${r.pointsUsed != null ? r.pointsUsed : r.points_used || 0} pts`,
            type: 'Points',
            icon: 'card_giftcard',
            isGain: false,
            sortAt: d.getTime(),
          });
        });

        items.sort((a, b) => b.sortAt - a.sortAt);

        setActivities(items);
      } catch (err: any) {
        setError(err.message || 'โหลดประวัติไม่สำเร็จ');
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const filteredActivities = activeTab === 'All' ? activities : activities.filter(a => a.type === activeTab);
  const dateGroups = Array.from(new Set(filteredActivities.map(a => a.dateGroup))).sort().reverse();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 animate-fade-in pb-24">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center p-4 justify-between">
          <button onClick={() => navigate(-1)} className="size-10 flex items-center justify-center rounded-full hover:bg-gray-100">
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <h2 className="text-lg font-bold flex-1 text-center pr-10">ประวัติการใช้งาน</h2>
          <div className="size-10" />
        </div>

        <div className="flex border-b border-gray-100 px-4">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-sm font-bold transition-all relative ${activeTab === tab ? 'text-primary' : 'text-gray-400'}`}
            >
              {tab === 'All' ? 'ทั้งหมด' : tab === 'Points' ? 'คะแนน' : 'กระเป๋าเงิน'}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
            </button>
          ))}
        </div>
      </header>

      <main>
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-xl mx-4 mt-4 text-red-600 text-sm text-center">
            {error}
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <span className="material-symbols-outlined text-4xl mb-2">history</span>
            <p className="text-sm font-bold">ยังไม่มีประวัติ</p>
          </div>
        ) : (
          dateGroups.map(group => {
            const label = (() => {
              const [y, m] = group.split('-');
              const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
              return `${months[parseInt(m, 10) - 1]} ${y}`;
            })();
            return (
              <div key={group}>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-5 py-4 bg-gray-50/50">{label}</h3>
                <div className="divide-y divide-gray-50">
                  {filteredActivities.filter(a => a.dateGroup === group).map(item => (
                    <div key={item.id} className="flex items-center justify-between p-5 bg-white active:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 ${item.isGain ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'}`}>
                          <span className="material-symbols-outlined">{item.icon}</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold line-clamp-1">{item.title}</h4>
                          <p className="text-xs text-gray-400 mt-1 font-medium">{item.date}</p>
                        </div>
                      </div>
                      <p className={`text-base font-black ${item.isGain ? 'text-primary' : 'text-dark-green'}`}>
                        {item.amount}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
};

export default History;
