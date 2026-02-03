
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../src/api/client';

const typeStyle: Record<string, { icon: string; iconBg: string; iconColor: string }> = {
  info: { icon: 'info', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
  success: { icon: 'check_circle', iconBg: 'bg-primary/10', iconColor: 'text-primary' },
  warning: { icon: 'warning', iconBg: 'bg-yellow-100', iconColor: 'text-yellow-600' },
  error: { icon: 'error', iconBg: 'bg-red-100', iconColor: 'text-red-600' },
  promotions: { icon: 'local_offer', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
};

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.getNotifications();
      setNotifications(res.notifications || []);
    } catch (err: any) {
      setError(err.message || 'โหลดการแจ้งเตือนไม่สำเร็จ');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await apiClient.markAllNotificationsRead();
      await load();
    } catch (_) {}
  };

  const styleFor = (type: string) => typeStyle[type?.toLowerCase()] || typeStyle.info;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 animate-fade-in pb-24">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 pt-10 pb-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="size-10 flex items-center justify-center rounded-full hover:bg-gray-100">
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <h1 className="text-xl font-bold">การแจ้งเตือน</h1>
          <button onClick={handleMarkAllRead} className="text-primary text-xs font-bold uppercase tracking-wider">
            อ่านทั้งหมด
          </button>
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
      ) : notifications.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          <span className="material-symbols-outlined text-4xl mb-2">notifications_none</span>
          <p className="text-sm font-bold">ยังไม่มีการแจ้งเตือน</p>
        </div>
      ) : (
        <div className="flex flex-col">
          {notifications.map((n) => {
            const style = styleFor(n.type);
            return (
              <div
                key={n.id}
                className={`p-5 flex gap-4 border-b border-gray-100 transition-colors active:bg-gray-50 relative ${!n.isRead ? 'bg-white' : 'bg-transparent opacity-80'}`}
              >
                {!n.isRead && (
                  <div className="absolute right-5 top-6 size-2.5 bg-primary rounded-full shadow-[0_0_8px_rgba(19,236,19,0.4)]" />
                )}
                <div className={`size-12 rounded-full flex items-center justify-center shrink-0 ${style.iconBg} ${style.iconColor}`}>
                  <span className="material-symbols-outlined">{style.icon}</span>
                </div>
                <div className="flex-1 pr-6">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-sm font-bold leading-tight">{n.title}</h3>
                    <span className="text-[9px] font-bold text-gray-400 uppercase ml-2 whitespace-nowrap">{n.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{n.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
