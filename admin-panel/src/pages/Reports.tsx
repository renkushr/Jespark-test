import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#13ec13', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function Reports() {
  const [activeTab, setActiveTab] = useState('sales');
  const [dateRange, setDateRange] = useState('30days');
  const [salesData, setSalesData] = useState<any>(null);
  const [membersData, setMembersData] = useState<any>(null);
  const [pointsData, setPointsData] = useState<any>(null);
  const [redemptionsData, setRedemptionsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReports();
  }, [activeTab, dateRange]);

  const loadReports = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('admin_token');
      const days = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 90;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

      if (activeTab === 'sales') {
        const response = await fetch(
          `${API_BASE}/admin/reports/sales?startDate=${startDate}&endDate=${endDate}&groupBy=day`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        if (!response.ok) throw new Error('Failed to load sales report');
        const data = await response.json();
        setSalesData(data);
      } else if (activeTab === 'members') {
        const response = await fetch(
          `${API_BASE}/admin/reports/members?startDate=${startDate}&endDate=${endDate}&groupBy=day`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        if (!response.ok) throw new Error('Failed to load members report');
        const data = await response.json();
        setMembersData(data);
      } else if (activeTab === 'points') {
        const response = await fetch(
          `${API_BASE}/admin/reports/points?startDate=${startDate}&endDate=${endDate}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        if (!response.ok) throw new Error('Failed to load points report');
        const data = await response.json();
        setPointsData(data);
      } else if (activeTab === 'redemptions') {
        const response = await fetch(
          `${API_BASE}/admin/reports/redemptions?startDate=${startDate}&endDate=${endDate}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        if (!response.ok) throw new Error('Failed to load redemptions report');
        const data = await response.json();
        setRedemptionsData(data);
      }
    } catch (err: any) {
      console.error('Error loading reports:', err);
      setError(err.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: string) => {
    alert(`Export as ${format} - Feature coming soon!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">รายงาน</h1>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('pdf')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            📄 Export PDF
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            📊 Export Excel
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('sales')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'sales'
                ? 'text-primary border-b-2 border-primary bg-green-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            💰 ยอดขาย
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'members'
                ? 'text-primary border-b-2 border-primary bg-green-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            👥 สมาชิก
          </button>
          <button
            onClick={() => setActiveTab('points')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'points'
                ? 'text-primary border-b-2 border-primary bg-green-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            ⭐ คะแนน
          </button>
          <button
            onClick={() => setActiveTab('redemptions')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'redemptions'
                ? 'text-primary border-b-2 border-primary bg-green-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            🎁 การแลก
          </button>
        </div>

        {/* Date Range Filter */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-2">
            <button
              onClick={() => setDateRange('7days')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                dateRange === '7days'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              7 วัน
            </button>
            <button
              onClick={() => setDateRange('30days')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                dateRange === '30days'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              30 วัน
            </button>
            <button
              onClick={() => setDateRange('90days')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                dateRange === '90days'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              90 วัน
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-800 font-medium mb-2">เกิดข้อผิดพลาด</p>
              <p className="text-red-600 text-sm">{error}</p>
              <button
                onClick={loadReports}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                ลองอีกครั้ง
              </button>
            </div>
          ) : (
            <>
              {/* Sales Report */}
              {activeTab === 'sales' && salesData && (
                <div className="space-y-6">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                      <p className="text-sm text-blue-700 font-medium mb-1">ยอดขายรวม</p>
                      <p className="text-3xl font-bold text-blue-900">
                        ฿{salesData.summary.totalSales.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                      <p className="text-sm text-green-700 font-medium mb-1">จำนวนรายการ</p>
                      <p className="text-3xl font-bold text-green-900">
                        {salesData.summary.totalTransactions.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                      <p className="text-sm text-purple-700 font-medium mb-1">คะแนนที่แจก</p>
                      <p className="text-3xl font-bold text-purple-900">
                        {salesData.summary.totalPoints.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200">
                      <p className="text-sm text-yellow-700 font-medium mb-1">ยอดขายเฉลี่ย</p>
                      <p className="text-3xl font-bold text-yellow-900">
                        ฿{salesData.summary.averageSale.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">กราฟยอดขาย</h3>
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={salesData.data}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="date" stroke="#6b7280" />
                          <YAxis stroke="#6b7280" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="totalSales" stroke="#13ec13" strokeWidth={3} name="ยอดขาย (฿)" />
                          <Line type="monotone" dataKey="totalTransactions" stroke="#3b82f6" strokeWidth={2} name="จำนวนรายการ" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* Members Report */}
              {activeTab === 'members' && membersData && (
                <div className="space-y-6">
                  <div className="grid grid-cols-5 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                      <p className="text-sm text-blue-700 font-medium mb-1">สมาชิกใหม่</p>
                      <p className="text-3xl font-bold text-blue-900">
                        +{membersData.summary.totalNewMembers}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-300">
                      <p className="text-sm text-gray-700 font-medium mb-1">Member</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {membersData.summary.currentTierDistribution.Member}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-xl border border-gray-400">
                      <p className="text-sm text-gray-700 font-medium mb-1">Silver</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {membersData.summary.currentTierDistribution.Silver}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-300">
                      <p className="text-sm text-yellow-700 font-medium mb-1">Gold</p>
                      <p className="text-3xl font-bold text-yellow-900">
                        {membersData.summary.currentTierDistribution.Gold}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-300">
                      <p className="text-sm text-purple-700 font-medium mb-1">Platinum</p>
                      <p className="text-3xl font-bold text-purple-900">
                        {membersData.summary.currentTierDistribution.Platinum}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">การเติบโตของสมาชิก</h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={membersData.data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="date" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="newMembers" fill="#13ec13" name="สมาชิกใหม่" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">การกระจายตาม Tier</h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Member', value: membersData.summary.currentTierDistribution.Member },
                                { name: 'Silver', value: membersData.summary.currentTierDistribution.Silver },
                                { name: 'Gold', value: membersData.summary.currentTierDistribution.Gold },
                                { name: 'Platinum', value: membersData.summary.currentTierDistribution.Platinum },
                              ]}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {COLORS.map((color, index) => (
                                <Cell key={`cell-${index}`} fill={color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Points Report */}
              {activeTab === 'points' && pointsData && (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                      <p className="text-sm text-green-700 font-medium mb-1">คะแนนที่แจก</p>
                      <p className="text-3xl font-bold text-green-900">
                        +{pointsData.summary.totalPointsGiven.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
                      <p className="text-sm text-red-700 font-medium mb-1">คะแนนที่ใช้</p>
                      <p className="text-3xl font-bold text-red-900">
                        -{pointsData.summary.totalPointsUsed.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                      <p className="text-sm text-blue-700 font-medium mb-1">คะแนนสุทธิ</p>
                      <p className="text-3xl font-bold text-blue-900">
                        {pointsData.summary.netPoints.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Top 10 ลูกค้าที่มีคะแนนมากที่สุด</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b-2 border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">อันดับ</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ชื่อ</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">อีเมล</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">คะแนน</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {pointsData.topCustomers.map((customer: any, index: number) => (
                            <tr key={customer.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${
                                  index === 0 ? 'bg-yellow-500' : 
                                  index === 1 ? 'bg-gray-400' : 
                                  index === 2 ? 'bg-orange-600' : 
                                  'bg-gray-300 text-gray-700'
                                }`}>
                                  {index + 1}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-medium text-gray-900">{customer.name}</td>
                              <td className="px-4 py-3 text-gray-600">{customer.email}</td>
                              <td className="px-4 py-3 text-right font-bold text-primary">
                                {customer.points.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Redemptions Report */}
              {activeTab === 'redemptions' && redemptionsData && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                      <p className="text-sm text-purple-700 font-medium mb-1">จำนวนการแลก</p>
                      <p className="text-3xl font-bold text-purple-900">
                        {redemptionsData.summary.totalRedemptions.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-xl border border-pink-200">
                      <p className="text-sm text-pink-700 font-medium mb-1">คะแนนที่ใช้</p>
                      <p className="text-3xl font-bold text-pink-900">
                        {redemptionsData.summary.totalPointsUsed.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">ของรางวัลยอดนิยม</h3>
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={redemptionsData.popularRewards} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis type="number" stroke="#6b7280" />
                          <YAxis dataKey="name" type="category" width={150} stroke="#6b7280" />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" fill="#13ec13" name="จำนวนการแลก" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
