
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../src/context/AuthContext';
import { liffService } from '../src/services/liff.service';
import { isLiffConfigured } from '../src/config/liff';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { lineLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [liffReady, setLiffReady] = useState(false);
  const [liffNotConfigured, setLiffNotConfigured] = useState(false);

  useEffect(() => {
    const setupLiff = async () => {
      if (!isLiffConfigured()) {
        setLiffNotConfigured(true);
        setLiffReady(true);
        return;
      }

      const initialized = await liffService.init();
      setLiffReady(initialized);

      if (initialized && liffService.isLoggedIn()) {
        await handleLiffLogin();
      }
    };

    setupLiff();
  }, []);

  const handleLiffLogin = async () => {
    try {
      setLoading(true);
      setError('');

      const profile = await liffService.getProfile();
      if (!profile) {
        throw new Error('Failed to get LINE profile');
      }

      await lineLogin(
        profile.userId,
        profile.displayName,
        profile.email,
        profile.pictureUrl
      );
      
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'เข้าสู่ระบบไม่สำเร็จ');
      setLoading(false);
    }
  };

  const handleLineLogin = () => {
    if (liffNotConfigured) {
      setError('กรุณาตั้งค่า LIFF ID ใน .env เพื่อเข้าสู่ระบบผ่าน LINE');
      return;
    }
    if (!liffReady) {
      setError('กำลังเตรียมระบบ กรุณารอสักครู่...');
      return;
    }
    liffService.login();
  };

  return (
    <div className="flex flex-col min-h-screen bg-white animate-fade-in relative overflow-hidden">
      {/* Premium Background elements */}
      <div className="absolute top-[-10%] right-[-10%] size-80 bg-primary/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-5%] left-[-5%] size-64 bg-dark-green/5 rounded-full blur-[100px]"></div>
      
      <div className="flex-1 flex flex-col items-center justify-center px-10 w-full max-w-md mx-auto relative z-10">
        
        {/* Professional Logo Branding */}
        <div className="mb-12 relative">
          <div className="size-28 bg-dark-green rounded-[2rem] flex items-center justify-center shadow-2xl transform hover:rotate-0 transition-transform duration-500 -rotate-6 border-[6px] border-white ring-1 ring-gray-100">
            <span className="text-primary text-6xl font-black italic tracking-tighter">J</span>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-lg border border-gray-50">
            <span className="material-symbols-outlined text-primary text-sm font-black">verified</span>
          </div>
        </div>

        {/* Welcome Section with high-end typography */}
        <div className="text-center mb-10 space-y-2">
          <h1 className="text-3xl font-black text-dark-green tracking-tight">
            Jespark Rewards
          </h1>
          <p className="text-gray-400 font-bold text-sm tracking-wide">
            Lifestyle Excellence & Beyond
          </p>
        </div>

        {/* Official LINE Login Button - Trust-focused */}
        <div className="w-full space-y-6">
          {liffNotConfigured && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-xs text-center">
              <span className="font-bold">ยังไม่ได้ตั้งค่า LIFF:</span> ใส่ VITE_LIFF_ID ใน .env เพื่อเข้าสู่ระบบผ่าน LINE
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm text-center">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <button 
              onClick={handleLineLogin}
              disabled={loading || liffNotConfigured}
              className="w-full h-14 rounded-xl bg-[#06C755] text-white font-black text-base transition-all shadow-lg shadow-[#06C755]/20 flex items-center justify-center gap-3 active:scale-[0.98] hover:brightness-105 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="animate-spin material-symbols-outlined">progress_activity</span>
              ) : (
                <>
                  <div className="size-8 bg-white rounded-md flex items-center justify-center shrink-0 shadow-sm">
                    <span className="material-symbols-outlined text-[#06C755] text-xl fill-1" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
                  </div>
                  <span className="tracking-tight">เข้าสู่ระบบผ่าน LINE</span>
                </>
              )}
            </button>
            
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <span className="material-symbols-outlined text-[16px]">lock</span>
              <span className="text-[11px] font-bold uppercase tracking-widest">การเชื่อมต่อที่ปลอดภัย 256-bit SSL</span>
            </div>
          </div>
          
          <div className="px-6 text-center border-t border-gray-50 pt-8">
            <p className="text-[10px] text-gray-400 leading-relaxed font-bold uppercase tracking-tighter">
              โดยการเข้าใช้งาน คุณยอมรับ <button className="text-dark-green underline underline-offset-2">เงื่อนไขการใช้งาน</button> <br/>และ <button className="text-dark-green underline underline-offset-2">นโยบายความเป็นส่วนตัว</button>
            </p>
          </div>
        </div>

        {/* Help Center with premium touch */}
        <div className="mt-12">
          <button className="flex items-center gap-2 text-gray-300 hover:text-primary transition-colors py-2 px-5 rounded-full text-[11px] font-black uppercase tracking-widest border border-gray-100">
            <span className="material-symbols-outlined text-sm">support_agent</span>
            ศูนย์ช่วยเหลือ
          </button>
        </div>
      </div>

      {/* Corporate Footer */}
      <div className="py-8 text-center opacity-40 relative z-10">
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-dark-green">Official Partner of Jespark Global</p>
      </div>
    </div>
  );
};

export default Login;
