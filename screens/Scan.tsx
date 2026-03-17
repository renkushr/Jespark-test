import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { User } from '../types';

interface ScanProps {
  user: User;
}

const Scan: React.FC<ScanProps> = ({ user }) => {
  const navigate = useNavigate();
  const [brightness, setBrightness] = useState(false);

  const qrValue = user.memberId || `JESPARK-${user.name}`;

  return (
    <div className={`flex flex-col min-h-screen animate-slide-up transition-colors duration-300 ${brightness ? 'bg-white' : 'bg-gray-50'}`}>
      <header className="bg-white border-b border-gray-100">
        <div className="flex items-center p-4 justify-between">
          <button onClick={() => navigate(-1)} className="size-10 flex items-center justify-center rounded-full hover:bg-gray-100">
            <span className="material-symbols-outlined">close</span>
          </button>
          <h2 className="text-lg font-bold">Jespark</h2>
          <button onClick={() => setBrightness(!brightness)} className="size-10 flex items-center justify-center rounded-full hover:bg-gray-100">
            <span className="material-symbols-outlined">{brightness ? 'brightness_high' : 'brightness_medium'}</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full space-y-6 border border-gray-100">
          {/* Member Info */}
          <div className="space-y-1">
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">JESPARK {user.tier.toUpperCase()}</p>
            <h3 className="text-xl font-black text-dark-green">{user.name}</h3>
            <p className="text-xs text-gray-400 font-bold tracking-wider">{user.memberId || '-'}</p>
          </div>

          {/* QR Code */}
          <div className="flex items-center justify-center py-4">
            <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 shadow-inner">
              <QRCodeSVG
                value={qrValue}
                size={200}
                level="H"
                bgColor="#ffffff"
                fgColor="#111811"
                includeMargin={false}
              />
            </div>
          </div>

          {/* Points */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">คะแนนสะสม</p>
            <p className="text-2xl font-black text-primary">{user.points.toLocaleString()} <span className="text-sm text-gray-500">คะแนน</span></p>
          </div>

          <p className="text-[10px] text-gray-400 font-bold">แสดง QR Code นี้ที่เคาน์เตอร์เพื่อสะสมคะแนน</p>

          <button
            onClick={() => navigate('/')}
            className="w-full py-3 bg-primary text-dark-green rounded-xl font-black text-sm hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">home</span>
            กลับหน้าหลัก
          </button>
        </div>
      </main>
    </div>
  );
};

export default Scan;