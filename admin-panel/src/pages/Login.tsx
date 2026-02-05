import { useState } from 'react';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual login logic
    if (email && password) {
      localStorage.setItem('admin_token', 'demo_token');
      onLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-green to-primary flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-white text-3xl">store</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Jespark Admin</h1>
          <p className="text-gray-500 mt-2">เข้าสู่ระบบเพื่อจัดการ</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              อีเมล
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="admin@jespark.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รหัสผ่าน
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-dark-green text-white font-bold py-3 rounded-lg transition-colors"
          >
            เข้าสู่ระบบ
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Demo: ใช้อีเมลและรหัสผ่านใดก็ได้
        </p>
      </div>
    </div>
  );
}
