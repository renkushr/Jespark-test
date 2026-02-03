
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';

interface SettingsProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
}

const Settings: React.FC<SettingsProps> = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState('alex.johnson@jespark.com');

  const handleSave = () => {
    setUser({ ...user, name });
    navigate(-1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 animate-fade-in pb-32">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 pt-10 pb-4">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="size-10 flex items-center justify-center rounded-full hover:bg-gray-100">
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <h2 className="text-lg font-bold">ตั้งค่าบัญชี</h2>
          <button onClick={handleSave} className="text-primary font-black text-sm uppercase tracking-widest px-2">บันทึก</button>
        </div>
      </header>

      <div className="p-6 space-y-8">
        <div className="flex flex-col items-center">
          <div className="relative group cursor-pointer">
            <div className="size-32 rounded-full border-4 border-primary/20 p-1 bg-white">
              <div 
                className="size-full rounded-full bg-cover bg-center shadow-2xl" 
                style={{ backgroundImage: `url(${user.avatar})` }}
              />
            </div>
            <div className="absolute bottom-1 right-1 bg-dark-green text-white rounded-full p-2.5 border-[4px] border-white shadow-xl">
              <span className="material-symbols-outlined text-[20px] font-bold">photo_camera</span>
            </div>
          </div>
          <p className="mt-4 text-xs font-black text-primary uppercase tracking-widest">เปลี่ยนรูปภาพ</p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-gray-400 text-xl">account_circle</span>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">ข้อมูลส่วนตัว</h3>
          </div>
          
          <div className="space-y-4">
             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">ชื่อที่แสดง</label>
               <div className="relative">
                 <input 
                   className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold shadow-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                   value={name}
                   onChange={(e) => setName(e.target.value)}
                 />
                 <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">edit</span>
               </div>
             </div>

             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">อีเมล</label>
               <div className="relative">
                 <input 
                   className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold shadow-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                 />
                 <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">mail</span>
               </div>
             </div>
          </div>
        </div>

        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-gray-400 text-xl">notifications_active</span>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">การแจ้งเตือน</h3>
          </div>
          
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
             {[
               { label: 'แจ้งเตือนพุช', sub: 'อัปเดตคะแนนและรางวัล', active: true },
               { label: 'จดหมายข่าวอีเมล', sub: 'สรุปดีลพิเศษรายสัปดาห์', active: true },
               { label: 'แจ้งเตือน SMS', sub: 'การแจ้งเตือนบัญชีและความปลอดภัย', active: false },
             ].map((pref) => (
               <div key={pref.label} className="p-5 flex items-center justify-between">
                 <div>
                   <p className="text-sm font-bold">{pref.label}</p>
                   <p className="text-[10px] text-gray-400 font-medium mt-0.5">{pref.sub}</p>
                 </div>
                 <div className={`w-12 h-6 rounded-full relative transition-colors ${pref.active ? 'bg-primary' : 'bg-gray-200'}`}>
                    <div className={`size-5 rounded-full bg-white shadow-md absolute top-0.5 transition-all ${pref.active ? 'left-[26px]' : 'left-[2px]'}`} />
                 </div>
               </div>
             ))}
          </div>
        </div>

        <div className="pt-6 flex justify-center">
           <button className="text-red-500 text-[10px] font-black uppercase tracking-widest hover:opacity-70 transition-opacity">ลบบัญชีผู้ใช้</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;