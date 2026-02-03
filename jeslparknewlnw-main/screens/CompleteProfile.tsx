
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

interface CompleteProfileProps {
  onComplete: () => void;
}

const CompleteProfile: React.FC<CompleteProfileProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    birthdate: '',
    gender: ''
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would involve API calls to save the data
    onComplete();
    navigate('/');
  };

  // Calculate progress based on filled fields
  const progress = useMemo(() => {
    const fields = Object.values(formData);
    // Fix: Explicitly cast value to string to resolve 'length' property error on unknown type
    const filledFields = fields.filter(value => (value as string).length > 0).length;
    return (filledFields / fields.length) * 100;
  }, [formData]);

  const isFormValid = formData.fullName.length > 3 && formData.phone.length >= 10;

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD] animate-slide-up relative overflow-hidden">
      {/* Dynamic Progress Bar - Global Top */}
      <div className="fixed top-0 left-0 w-full h-1.5 bg-gray-100 z-50">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-out shadow-[0_0_10px_rgba(19,236,19,0.5)]"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Professional Progress Header */}
      <header className="bg-white border-b border-gray-100 px-8 pt-10 pb-6 shrink-0 relative z-20">
        <div className="flex items-center justify-between mb-4">
          <div className="size-10 bg-dark-green rounded-xl flex items-center justify-center shadow-lg shadow-dark-green/10">
            <span className="text-primary text-xl font-black italic">J</span>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-0.5">ความสมบูรณ์ของโปรไฟล์</p>
            <p className="text-xs font-bold text-dark-green">{Math.round(progress)}% สำเร็จ</p>
          </div>
        </div>
        <h1 className="text-2xl font-black text-dark-green tracking-tight leading-none">สร้างบัญชีผู้ใช้</h1>
        <p className="text-gray-400 text-xs font-bold mt-2 uppercase tracking-widest">กรอกข้อมูลให้ครบเพื่อรับสิทธิพิเศษ</p>
      </header>

      <div className="flex-1 px-8 pt-8 pb-12 overflow-y-auto no-scrollbar relative z-10">
        <form className="space-y-8" onSubmit={handleSave}>
          
          {/* Section Heading */}
          <div className="flex items-center gap-3 pb-2 border-b border-gray-50">
            <span className="material-symbols-outlined text-primary text-xl">contact_page</span>
            <h3 className="text-xs font-black text-dark-green uppercase tracking-[0.2em]">ข้อมูลส่วนตัวพื้นฐาน</h3>
          </div>

          {/* Full Name Field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">ชื่อ-นามสกุล</label>
              <span className="text-[10px] text-gray-300 font-bold italic">จำเป็น</span>
            </div>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 z-10 group-focus-within:text-primary transition-colors">
                <span className="material-symbols-outlined text-[20px]">person</span>
              </div>
              <input 
                type="text" 
                placeholder="กรอกชื่อจริงและนามสกุล"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="w-full h-14 bg-white border border-gray-200 rounded-xl pl-14 pr-5 text-sm font-bold text-dark-green focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-300 placeholder:font-medium shadow-sm"
              />
              {formData.fullName.length > 3 && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 animate-fade-in">
                  <span className="material-symbols-outlined text-primary text-xl font-black">check_circle</span>
                </div>
              )}
            </div>
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">เบอร์โทรศัพท์ติดต่อ</label>
              <span className="text-[10px] text-gray-300 font-bold italic">จำเป็น</span>
            </div>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 z-10 group-focus-within:text-primary transition-colors">
                <span className="material-symbols-outlined text-[20px]">smartphone</span>
              </div>
              <input 
                type="tel" 
                placeholder="เช่น 0812345678"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full h-14 bg-white border border-gray-100 rounded-xl pl-14 pr-5 text-sm font-bold text-dark-green focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-300 placeholder:font-medium shadow-sm"
              />
              {formData.phone.length >= 10 && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 animate-fade-in">
                  <span className="material-symbols-outlined text-primary text-xl font-black">check_circle</span>
                </div>
              )}
            </div>
          </div>

          {/* Birthdate Field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">วันเกิด</label>
            </div>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 z-10 group-focus-within:text-primary transition-colors">
                <span className="material-symbols-outlined text-[20px]">cake</span>
              </div>
              <input 
                type="date" 
                value={formData.birthdate}
                onChange={(e) => setFormData({...formData, birthdate: e.target.value})}
                className="w-full h-14 bg-white border border-gray-200 rounded-xl pl-14 pr-5 text-sm font-bold text-dark-green focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm"
              />
              {formData.birthdate && (
                <div className="absolute right-12 top-1/2 -translate-y-1/2 animate-fade-in">
                  <span className="material-symbols-outlined text-primary text-xl font-black">check_circle</span>
                </div>
              )}
            </div>
            <div className="flex items-start gap-2 px-1 py-1">
              <span className="material-symbols-outlined text-primary text-sm mt-0.5">info</span>
              <p className="text-[10px] text-gray-500 leading-relaxed font-medium">เพื่อรับของขวัญและคะแนนโบนัสพิเศษในเดือนเกิด</p>
            </div>
          </div>

          {/* Gender Grid */}
          <div className="space-y-3">
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest px-1">ระบุเพศ</label>
            <div className="grid grid-cols-3 gap-3">
              {['ชาย', 'หญิง', 'อื่นๆ'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setFormData({...formData, gender: g})}
                  className={`h-12 rounded-xl border-2 font-bold text-xs transition-all flex items-center justify-center gap-2 ${formData.gender === g ? 'bg-primary/5 border-primary text-dark-green' : 'bg-white border-gray-100 text-gray-400'}`}
                >
                  {formData.gender === g && <span className="material-symbols-outlined text-sm font-black">check</span>}
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-8">
            <button 
              type="submit"
              disabled={!isFormValid}
              className={`w-full h-14 rounded-xl font-black text-base transition-all shadow-xl flex items-center justify-center gap-3 ${isFormValid ? 'bg-dark-green text-white shadow-dark-green/20 active:scale-[0.98] hover:bg-black' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
            >
              <span>บันทึกข้อมูลและเข้าสู่ระบบ</span>
              <span className="material-symbols-outlined font-black text-xl">security</span>
            </button>
            <div className="flex items-center justify-center gap-2 mt-6 opacity-40">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              <span className="text-[9px] font-bold uppercase tracking-widest">Verified Security Standards</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
