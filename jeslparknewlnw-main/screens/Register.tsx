
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleLineRegister = () => {
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white animate-fade-in relative">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md px-4 py-4 flex items-center justify-between">
        <button onClick={() => navigate('/login')} className="size-12 flex items-center justify-center rounded-full active:bg-gray-100 transition-colors">
          <span className="material-symbols-outlined text-dark-green font-bold">arrow_back</span>
        </button>
        <h2 className="text-lg font-black text-dark-green tracking-tight">สมัครสมาชิก</h2>
        <div className="size-12"></div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-20">
        <div className="mb-12 text-center">
          <div className="size-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-gray-100">
            <span className="material-symbols-outlined text-primary text-5xl font-light">account_circle</span>
          </div>
          <h1 className="text-[34px] font-black text-dark-green leading-none tracking-tighter mb-4">เริ่มต้นใช้งาน</h1>
          <p className="text-gray-400 font-bold text-base">สะสมคะแนนได้ทันทีเพียงเชื่อมต่อผ่าน LINE</p>
        </div>

        {error && (
          <div className="w-full bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm text-center mb-4">
            {error}
          </div>
        )}

        <button 
          onClick={handleLineRegister}
          className="w-full h-16 rounded-2xl bg-[#06C755] text-white font-black text-lg transition-all shadow-xl shadow-[#06C755]/20 flex items-center justify-center gap-4 active:scale-[0.97] hover:brightness-105 relative overflow-hidden group"
        >
          <>
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <div className="size-9 bg-white rounded-lg flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#06C755] text-2xl fill-1" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
            </div>
            <span className="tracking-tight">สมัครสมาชิกด้วย LINE</span>
          </>
        </button>

        <p className="mt-8 text-sm font-bold text-gray-400">
          มีบัญชีอยู่แล้ว? <button onClick={() => navigate('/login')} className="text-primary ml-1 font-black underline uppercase tracking-widest">เข้าสู่ระบบ</button>
        </p>
      </div>

      <div className="p-10 text-center">
        <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.6em]">Secure Authentication via LINE</p>
      </div>
    </div>
  );
};

export default Register;
