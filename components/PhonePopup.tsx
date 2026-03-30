import React, { useState } from 'react';
import apiClient from '../src/api/client';

interface PhonePopupProps {
  userName: string;
  userPhone?: string;
  onComplete: () => void;
}

const THAI_NAME_REGEX = /^[ก-๏\s]+$/;
const isThaiName = (v: string) => THAI_NAME_REGEX.test(v.trim()) && v.trim().includes(' ');

const PhonePopup: React.FC<PhonePopupProps> = ({ userName, userPhone, onComplete }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState(userPhone || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [nameError, setNameError] = useState('');

  const handleNameChange = (val: string) => {
    setName(val);
    if (val.trim().length > 0 && !THAI_NAME_REGEX.test(val.trim())) {
      setNameError('กรุณากรอกเป็นภาษาไทยเท่านั้น');
    } else if (val.trim().length > 0 && !val.trim().includes(' ')) {
      setNameError('กรุณากรอกทั้งชื่อและนามสกุล');
    } else {
      setNameError('');
    }
  };

  const isValid = isThaiName(name) && phone.trim().length >= 10;

  const handleSave = async () => {
    if (!isValid) return;
    try {
      setSaving(true);
      setError('');
      await apiClient.updateProfile(name.trim(), phone.trim());
      onComplete();
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-br from-dark-green to-dark-green/90 p-6 text-center">
          <div className="size-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-primary text-3xl">person_add</span>
          </div>
          <h3 className="text-white text-xl font-black">ยินดีต้อนรับ!</h3>
          <p className="text-white/70 text-xs font-bold mt-1">กรอกข้อมูลเพื่อเริ่มสะสมคะแนน</p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-xs text-center font-bold">
              {error}
            </div>
          )}

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest px-1">ชื่อ-นามสกุล</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                <span className="material-symbols-outlined text-lg">person</span>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="ชื่อจริง นามสกุล (ภาษาไทย)"
                className={`w-full h-12 bg-gray-50 border rounded-xl pl-12 pr-4 text-sm font-bold text-dark-green focus:ring-2 outline-none transition-all ${nameError ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-primary focus:ring-primary/20'}`}
              />
              {isThaiName(name) && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                </div>
              )}
            </div>
            {nameError && (
              <p className="text-[10px] text-red-500 font-bold px-1">{nameError}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest px-1">เบอร์โทรศัพท์</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                <span className="material-symbols-outlined text-lg">smartphone</span>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="เช่น 0812345678"
                maxLength={10}
                className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 text-sm font-bold text-dark-green focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
              {phone.trim().length >= 10 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                </div>
              )}
            </div>
            <p className="text-[10px] text-gray-400 px-1">ใช้สำหรับระบุตัวตนเมื่อสะสมคะแนนที่หน้าร้าน</p>
          </div>

          {/* Submit */}
          <button
            onClick={handleSave}
            disabled={!isValid || saving}
            className="w-full py-3.5 bg-primary text-dark-green rounded-xl font-black text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:brightness-105 active:scale-[0.98]"
          >
            {saving ? (
              <>
                <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                กำลังบันทึก...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">how_to_reg</span>
                ยืนยันข้อมูล
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhonePopup;
