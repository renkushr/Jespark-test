import { useState, useEffect } from 'react';

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
  const [settings, setSettings] = useState<SettingsGroup>({
    points: [],
    tiers: [],
    rewards: [],
    general: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'points' | 'tiers' | 'rewards' | 'general'>('points');
  const [editedValues, setEditedValues] = useState<Record<string, any>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/settings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        
        // Initialize edited values
        const initial: Record<string, any> = {};
        Object.values(data.settings).flat().forEach((setting: any) => {
          initial[setting.key] = setting.value;
        });
        setEditedValues(initial);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showError('ไม่สามารถโหลดการตั้งค่าได้');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 3000);
  };

  const handleValueChange = (key: string, value: any) => {
    setEditedValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Get only changed values
      const changedSettings = Object.keys(editedValues)
        .filter(key => {
          const original = Object.values(settings).flat().find((s: any) => s.key === key);
          return original && original.value !== editedValues[key];
        })
        .map(key => ({
          key,
          value: editedValues[key]
        }));

      if (changedSettings.length === 0) {
        showError('ไม่มีการเปลี่ยนแปลง');
        setSaving(false);
        return;
      }

      const response = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify({ settings: changedSettings }),
      });

      if (response.ok) {
        const data = await response.json();
        showSuccess(`บันทึกสำเร็จ ${data.summary.successful} รายการ`);
        loadSettings(); // Reload to get fresh data
      } else {
        const data = await response.json();
        showError(data.error || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Save error:', error);
      showError('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการเปลี่ยนแปลง?')) return;
    
    // Reset to original values
    const initial: Record<string, any> = {};
    Object.values(settings).flat().forEach((setting: any) => {
      initial[setting.key] = setting.value;
    });
    setEditedValues(initial);
    showSuccess('ยกเลิกการเปลี่ยนแปลงแล้ว');
  };

  const renderSettingInput = (setting: Setting) => {
    const value = editedValues[setting.key];

    if (setting.type === 'boolean') {
      return (
        <div className="flex items-center">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleValueChange(setting.key, e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            <span className="ml-3 text-sm text-gray-700">
              {value ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
            </span>
          </label>
        </div>
      );
    }

    if (setting.type === 'number') {
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => handleValueChange(setting.key, parseFloat(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          step={setting.key.includes('multiplier') ? '0.1' : '1'}
        />
      );
    }

    return (
      <input
        type="text"
        value={value}
        onChange={(e) => handleValueChange(setting.key, e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
      />
    );
  };

  const getSettingLabel = (key: string) => {
    const labels: Record<string, string> = {
      // Points
      'points_earn_rate': 'อัตราการให้คะแนน (%)',
      'points_value': 'มูลค่า 1 คะแนน (บาท)',
      'points_expiry_days': 'คะแนนหมดอายุ (วัน)',
      'points_min_use': 'คะแนนขั้นต่ำที่ใช้ได้',
      'points_max_use_per_transaction': 'คะแนนสูงสุดต่อครั้ง',
      'points_max_discount_percent': 'ส่วนลดสูงสุด (%)',
      
      // Tiers
      'tier_bronze_min_points': 'Bronze - คะแนนขั้นต่ำ',
      'tier_silver_min_points': 'Silver - คะแนนขั้นต่ำ',
      'tier_gold_min_points': 'Gold - คะแนนขั้นต่ำ',
      'tier_platinum_min_points': 'Platinum - คะแนนขั้นต่ำ',
      'tier_bronze_multiplier': 'Bronze - ตัวคูณคะแนน',
      'tier_silver_multiplier': 'Silver - ตัวคูณคะแนน',
      'tier_gold_multiplier': 'Gold - ตัวคูณคะแนน',
      'tier_platinum_multiplier': 'Platinum - ตัวคูณคะแนน',
      
      // Rewards
      'reward_max_per_user': 'ของรางวัลสูงสุดต่อคน (ต่อเดือน)',
      'reward_delivery_days': 'ระยะเวลาจัดส่ง (วัน)',
      'reward_notification_enabled': 'แจ้งเตือนการแลกของรางวัล',
      
      // General
      'store_name': 'ชื่อร้าน',
      'store_currency': 'สกุลเงิน',
      'store_locale': 'ภาษา',
      'maintenance_mode': 'โหมดปิดปรับปรุง'
    };
    return labels[key] || key;
  };

  const hasChanges = () => {
    return Object.keys(editedValues).some(key => {
      const original = Object.values(settings).flat().find((s: any) => s.key === key);
      return original && original.value !== editedValues[key];
    });
  };

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          ✅ {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          ❌ {errorMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-2xl">settings</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">ตั้งค่าระบบ</h1>
            <p className="text-gray-500">จัดการการตั้งค่าคะแนนและระบบทั้งหมด</p>
          </div>
        </div>
        
        {/* Save Buttons */}
        {hasChanges() && (
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              disabled={saving}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-dark-green transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined">save</span>
              {saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('points')}
            className={`flex-1 min-w-[120px] px-6 py-4 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'points'
                ? 'text-primary border-b-2 border-primary bg-green-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            ⭐ คะแนน
          </button>
          <button
            onClick={() => setActiveTab('tiers')}
            className={`flex-1 min-w-[120px] px-6 py-4 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'tiers'
                ? 'text-primary border-b-2 border-primary bg-green-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            🏆 ระดับสมาชิก
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`flex-1 min-w-[120px] px-6 py-4 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'rewards'
                ? 'text-primary border-b-2 border-primary bg-green-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            🎁 ของรางวัล
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 min-w-[120px] px-6 py-4 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'general'
                ? 'text-primary border-b-2 border-primary bg-green-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            ⚙️ ทั่วไป
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-gray-600">กำลังโหลดการตั้งค่า...</p>
          </div>
        ) : (
          <div className="p-6">
            {/* Points Settings */}
            {activeTab === 'points' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-blue-800 text-sm">
                    <strong>💡 คำแนะนำ:</strong> การตั้งค่าเหล่านี้จะมีผลต่อการคำนวณคะแนนของลูกค้าทั้งระบบ
                  </p>
                </div>

                {settings.points.map((setting) => (
                  <div key={setting.key} className="border border-gray-200 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {getSettingLabel(setting.key)}
                    </label>
                    {renderSettingInput(setting)}
                    <p className="text-xs text-gray-500 mt-2">{setting.description}</p>
                  </div>
                ))}

                {/* Example Calculation */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                  <h3 className="font-semibold text-gray-800 mb-3">📊 ตัวอย่างการคำนวณ:</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>ยอดซื้อ: 1,000 บาท</p>
                    <p>อัตราคะแนน: {editedValues['points_earn_rate']}%</p>
                    <p className="font-bold text-primary text-lg">
                      คะแนนที่ได้รับ: {Math.floor(1000 * (editedValues['points_earn_rate'] / 100))} คะแนน
                    </p>
                    <hr className="my-2" />
                    <p>ใช้คะแนน: 100 คะแนน</p>
                    <p>มูลค่า 1 คะแนน: {editedValues['points_value']} บาท</p>
                    <p className="font-bold text-green-600">
                      ส่วนลด: {100 * editedValues['points_value']} บาท
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tiers Settings */}
            {activeTab === 'tiers' && (
              <div className="space-y-6">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                  <p className="text-purple-800 text-sm">
                    <strong>💡 คำแนะนำ:</strong> ตัวคูณคะแนนจะเพิ่มคะแนนที่ลูกค้าได้รับตามระดับ
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bronze */}
                  <div className="border-2 border-orange-300 rounded-lg p-4 bg-orange-50">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">🥉</span>
                      <h3 className="text-lg font-bold text-gray-800">Bronze</h3>
                    </div>
                    {settings.tiers
                      .filter(s => s.key.includes('bronze'))
                      .map((setting) => (
                        <div key={setting.key} className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {getSettingLabel(setting.key)}
                          </label>
                          {renderSettingInput(setting)}
                        </div>
                      ))}
                  </div>

                  {/* Silver */}
                  <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">🥈</span>
                      <h3 className="text-lg font-bold text-gray-800">Silver</h3>
                    </div>
                    {settings.tiers
                      .filter(s => s.key.includes('silver'))
                      .map((setting) => (
                        <div key={setting.key} className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {getSettingLabel(setting.key)}
                          </label>
                          {renderSettingInput(setting)}
                        </div>
                      ))}
                  </div>

                  {/* Gold */}
                  <div className="border-2 border-yellow-400 rounded-lg p-4 bg-yellow-50">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">🥇</span>
                      <h3 className="text-lg font-bold text-gray-800">Gold</h3>
                    </div>
                    {settings.tiers
                      .filter(s => s.key.includes('gold'))
                      .map((setting) => (
                        <div key={setting.key} className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {getSettingLabel(setting.key)}
                          </label>
                          {renderSettingInput(setting)}
                        </div>
                      ))}
                  </div>

                  {/* Platinum */}
                  <div className="border-2 border-blue-400 rounded-lg p-4 bg-blue-50">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">💎</span>
                      <h3 className="text-lg font-bold text-gray-800">Platinum</h3>
                    </div>
                    {settings.tiers
                      .filter(s => s.key.includes('platinum'))
                      .map((setting) => (
                        <div key={setting.key} className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {getSettingLabel(setting.key)}
                          </label>
                          {renderSettingInput(setting)}
                        </div>
                      ))}
                  </div>
                </div>

                {/* Example */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-6">
                  <h3 className="font-semibold text-gray-800 mb-3">📊 ตัวอย่าง:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">🥉 Bronze</p>
                      <p className="font-bold">1,000 บาท → {Math.floor(1000 * 0.1 * (editedValues['tier_bronze_multiplier'] || 1))} คะแนน</p>
                    </div>
                    <div>
                      <p className="text-gray-600">🥈 Silver</p>
                      <p className="font-bold">1,000 บาท → {Math.floor(1000 * 0.1 * (editedValues['tier_silver_multiplier'] || 1.2))} คะแนน</p>
                    </div>
                    <div>
                      <p className="text-gray-600">🥇 Gold</p>
                      <p className="font-bold">1,000 บาท → {Math.floor(1000 * 0.1 * (editedValues['tier_gold_multiplier'] || 1.5))} คะแนน</p>
                    </div>
                    <div>
                      <p className="text-gray-600">💎 Platinum</p>
                      <p className="font-bold">1,000 บาท → {Math.floor(1000 * 0.1 * (editedValues['tier_platinum_multiplier'] || 2))} คะแนน</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rewards Settings */}
            {activeTab === 'rewards' && (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-green-800 text-sm">
                    <strong>💡 คำแนะนำ:</strong> การตั้งค่าเหล่านี้จะมีผลต่อการแลกของรางวัล
                  </p>
                </div>

                {settings.rewards.map((setting) => (
                  <div key={setting.key} className="border border-gray-200 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {getSettingLabel(setting.key)}
                    </label>
                    {renderSettingInput(setting)}
                    <p className="text-xs text-gray-500 mt-2">{setting.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                  <p className="text-gray-800 text-sm">
                    <strong>💡 คำแนะนำ:</strong> การตั้งค่าทั่วไปของระบบ
                  </p>
                </div>

                {settings.general.map((setting) => (
                  <div key={setting.key} className="border border-gray-200 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {getSettingLabel(setting.key)}
                    </label>
                    {renderSettingInput(setting)}
                    <p className="text-xs text-gray-500 mt-2">{setting.description}</p>
                  </div>
                ))}

                {/* Warning for Maintenance Mode */}
                {editedValues['maintenance_mode'] && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-800">
                      <span className="material-symbols-outlined">warning</span>
                      <p className="font-semibold">คำเตือน: โหมดปิดปรับปรุง</p>
                    </div>
                    <p className="text-sm text-red-700 mt-2">
                      เมื่อเปิดโหมดนี้ ลูกค้าจะไม่สามารถใช้งานระบบได้ชั่วคราว
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
