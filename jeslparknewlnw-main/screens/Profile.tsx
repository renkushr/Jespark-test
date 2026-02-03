
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';

interface ProfileProps {
  user: User;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const sections = [
    {
      title: 'บัญชี',
      items: [
        { label: 'ตั้งค่าบัญชี', icon: 'person_outline', path: '/settings' },
        { label: 'ภาษา', icon: 'translate', value: 'ไทย' },
        { label: 'ความปลอดภัยและรหัส PIN', icon: 'lock_person' },
      ]
    },
    {
      title: 'ช่วยเหลือ',
      items: [
        { label: 'นโยบายความเป็นส่วนตัว', icon: 'policy' },
        { label: 'ศูนย์ความช่วยเหลือ', icon: 'help_outline' },
      ]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 animate-fade-in relative">
      <header className="bg-white p-4 pb-2 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="size-10 flex items-center justify-center rounded-full hover:bg-gray-100">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h2 className="text-lg font-bold pr-10 flex-1 text-center">โปรไฟล์</h2>
      </header>

      <div className="flex flex-col items-center py-8 gap-4">
        <div className="relative">
          <div className="size-32 rounded-full border-4 border-primary/20 p-1">
             <div 
               className="size-full rounded-full bg-cover bg-center shadow-lg" 
               style={{ backgroundImage: `url(${user.avatar})` }}
             />
          </div>
          <div className="absolute bottom-1 right-1 bg-primary text-dark-green rounded-full p-1.5 border-4 border-white shadow-md">
            <span className="material-symbols-outlined text-[16px] font-bold">edit</span>
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <div className="flex items-center justify-center gap-1 mt-1">
            <span className="material-symbols-outlined text-primary text-sm">workspace_premium</span>
            <span className="text-primary text-sm font-bold uppercase tracking-wider">สมาชิกระดับ {user.tier}</span>
          </div>
          <p className="text-gray-400 text-sm mt-1">เป็นสมาชิกตั้งแต่ปี {user.memberSince}</p>
        </div>
      </div>

      <div className="px-4 pb-32">
        {sections.map(section => (
          <div key={section.title} className="mb-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] px-2 mb-2">{section.title}</h3>
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              {section.items.map((item, idx) => (
                <div 
                  key={item.label}
                  onClick={() => item.path && navigate(item.path)}
                  className={`flex items-center justify-between p-4 cursor-pointer active:bg-gray-50 transition-colors ${idx !== section.items.length - 1 ? 'border-b border-gray-50' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">{item.icon}</span>
                    </div>
                    <span className="font-semibold text-sm">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.value && <span className="text-xs text-gray-400 font-medium">{item.value}</span>}
                    <span className="material-symbols-outlined text-gray-300">chevron_right</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <button 
          onClick={() => setShowLogoutModal(true)}
          className="w-full mt-4 flex items-center justify-center gap-2 bg-gray-100 text-red-500 font-bold py-4 rounded-2xl active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined">logout</span>
          <span>ออกจากระบบ</span>
        </button>
        <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-8 pb-10">Jespark เวอร์ชั่น 2.4.0</p>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowLogoutModal(false)}></div>
          <div className="relative w-full max-w-[320px] bg-white rounded-3xl p-6 shadow-2xl animate-slide-up">
            <div className="text-center">
              <div className="size-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-red-500 text-3xl">logout</span>
              </div>
              <h3 className="text-xl font-bold mb-2">ยืนยันการออกจากระบบ</h3>
              <p className="text-sm text-gray-500 mb-8">คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบบัญชี Jespark?</p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={onLogout}
                  className="w-full py-3.5 rounded-xl bg-dark-green text-white font-bold text-sm shadow-lg active:scale-95 transition-transform"
                >
                  ออกจากระบบ
                </button>
                <button 
                  onClick={() => setShowLogoutModal(false)}
                  className="w-full py-3.5 rounded-xl text-gray-400 font-bold text-sm active:bg-gray-50"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;