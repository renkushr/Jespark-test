
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { liffService } from './src/services/liff.service';
import { isLiffConfigured } from './src/config/liff';
import Home from './screens/Home';
import Scan from './screens/Scan';
import Rewards from './screens/Rewards';
import Wallet from './screens/Wallet';
import Profile from './screens/Profile';
import History from './screens/History';
import Notifications from './screens/Notifications';
import StoreFinder from './screens/StoreFinder';
import Coupons from './screens/Coupons';
import Settings from './screens/Settings';
import Login from './screens/Login';
import Register from './screens/Register';
import CompleteProfile from './screens/CompleteProfile';
import ForgotPassword from './screens/ForgotPassword';
import Cashier from './screens/Cashier';
import AdminLogin from './screens/AdminLogin';
import AdminDashboard from './screens/AdminDashboard';
import Navbar from './components/Navbar';

/** LIFF init timeout (ms) — บางเครื่องมือถือ/เบราว์เซอร์ LIFF ค้าง ให้โชว์แอปหลัง timeout */
const LIFF_INIT_TIMEOUT_MS = 10000;

/** Initialize LIFF once at app startup (when configured) so redirect from LINE login works */
const useLiffReady = (): { ready: boolean; liffFailed?: boolean } => {
  const [ready, setReady] = useState(!isLiffConfigured());
  const [liffFailed, setLiffFailed] = useState(false);

  useEffect(() => {
    if (!isLiffConfigured()) {
      setReady(true);
      return;
    }
    let cancelled = false;
    const timeoutId = setTimeout(() => {
      if (cancelled) return;
      setLiffFailed(true);
      setReady(true);
    }, LIFF_INIT_TIMEOUT_MS);
    liffService.init()
      .then((ok) => {
        if (cancelled) return;
        clearTimeout(timeoutId);
        if (!ok) setLiffFailed(true);
        setReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        clearTimeout(timeoutId);
        setLiffFailed(true);
        setReady(true);
      });
    return () => { cancelled = true; clearTimeout(timeoutId); };
  }, []);

  return { ready, liffFailed };
};

const AppRoutes: React.FC = () => {
  const { isLoggedIn, user, logout, updateUser } = useAuth();

  return (
    <div className="min-h-screen font-sans flex justify-center py-0 md:py-8">
      <div className="w-full max-w-md bg-white shadow-2xl relative flex flex-col min-h-screen overflow-x-hidden md:rounded-[3rem] md:border-[8px] md:border-dark-green/5">
        
        <div className="app-bg-pattern">
          <div className="bg-blob -top-20 -right-20"></div>
          <div className="bg-blob top-[40%] -left-40 scale-150"></div>
          <div className="bg-blob -bottom-20 -right-20 opacity-[0.03]"></div>
        </div>

        <div className="relative z-10 flex flex-col flex-1">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/complete-profile" element={<CompleteProfile onComplete={() => {}} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/cashier" element={<Cashier />} />
            
            {isLoggedIn && user ? (
              <>
                <Route path="/" element={<Home user={user} />} />
                <Route path="/scan" element={<Scan user={user} />} />
                <Route path="/rewards" element={<Rewards user={user} />} />
                <Route path="/wallet" element={<Wallet user={user} />} />
                <Route path="/profile" element={<Profile user={user} onLogout={logout} />} />
                <Route path="/history" element={<History />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/stores" element={<StoreFinder />} />
                <Route path="/coupons" element={<Coupons />} />
                <Route path="/settings" element={<Settings user={user} setUser={updateUser} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            ) : (
              <Route path="*" element={<Navigate to="/login" replace />} />
            )}
          </Routes>
        </div>
        {isLoggedIn && <Navbar />}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const { ready: liffReady, liffFailed } = useLiffReady();

  if (!liffReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-dark-green font-sans px-6">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div>
        <p className="mt-4 text-sm font-bold text-gray-500">กำลังเชื่อมต่อ LINE...</p>
      </div>
    );
  }

  return (
    <Router>
      {liffFailed && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-100 border-b border-amber-300 px-4 py-2 text-center text-sm text-amber-900">
          ถ้าเข้าสู่ระบบไม่ได้ ลองเปิดลิงก์ในเบราว์เซอร์มือถือ (Chrome/Safari) แทนการเปิดในแชท LINE
        </div>
      )}
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

export default App;
