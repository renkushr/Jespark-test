
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple admin check (in production, this should be API-based)
    if (username === 'admin' && password === 'admin123') {
      setLoading(true);
      setTimeout(() => {
        localStorage.setItem('adminToken', 'admin_' + Date.now());
        navigate('/admin/dashboard');
      }, 500);
    } else {
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-green to-green-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="size-20 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <span className="material-symbols-outlined text-dark-green text-5xl font-bold">admin_panel_settings</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Admin Panel</h1>
          <p className="text-primary/80 font-bold">Jespark Rewards System</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-black text-dark-green mb-6">เข้าสู่ระบบ</h2>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                ชื่อผู้ใช้
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none font-medium"
                placeholder="admin"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                รหัสผ่าน
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none font-medium"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-red-600 text-xl">error</span>
                <span className="text-red-600 font-bold text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-dark-green text-primary rounded-xl font-black text-lg hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">login</span>
                  เข้าสู่ระบบ
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-dark-green font-bold text-sm flex items-center gap-1 mx-auto"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              กลับไปหน้าลูกค้า
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-primary/60 text-xs font-bold">
            Default: admin / admin123
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
