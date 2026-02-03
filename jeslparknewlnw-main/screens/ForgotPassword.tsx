
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 animate-fade-in p-6">
       <header className="mb-12">
          <button onClick={() => navigate(-1)} className="size-12 rounded-full border border-gray-100 bg-white flex items-center justify-center shadow-sm">
             <span className="material-symbols-outlined">arrow_back</span>
          </button>
       </header>

       <div className="flex-1 flex flex-col items-center gap-8">
          <div className="relative">
             <div className="absolute inset-0 bg-primary/10 blur-[50px] rounded-full scale-150"></div>
             <div className="relative size-48 rounded-[3rem] bg-gradient-to-br from-white to-gray-50 flex items-center justify-center shadow-2xl border border-white animate-slide-up">
                <span className="material-symbols-outlined text-primary text-8xl" style={{ fontVariationSettings: "'FILL' 1" }}>lock_reset</span>
                <div className="absolute -top-3 -right-3 size-12 rounded-full bg-primary flex items-center justify-center shadow-lg border-4 border-gray-50">
                   <span className="material-symbols-outlined text-dark-green font-black">question_mark</span>
                </div>
             </div>
          </div>

          <div className="text-center space-y-3">
             <h1 className="text-3xl font-black tracking-tight">Forgot Password?</h1>
             <p className="text-gray-400 text-sm font-medium leading-relaxed px-4">
                Don't worry! It happens. Please enter the details associated with your account.
             </p>
          </div>

          <div className="w-full space-y-6 mt-4">
             <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Registered Mobile or Email</label>
                <div className="relative">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <span className="material-symbols-outlined">contact_mail</span>
                   </div>
                   <input 
                     className="w-full bg-white border border-gray-100 rounded-2xl pl-14 pr-6 py-5 text-sm font-bold shadow-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                     placeholder="e.g. alex@example.com"
                   />
                </div>
             </div>
          </div>
       </div>

       <div className="pt-10 pb-4">
          <button className="w-full bg-primary hover:bg-primary-dark text-dark-green font-black text-lg py-5 rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-transform">
             <span>Submit</span>
             <span className="material-symbols-outlined font-black">arrow_forward</span>
          </button>
       </div>
    </div>
  );
};

export default ForgotPassword;