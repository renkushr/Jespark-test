const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

class AdminApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('admin_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('admin_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('admin_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Dashboard Stats
  async getDashboardStats() {
    return this.request<{
      totalMembers: number;
      todaySales: number;
      pointsGiven: number;
      rewardsRedeemed: number;
    }>('/admin/stats');
  }

  // Customers
  async getCustomers(params?: { limit?: number; offset?: number; tier?: string; search?: string }) {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    if (params?.tier) query.append('tier', params.tier);
    if (params?.search) query.append('search', params.search);
    
    return this.request<{ customers: any[]; total: number }>(`/admin/customers?${query}`);
  }

  async getCustomer(id: number) {
    return this.request<any>(`/admin/customers/${id}`);
  }

  async updateCustomer(id: number, data: any) {
    return this.request<any>(`/admin/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async verifyCustomer(id: number) {
    return this.request<any>(`/members/verify/${id}`, {
      method: 'POST',
    });
  }

  // Points
  async getPointsHistory(params?: { limit?: number; offset?: number; userId?: number }) {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    if (params?.userId) query.append('userId', params.userId.toString());
    
    return this.request<{ history: any[]; total: number }>(`/admin/points/history?${query}`);
  }

  async addPoints(userId: number, points: number, title: string) {
    return this.request<any>('/admin/points/add', {
      method: 'POST',
      body: JSON.stringify({ userId, points, title }),
    });
  }

  async deductPoints(userId: number, points: number, reason: string) {
    return this.request<any>('/admin/points/deduct', {
      method: 'POST',
      body: JSON.stringify({ userId, points, reason }),
    });
  }

  // Rewards
  async getRewards(params?: { category?: string; active?: boolean }) {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.active !== undefined) query.append('active', params.active.toString());
    
    return this.request<{ rewards: any[] }>(`/rewards?${query}`);
  }

  async getReward(id: number) {
    return this.request<any>(`/rewards/${id}`);
  }

  async createReward(data: any) {
    return this.request<any>('/admin/rewards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateReward(id: number, data: any) {
    return this.request<any>(`/admin/rewards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteReward(id: number) {
    return this.request<any>(`/admin/rewards/${id}`, {
      method: 'DELETE',
    });
  }

  async getRedemptions(params?: { status?: string; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.limit) query.append('limit', params.limit.toString());
    
    return this.request<{ redemptions: any[] }>(`/admin/redemptions?${query}`);
  }

  async approveRedemption(id: number) {
    return this.request<any>(`/admin/redemptions/${id}/approve`, {
      method: 'POST',
    });
  }

  async rejectRedemption(id: number, reason: string) {
    return this.request<any>(`/admin/redemptions/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Reports
  async getSalesReport(startDate: string, endDate: string) {
    return this.request<any>(`/admin/reports/sales?start=${startDate}&end=${endDate}`);
  }

  async getMembersReport(startDate: string, endDate: string) {
    return this.request<any>(`/admin/reports/members?start=${startDate}&end=${endDate}`);
  }

  async getPointsReport(startDate: string, endDate: string) {
    return this.request<any>(`/admin/reports/points?start=${startDate}&end=${endDate}`);
  }

  // Export
  async exportCustomers(format: 'csv' | 'excel') {
    const response = await fetch(`${API_BASE_URL}/admin/export/customers?format=${format}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });
    return response.blob();
  }

  async exportTransactions(format: 'csv' | 'excel', startDate?: string, endDate?: string) {
    const query = new URLSearchParams();
    query.append('format', format);
    if (startDate) query.append('start', startDate);
    if (endDate) query.append('end', endDate);
    
    const response = await fetch(`${API_BASE_URL}/admin/export/transactions?${query}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });
    return response.blob();
  }

  // Admin Users
  async getAdminUsers() {
    return this.request<{ users: any[] }>('/admin/users');
  }

  async createAdminUser(data: any) {
    return this.request<any>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdminUser(id: number, data: any) {
    return this.request<any>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAdminUser(id: number) {
    return this.request<any>(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }
}

export const adminApi = new AdminApiClient();
export default adminApi;
