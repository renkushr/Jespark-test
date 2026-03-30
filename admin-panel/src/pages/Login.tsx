import { useState, type FormEvent } from 'react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'เข้าสู่ระบบไม่สำเร็จ');
        return;
      }

      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_user', JSON.stringify(data.user));
      onLogin();
    } catch {
      setError('ไม่สามารถเชื่อมต่อ server ได้');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-300 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
              <span className="material-symbols-outlined text-white text-[28px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}>store</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">Jespark Admin</h1>
            <p className="text-sm text-slate-500 mt-1">เข้าสู่ระบบเพื่อจัดการร้าน</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-5 bg-red-50 border border-red-200 rounded-xl">
              <span className="material-symbols-outlined text-red-500 text-[18px]">error</span>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="อีเมล"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon="mail"
              placeholder="admin@jespark.com"
              required
            />

            <Input
              label="รหัสผ่าน"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon="lock"
              placeholder="••••••••"
              required
            />

            <Button type="submit" fullWidth isLoading={isLoading} icon="login" size="lg">
              เข้าสู่ระบบ
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-white/40 mt-6">
          © 2026 Jespark · v1.0.0
        </p>
      </div>
    </div>
  );
}
