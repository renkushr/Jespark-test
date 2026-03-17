import { useState, useEffect } from 'react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

interface Setting {
  key: string;
  value: any;
  type: string;
  description: string;
}

interface SettingsGroup {
  points: Setting[];
  tiers: Setting[];
  rewards: Setting[];
  general: Setting[];
}

export default function Settings() {
  const [settings, setSettings] = useState<SettingsGroup>({ points: [], tiers: [], rewards: [], general: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'points' | 'tiers' | 'rewards' | 'general'>('points');
  const [editedValues, setEditedValues] = useState<Record<string, any>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/settings`);
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        const initial: Record<string, any> = {};
        Object.values(data.settings).flat().forEach((setting: any) => { initial[setting.key] = setting.value; });
        setEditedValues(initial);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showError('ไม่สามารถโหลดการตั้งค่าได้');
    } finally { setLoading(false); }
  };

  const showSuccess = (message: string) => { setSuccessMessage(message); setTimeout(() => setSuccessMessage(''), 3000); };
  const showError = (message: string) => { setErrorMessage(message); setTimeout(() => setErrorMessage(''), 3000); };

  const handleValueChange = (key: string, value: any) => { setEditedValues(prev => ({ ...prev, [key]: value })); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const changedSettings = Object.keys(editedValues)
        .filter(key => { const original = Object.values(settings).flat().find((s: any) => s.key === key); return original && original.value !== editedValues[key]; })
        .map(key => ({ key, value: editedValues[key] }));
      if (changedSettings.length === 0) { showError('ไม่มีการเปลี่ยนแปลง'); setSaving(false); return; }
      const response = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: changedSettings }),
      });
      if (response.ok) { const data = await response.json(); showSuccess(`บันทึกสำเร็จ ${data.summary.successful} รายการ`); loadSettings(); }
      else { const data = await response.json(); showError(data.error || 'เกิดข้อผิดพลาด'); }
    } catch (error) { console.error('Save error:', error); showError('เกิดข้อผิดพลาดในการบันทึก'); }
    finally { setSaving(false); }
  };

  const handleReset = () => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการเปลี่ยนแปลง?')) return;
    const initial: Record<string, any> = {};
    Object.values(settings).flat().forEach((setting: any) => { initial[setting.key] = setting.value; });
    setEditedValues(initial);
    showSuccess('ยกเลิกการเปลี่ยนแปลงแล้ว');
  };

  const hasChanges = () => Object.keys(editedValues).some(key => {
    const original = Object.values(settings).flat().find((s: any) => s.key === key);
    return original && original.value !== editedValues[key];
  });

  const getSettingLabel = (key: string) => {
    const labels: Record<string, string> = {
      'points_earn_rate': 'อัตราการให้คะแนน (%)', 'points_value': 'มูลค่า 1 คะแนน (บาท)',
      'points_expiry_days': 'คะแนนหมดอายุ (วัน)', 'points_min_use': 'คะแนนขั้นต่ำที่ใช้ได้',
      'points_max_use_per_transaction': 'คะแนนสูงสุดต่อครั้ง', 'points_max_discount_percent': 'ส่วนลดสูงสุด (%)',
      'tier_bronze_min_points': 'Bronze - คะแนนขั้นต่ำ', 'tier_silver_min_points': 'Silver - คะแนนขั้นต่ำ',
      'tier_gold_min_points': 'Gold - คะแนนขั้นต่ำ', 'tier_platinum_min_points': 'Platinum - คะแนนขั้นต่ำ',
      'tier_bronze_multiplier': 'Bronze - ตัวคูณคะแนน', 'tier_silver_multiplier': 'Silver - ตัวคูณคะแนน',
      'tier_gold_multiplier': 'Gold - ตัวคูณคะแนน', 'tier_platinum_multiplier': 'Platinum - ตัวคูณคะแนน',
      'reward_max_per_user': 'ของรางวัลสูงสุดต่อคน (ต่อเดือน)', 'reward_delivery_days': 'ระยะเวลาจัดส่ง (วัน)',
      'reward_notification_enabled': 'แจ้งเตือนการแลกของรางวัล',
      'store_name': 'ชื่อร้าน', 'store_currency': 'สกุลเงิน', 'store_locale': 'ภาษา', 'maintenance_mode': 'โหมดปิดปรับปรุง',
    };
    return labels[key] || key;
  };

  const renderSettingInput = (setting: Setting) => {
    const value = editedValues[setting.key];
    if (setting.type === 'boolean') {
      return (
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" checked={value} onChange={(e) => handleValueChange(setting.key, e.target.checked)} className="sr-only peer" />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          <span className="ml-3 text-sm text-slate-600 font-medium">{value ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</span>
        </label>
      );
    }
    if (setting.type === 'number') {
      return (
        <input type="number" value={value} onChange={(e) => handleValueChange(setting.key, parseFloat(e.target.value))}
          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          step={setting.key.includes('multiplier') ? '0.1' : '1'} />
      );
    }
    return (
      <input type="text" value={value} onChange={(e) => handleValueChange(setting.key, e.target.value)}
        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
    );
  };

  const tabs = [
    { key: 'points' as const, icon: 'stars', label: 'คะแนน' },
    { key: 'tiers' as const, icon: 'workspace_premium', label: 'ระดับสมาชิก' },
    { key: 'rewards' as const, icon: 'redeem', label: 'ของรางวัล' },
    { key: 'general' as const, icon: 'settings', label: 'ทั่วไป' },
  ];

  const tierCards = [
    { key: 'bronze', label: 'Bronze', icon: 'workspace_premium', color: 'border-l-orange-400', iconBg: 'bg-orange-50 text-orange-500' },
    { key: 'silver', label: 'Silver', icon: 'workspace_premium', color: 'border-l-slate-400', iconBg: 'bg-slate-100 text-slate-500' },
    { key: 'gold', label: 'Gold', icon: 'workspace_premium', color: 'border-l-amber-400', iconBg: 'bg-amber-50 text-amber-500' },
    { key: 'platinum', label: 'Platinum', icon: 'diamond', color: 'border-l-violet-500', iconBg: 'bg-violet-50 text-violet-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Toast */}
      {successMessage && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-success text-white rounded-xl shadow-lg animate-slideInRight">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span className="text-sm font-bold">{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-danger text-white rounded-xl shadow-lg animate-slideInRight">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span className="text-sm font-bold">{errorMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-xl">settings</span>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">ตั้งค่าระบบ</h1>
            <p className="text-sm text-slate-500 mt-0.5">จัดการการตั้งค่าคะแนนและระบบทั้งหมด</p>
          </div>
        </div>
        {hasChanges() && (
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleReset} disabled={saving}>ยกเลิก</Button>
            <Button icon="save" size="sm" onClick={handleSave} isLoading={saving}>บันทึก</Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-fit overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.key ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
          <p className="text-sm text-slate-400 mt-3">กำลังโหลดการตั้งค่า...</p>
        </div>
      ) : (
        <>
          {/* Points Settings */}
          {activeTab === 'points' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-primary-50 border border-primary-100 rounded-xl">
                <span className="material-symbols-outlined text-primary text-[20px]">info</span>
                <p className="text-sm text-primary-800">การตั้งค่าเหล่านี้จะมีผลต่อการคำนวณคะแนนของลูกค้าทั้งระบบ</p>
              </div>
              {settings.points.map((setting) => (
                <Card key={setting.key}>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{getSettingLabel(setting.key)}</label>
                    {renderSettingInput(setting)}
                    <p className="text-[10px] text-slate-400">{setting.description}</p>
                  </div>
                </Card>
              ))}
              <Card title="ตัวอย่างการคำนวณ">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">ยอดซื้อ</span><span className="font-bold">1,000 บาท</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">อัตราคะแนน</span><span className="font-bold">{editedValues['points_earn_rate']}%</span></div>
                  <div className="flex justify-between pt-2 border-t border-slate-100">
                    <span className="text-slate-500">คะแนนที่ได้รับ</span>
                    <span className="text-lg font-black text-primary">{Math.floor(1000 * (editedValues['points_earn_rate'] / 100))} คะแนน</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-100"><span className="text-slate-500">ใช้คะแนน 100</span><span className="font-bold text-success">ส่วนลด {100 * editedValues['points_value']} บาท</span></div>
                </div>
              </Card>
            </div>
          )}

          {/* Tiers Settings */}
          {activeTab === 'tiers' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-violet-50 border border-violet-100 rounded-xl">
                <span className="material-symbols-outlined text-violet-600 text-[20px]">info</span>
                <p className="text-sm text-violet-800">ตัวคูณคะแนนจะเพิ่มคะแนนที่ลูกค้าได้รับตามระดับ</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tierCards.map((tier) => (
                  <div key={tier.key} className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-5 border-l-4 ${tier.color}`}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${tier.iconBg}`}>
                        <span className="material-symbols-outlined text-[18px]">{tier.icon}</span>
                      </div>
                      <h3 className="font-black text-slate-800">{tier.label}</h3>
                    </div>
                    {settings.tiers.filter(s => s.key.includes(tier.key)).map((setting) => (
                      <div key={setting.key} className="mb-3">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">{getSettingLabel(setting.key)}</label>
                        {renderSettingInput(setting)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <Card title="ตัวอย่าง (ยอดซื้อ 1,000 บาท)">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {tierCards.map((tier) => (
                    <div key={tier.key} className="text-center p-3 bg-slate-50 rounded-xl">
                      <p className="text-xs font-bold text-slate-500 mb-1">{tier.label}</p>
                      <p className="text-lg font-black text-slate-800">
                        {Math.floor(1000 * 0.1 * (editedValues[`tier_${tier.key}_multiplier`] || 1))} คะแนน
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Rewards Settings */}
          {activeTab === 'rewards' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                <span className="material-symbols-outlined text-success text-[20px]">info</span>
                <p className="text-sm text-emerald-800">การตั้งค่าเหล่านี้จะมีผลต่อการแลกของรางวัล</p>
              </div>
              {settings.rewards.map((setting) => (
                <Card key={setting.key}>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{getSettingLabel(setting.key)}</label>
                    {renderSettingInput(setting)}
                    <p className="text-[10px] text-slate-400">{setting.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="material-symbols-outlined text-slate-500 text-[20px]">info</span>
                <p className="text-sm text-slate-600">การตั้งค่าทั่วไปของระบบ</p>
              </div>
              {settings.general.map((setting) => (
                <Card key={setting.key}>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{getSettingLabel(setting.key)}</label>
                    {renderSettingInput(setting)}
                    <p className="text-[10px] text-slate-400">{setting.description}</p>
                  </div>
                </Card>
              ))}
              {editedValues['maintenance_mode'] && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <span className="material-symbols-outlined text-danger text-[20px]">warning</span>
                  <div>
                    <p className="font-bold text-red-800 text-sm">คำเตือน: โหมดปิดปรับปรุง</p>
                    <p className="text-xs text-red-600 mt-1">เมื่อเปิดโหมดนี้ ลูกค้าจะไม่สามารถใช้งานระบบได้ชั่วคราว</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
