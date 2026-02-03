const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // ใช้ token จาก memory หรือจาก localStorage (ป้องกันกรณีโหลดหน้าใหม่/race)
    const token = this.token ?? (typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('fetch') || msg.includes('Failed') || msg.includes('NetworkError')) {
        throw new Error('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ — กรุณารัน Backend (cd server && npm run dev) ที่ port 5001');
      }
      throw err;
    }

    let data: any;
    try {
      data = await response.json();
    } catch {
      throw new Error('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ — กรุณารัน Backend ที่ port 5001');
    }

    if (!response.ok) {
      if (response.status === 401) {
        const detail = data?.detail || data?.error || '';
        if (detail.includes('Access token required') || detail.includes('Unauthorized')) {
          this.clearToken();
          throw new Error('Session expired or not logged in. Please log in again.');
        }
        throw new Error(data?.error || 'Unauthorized');
      }
      throw new Error(data?.error || 'An error occurred');
    }

    return data;
  }

  // Auth endpoints
  async register(email: string, password: string, name: string, phone?: string, birthDate?: string) {
    return this.request<{ token: string; userId: number }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, phone, birthDate }),
    });
  }

  async login(email: string, password: string) {
    return this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async lineLogin(lineId: string, name: string, email?: string, pictureUrl?: string) {
    return this.request<{ token: string; user: any }>('/auth/line-login', {
      method: 'POST',
      body: JSON.stringify({ lineId, name, email, pictureUrl }),
    });
  }

  // User endpoints
  async getMe() {
    return this.request<any>('/users/me');
  }

  async updateProfile(name?: string, phone?: string, birthDate?: string) {
    return this.request<{ user: any }>('/users/me', {
      method: 'PUT',
      body: JSON.stringify({ name, phone, birthDate }),
    });
  }

  async addPoints(points: number, title?: string, subtitle?: string) {
    return this.request<{ points: number }>('/users/points/add', {
      method: 'POST',
      body: JSON.stringify({ points, title, subtitle }),
    });
  }

  // Rewards endpoints
  async getRewards(category?: string, popular?: boolean, limited?: boolean) {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (popular) params.append('popular', 'true');
    if (limited) params.append('limited', 'true');
    
    const query = params.toString();
    return this.request<{ rewards: any[] }>(`/rewards${query ? '?' + query : ''}`);
  }

  async getReward(id: number) {
    return this.request<any>(`/rewards/${id}`);
  }

  async redeemReward(rewardId: number) {
    return this.request<{ redemptionId: number; remainingPoints: number }>('/rewards/redeem', {
      method: 'POST',
      body: JSON.stringify({ rewardId }),
    });
  }

  async getRedemptions() {
    return this.request<{ redemptions: any[] }>('/rewards/user/redemptions');
  }

  // Wallet endpoints
  async getBalance() {
    return this.request<{ balance: number }>('/wallet/balance');
  }

  async topUp(amount: number) {
    return this.request<{ balance: number }>('/wallet/topup', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async makePayment(amount: number, title?: string, subtitle?: string) {
    return this.request<{ balance: number; earnedPoints: number; totalPoints: number }>('/wallet/payment', {
      method: 'POST',
      body: JSON.stringify({ amount, title, subtitle }),
    });
  }

  async getTransactions(limit = 50, offset = 0) {
    return this.request<{ transactions: any[] }>(`/wallet/transactions?limit=${limit}&offset=${offset}`);
  }

  // Notifications endpoints
  async getNotifications() {
    return this.request<{ notifications: any[] }>('/notifications');
  }

  async markNotificationRead(id: number) {
    return this.request<{ message: string }>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsRead() {
    return this.request<{ message: string }>('/notifications/read-all', {
      method: 'PUT',
    });
  }

  // Stores endpoints
  async getStores() {
    return this.request<{ stores: any[] }>('/stores');
  }

  async getStore(id: number) {
    return this.request<any>(`/stores/${id}`);
  }

  // Coupons endpoints
  async getCoupons() {
    return this.request<{ coupons: any[] }>('/coupons');
  }

  async useCoupon(id: number) {
    return this.request<{ discount: { type: string; value: number } }>(`/coupons/${id}/use`, {
      method: 'POST',
    });
  }

  // Cashier endpoints
  async searchCustomer(query: string) {
    return this.request<{ user: any }>(`/cashier/search?q=${encodeURIComponent(query)}`);
  }

  async cashierCheckout(customerId: number, amount: number) {
    return this.request<{ 
      message: string; 
      earnedPoints: number; 
      totalPoints: number;
      balance: number;
    }>('/cashier/checkout', {
      method: 'POST',
      body: JSON.stringify({ customerId, amount }),
    });
  }

  async getCashierStats() {
    return this.request<{
      today: {
        transactions: number;
        revenue: number;
        pointsGiven: number;
        customers: number;
      };
      total: {
        transactions: number;
        customers: number;
      };
    }>('/cashier/stats');
  }
}

export const apiClient = new ApiClient();
export default apiClient;
