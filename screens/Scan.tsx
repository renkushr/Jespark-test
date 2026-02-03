
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';

interface ScanProps {
  user: User;
}

const Scan: React.FC<ScanProps> = ({ user }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'Earn' | 'Pay'>('Earn');

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 animate-slide-up">
      <header className="bg-white border-b border-gray-100">
        <div className="flex items-center p-4 justify-between">
          <button onClick={() => navigate(-1)} className="size-10 flex items-center justify-center rounded-full hover:bg-gray-100">
            <span className="material-symbols-outlined">close</span>
          </button>
          <h2 className="text-lg font-bold">Jespark</h2>
          <button className="size-10 flex items-center justify-center rounded-full hover:bg-gray-100">
            <span className="material-symbols-outlined">help_outline</span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6">
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 px-1">โหมดการทำรายการ</h3>
          <div className="flex h-12 w-full items-center justify-center rounded-xl bg-white p-1.5 shadow-sm border border-gray-100">
            <button 
              onClick={() => setMode('Earn')}
              className={`flex-1 h-full rounded-lg font-bold text-sm transition-all ${mode === 'Earn' ? 'bg-primary text-dark-green shadow-md' : 'text-gray-400'}`}
            >
              สะสมคะแนนเท่านั้น
            </button>
            <button 
              onClick={() => setMode('Pay')}
              className={`flex-1 h-full rounded-lg font-bold text-sm transition-all ${mode === 'Pay' ? 'bg-primary text-dark-green shadow-md' : 'text-gray-400'}`}
            >
              ชำระด้วยวอลเล็ต
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl flex flex-col items-center gap-8 border-4 border-primary/20">
          <div className="relative size-64 bg-white p-4 rounded-2xl border-2 border-primary flex items-center justify-center">
             <div 
               className="w-full h-full bg-cover bg-center" 
               style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCCpN6P-hxZ7i60wTtx_qhcamjsgEuze7TCYMw7pizOyNJZ81xUVOW4GrVqKeR7qgKbCQ6FDk7Azo1418eyfWgeClOkTt6VgWzjZgcmrAtRGdwCrkUS_Mg69RHqNbw5IRHIlFJWk1XMrSaJJTlDWtEmV6elVNR_jy8vljnxxJ_ydJF5gq7eQIST4-haR7co2rOPRea4HnhJ_8OcOSKVH23FB0c2TOo8ttq7pVtRBFIQZfMrPlliT-jRlr_des5cs50A3VQL4gMYL66R')" }}
             />
             <div className="absolute inset-0 flex items-center justify-center">
               <div className="size-12 bg-white rounded-xl flex items-center justify-center shadow-lg border-2 border-primary/20">
                 <span className="material-symbols-outlined text-primary font-bold">bolt</span>
               </div>
             </div>
          </div>

          <div className="w-full space-y-3">
             <div 
                className="w-full h-16 rounded-md opacity-80"
                style={{ background: "repeating-linear-gradient(90deg, #111811, #111811 2px, #fff 2px, #fff 4px, #111811 4px, #111811 5px, #fff 5px, #fff 8px)" }}
             />
             <div className="flex items-center justify-center gap-2 text-gray-500 font-mono text-sm tracking-[0.2em]">
               <span>123-456-789-001</span>
               <span className="material-symbols-outlined text-xs cursor-pointer">content_copy</span>
             </div>
          </div>

          <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
            <span className="material-symbols-outlined text-sm animate-spin" style={{ animationDuration: '3s' }}>sync</span>
            <span>รีเฟรชในอีก 42 วินาที</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">รหัสสมาชิก</p>
              <p className="font-bold text-lg">123-456-789</p>
           </div>
           <div className="bg-primary/10 p-5 rounded-2xl border border-primary/30">
              <p className="text-dark-green/80 text-[10px] font-bold uppercase tracking-wider">คะแนนคงเหลือ</p>
              <p className="font-black text-lg">{user.points.toLocaleString()} <span className="text-[10px]">คะแนน</span></p>
           </div>
        </div>

        <div className="bg-gray-100 p-4 rounded-2xl flex gap-3 items-center">
          <div className="size-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
            <span className="material-symbols-outlined">lightbulb</span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">กรุณาเพิ่มความสว่างหน้าจอหากเครื่องสแกนไม่สามารถอ่านโค้ดได้</p>
        </div>
      </main>
    </div>
  );
};

export default Scan;