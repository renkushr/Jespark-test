import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Cashier from './pages/Cashier';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Points from './pages/Points';
import Rewards from './pages/Rewards';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Redemptions from './pages/Redemptions';
import Notifications from './pages/Notifications';
import Coupons from './pages/Coupons';
import SlipLog from './pages/SlipLog';
import ReceiptScanner from './pages/ReceiptScanner';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) setIsAuthenticated(true);
    setChecking(false);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_token');
  };

  if (checking) return null;

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Layout onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cashier" element={<Cashier />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/points" element={<Points />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/redemptions" element={<Redemptions />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/coupons" element={<Coupons />} />
          <Route path="/slip-log" element={<SlipLog />} />
          <Route path="/receipt-scanner" element={<ReceiptScanner />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
