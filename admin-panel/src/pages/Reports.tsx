import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const COLORS = ['#003399', '#0055cc', '#22c55e', '#f59e0b', '#ef4444'];

export default function Reports() {
  const [activeTab, setActiveTab] = useState('sales');
  const [dateRange, setDateRange] = useState('30days');
  const [salesData, setSalesData] = useState<any>(null);
  const [membersData, setMembersData] = useState<any>(null);
  const [pointsData, setPointsData] = useState<any>(null);
  const [redemptionsData, setRedemptionsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

  useEffect(() => { loadReports(); }, [activeTab, dateRange]);

  const loadReports = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('admin_token');
      const days = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 90;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();
      const headers = { 'Authorization': `Bearer ${token}` };

      if (activeTab === 'sales') {
        const r = await fetch(`${API_BASE}/admin/reports/sales?startDate=${startDate}&endDate=${endDate}&groupBy=day`, { headers });
        if (!r.ok) throw new Error('Failed to load sales report');
        setSalesData(await r.json());
      } else if (activeTab === 'members') {
        const r = await fetch(`${API_BASE}/admin/reports/members?startDate=${startDate}&endDate=${endDate}&groupBy=day`, { headers });
        if (!r.ok) throw new Error('Failed to load members report');
        setMembersData(await r.json());
      } else if (activeTab === 'points') {
        const r = await fetch(`${API_BASE}/admin/reports/points?startDate=${startDate}&endDate=${endDate}`, { headers });
        if (!r.ok) throw new Error('Failed to load points report');
        setPointsData(await r.json());
      } else if (activeTab === 'redemptions') {
        const r = await fetch(`${API_BASE}/admin/reports/redemptions?startDate=${startDate}&endDate=${endDate}`, { headers });
        if (!r.ok) throw new Error('Failed to load redemptions report');
        setRedemptionsData(await r.json());
      }
    } catch (err: any) {
      console.error('Error loading reports:', err);
      setError(err.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'sales', icon: 'payments', label: 'ยอดขาย' },
    { key: 'members', icon: 'group', label: 'สมาชิก' },
    { key: 'points', icon: 'stars', label: 'คะแนน' },
    { key: 'redemptions', icon: 'redeem', label: 'การแลก' },
  ];

  const dateRanges = [
    { key: '7days', label: '7 วัน' },
    { key: '30days', label: '30 วัน' },
    { key: '90days', label: '90 วัน' },
  ];

  const Loader = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
      <p className="text-sm text-slate-400 mt-3">กำลังโหลดข้อมูล...</p>
    </div>
  );

  const tooltipStyle = { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '12px' };

  const handleExportCSV = () => {
    let csv = '';
    let filename = '';

    if (activeTab === 'sales' && salesData) {
      csv = 'วันที่,ยอดขาย,จำนวนรายการ,คะแนนที่แจก\n';
      csv += (salesData.data || []).map((d: any) =>
        `${d.date},${d.totalSales},${d.totalTransactions},${d.totalPoints}`
      ).join('\n');
      filename = 'jespark-sales-report';
    } else if (activeTab === 'members' && membersData) {
      csv = 'วันที่,สมาชิกใหม่\n';
      csv += (membersData.data || []).map((d: any) =>
        `${d.date},${d.newMembers}`
      ).join('\n');
      filename = 'jespark-members-report';
    } else if (activeTab === 'points' && pointsData) {
      csv = 'ชื่อ,อีเมล,คะแนน\n';
      csv += (pointsData.topCustomers || []).map((c: any) =>
        `${c.name},${c.email},${c.points}`
      ).join('\n');
      filename = 'jespark-points-report';
    } else if (activeTab === 'redemptions' && redemptionsData) {
      csv = 'ของรางวัล,จำนวนการแลก\n';
      csv += (redemptionsData.popularRewards || []).map((r: any) =>
        `${r.name},${r.count}`
      ).join('\n');
      filename = 'jespark-redemptions-report';
    } else {
      alert('ยังไม่มีข้อมูลสำหรับส่งออก หรือกำลังโหลดอยู่');
      return;
    }

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${dateRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    let title = '';
    let tableHTML = '';

    if (activeTab === 'sales' && salesData?.summary) {
      title = 'รายงานยอดขาย';
      const s = salesData.summary;
      tableHTML = `
      <div style="margin-bottom:20px;">
        <p><strong>ยอดขายรวม:</strong> ฿${Number(s.totalSales ?? 0).toLocaleString()}</p>
        <p><strong>จำนวนรายการ:</strong> ${Number(s.totalTransactions ?? 0).toLocaleString()}</p>
        <p><strong>คะแนนที่แจก:</strong> ${Number(s.totalPoints ?? 0).toLocaleString()}</p>
      </div>
      <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;font-size:14px;">
        <thead><tr style="background:#003399;color:#fff;"><th>วันที่</th><th>ยอดขาย</th><th>รายการ</th><th>คะแนน</th></tr></thead>
        <tbody>${(salesData.data || []).map((d: any) => `<tr><td>${d.date ?? ''}</td><td style="text-align:right">฿${Number(d.totalSales ?? 0).toLocaleString()}</td><td style="text-align:right">${d.totalTransactions ?? ''}</td><td style="text-align:right">${d.totalPoints ?? ''}</td></tr>`).join('')}</tbody>
      </table>`;
    } else if (activeTab === 'members' && membersData?.summary) {
      title = 'รายงานสมาชิก';
      tableHTML = `
      <div style="margin-bottom:20px;">
        <p><strong>สมาชิกใหม่:</strong> ${membersData.summary.totalNewMembers ?? ''}</p>
      </div>
      <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;font-size:14px;">
        <thead><tr style="background:#003399;color:#fff;"><th>วันที่</th><th>สมาชิกใหม่</th></tr></thead>
        <tbody>${(membersData.data || []).map((d: any) => `<tr><td>${d.date ?? ''}</td><td style="text-align:right">${d.newMembers ?? ''}</td></tr>`).join('')}</tbody>
      </table>`;
    } else if (activeTab === 'points' && pointsData?.summary) {
      title = 'รายงานคะแนน';
      const ps = pointsData.summary;
      tableHTML = `
      <div style="margin-bottom:20px;">
        <p><strong>คะแนนที่แจก:</strong> +${Number(ps.totalPointsGiven ?? 0).toLocaleString()}</p>
        <p><strong>คะแนนที่ใช้:</strong> -${Number(ps.totalPointsUsed ?? 0).toLocaleString()}</p>
        <p><strong>คะแนนสุทธิ:</strong> ${Number(ps.netPoints ?? 0).toLocaleString()}</p>
      </div>
      <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;font-size:14px;">
        <thead><tr style="background:#003399;color:#fff;"><th>อันดับ</th><th>ชื่อ</th><th>อีเมล</th><th>คะแนน</th></tr></thead>
        <tbody>${(pointsData.topCustomers || []).map((c: any, i: number) => `<tr><td>${i + 1}</td><td>${c.name ?? ''}</td><td>${c.email ?? ''}</td><td style="text-align:right">${Number(c.points ?? 0).toLocaleString()}</td></tr>`).join('')}</tbody>
      </table>`;
    } else if (activeTab === 'redemptions' && redemptionsData?.summary) {
      title = 'รายงานการแลกของรางวัล';
      const rs = redemptionsData.summary;
      tableHTML = `
      <div style="margin-bottom:20px;">
        <p><strong>จำนวนการแลก:</strong> ${Number(rs.totalRedemptions ?? 0).toLocaleString()}</p>
        <p><strong>คะแนนที่ใช้:</strong> ${Number(rs.totalPointsUsed ?? 0).toLocaleString()}</p>
      </div>
      <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;font-size:14px;">
        <thead><tr style="background:#003399;color:#fff;"><th>ของรางวัล</th><th>จำนวนการแลก</th></tr></thead>
        <tbody>${(redemptionsData.popularRewards || []).map((r: any) => `<tr><td>${r.name ?? ''}</td><td style="text-align:right">${r.count ?? ''}</td></tr>`).join('')}</tbody>
      </table>`;
    } else {
      alert('ยังไม่มีข้อมูลสำหรับส่งออก หรือกำลังโหลดอยู่');
      return;
    }

    const dateLabel = dateRange === '7days' ? '7 วัน' : dateRange === '30days' ? '30 วัน' : '90 วัน';
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('ไม่สามารถเปิดหน้าต่างพิมพ์ได้ กรุณาอนุญาตป๊อปอัป');
      return;
    }
    printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title} - Jespark</title><style>body{font-family:'Sarabun',sans-serif;padding:40px;color:#333;}h1{color:#003399;margin-bottom:5px;}h3{color:#666;font-weight:normal;margin-top:0;}@media print{body{padding:20px;}}</style></head><body><h1>Jespark - ${title}</h1><h3>ช่วงเวลา: ${dateLabel} | สร้างเมื่อ: ${new Date().toLocaleDateString('th-TH')}</h3>${tableHTML}<script>setTimeout(function(){window.print();},500);<\/script></body></html>`);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">รายงาน</h1>
          <p className="text-sm text-slate-500 mt-0.5">วิเคราะห์ข้อมูลยอดขาย สมาชิก และคะแนน</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon="picture_as_pdf" size="sm" onClick={handleExportPDF}>PDF</Button>
          <Button variant="outline" icon="table_chart" size="sm" onClick={handleExportCSV}>CSV</Button>
        </div>
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

      {/* Date Range */}
      <div className="flex gap-2">
        {dateRanges.map((dr) => (
          <button
            key={dr.key}
            onClick={() => setDateRange(dr.key)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              dateRange === dr.key
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
            }`}
          >
            {dr.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? <Loader /> : error ? (
        <Card>
          <div className="flex flex-col items-center py-8">
            <span className="material-symbols-outlined text-danger text-4xl mb-3">error</span>
            <p className="text-sm font-bold text-red-800 mb-1">เกิดข้อผิดพลาด</p>
            <p className="text-xs text-red-600 mb-4">{error}</p>
            <Button variant="danger" size="sm" onClick={loadReports}>ลองอีกครั้ง</Button>
          </div>
        </Card>
      ) : (
        <>
          {/* ===== SALES ===== */}
          {activeTab === 'sales' && salesData && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { label: 'ยอดขายรวม', value: `฿${salesData.summary.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: 'payments', accent: 'border-l-primary', iconBg: 'bg-primary-50 text-primary' },
                  { label: 'จำนวนรายการ', value: salesData.summary.totalTransactions.toLocaleString(), icon: 'receipt', accent: 'border-l-success', iconBg: 'bg-emerald-50 text-success' },
                  { label: 'คะแนนที่แจก', value: salesData.summary.totalPoints.toLocaleString(), icon: 'stars', accent: 'border-l-warning', iconBg: 'bg-amber-50 text-warning' },
                  { label: 'ยอดขายเฉลี่ย', value: `฿${salesData.summary.averageSale.toFixed(2)}`, icon: 'trending_up', accent: 'border-l-violet-500', iconBg: 'bg-violet-50 text-violet-600' },
                ].map((s, i) => (
                  <div key={i} className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-5 border-l-4 ${s.accent}`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${s.iconBg}`}>
                      <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</p>
                    <p className="text-xl font-black text-slate-900 mt-1">{s.value}</p>
                  </div>
                ))}
              </div>
              <Card title="กราฟยอดขาย">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData.data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend />
                      <Line type="monotone" dataKey="totalSales" stroke="#003399" strokeWidth={2.5} dot={{ r: 3 }} name="ยอดขาย (฿)" />
                      <Line type="monotone" dataKey="totalTransactions" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="จำนวนรายการ" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          )}

          {/* ===== MEMBERS ===== */}
          {activeTab === 'members' && membersData && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                {[
                  { label: 'สมาชิกใหม่', value: `+${membersData.summary.totalNewMembers}`, color: 'border-l-primary', iconBg: 'bg-primary-50 text-primary', icon: 'person_add' },
                  { label: 'Member', value: membersData.summary.currentTierDistribution.Member, color: 'border-l-sky-400', iconBg: 'bg-sky-50 text-sky-500', icon: 'person' },
                  { label: 'Silver', value: membersData.summary.currentTierDistribution.Silver, color: 'border-l-slate-400', iconBg: 'bg-slate-100 text-slate-500', icon: 'workspace_premium' },
                  { label: 'Gold', value: membersData.summary.currentTierDistribution.Gold, color: 'border-l-amber-400', iconBg: 'bg-amber-50 text-amber-500', icon: 'workspace_premium' },
                  { label: 'Platinum', value: membersData.summary.currentTierDistribution.Platinum, color: 'border-l-violet-500', iconBg: 'bg-violet-50 text-violet-500', icon: 'diamond' },
                ].map((s, i) => (
                  <div key={i} className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-4 border-l-4 ${s.color}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${s.iconBg}`}>
                      <span className="material-symbols-outlined text-[16px]">{s.icon}</span>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</p>
                    <p className="text-xl font-black text-slate-900 mt-0.5">{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Card title="การเติบโตของสมาชิก">
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={membersData.data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="newMembers" fill="#003399" radius={[4, 4, 0, 0]} name="สมาชิกใหม่" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                <Card title="การกระจายตาม Tier">
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Member', value: membersData.summary.currentTierDistribution.Member },
                            { name: 'Silver', value: membersData.summary.currentTierDistribution.Silver },
                            { name: 'Gold', value: membersData.summary.currentTierDistribution.Gold },
                            { name: 'Platinum', value: membersData.summary.currentTierDistribution.Platinum },
                          ]}
                          cx="50%" cy="50%" labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={90} fill="#8884d8" dataKey="value"
                        >
                          {COLORS.map((color, index) => <Cell key={`cell-${index}`} fill={color} />)}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ===== POINTS ===== */}
          {activeTab === 'points' && pointsData && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {[
                  { label: 'คะแนนที่แจก', value: `+${pointsData.summary.totalPointsGiven.toLocaleString()}`, accent: 'border-l-success', iconBg: 'bg-emerald-50 text-success', icon: 'add_circle' },
                  { label: 'คะแนนที่ใช้', value: `-${pointsData.summary.totalPointsUsed.toLocaleString()}`, accent: 'border-l-danger', iconBg: 'bg-red-50 text-danger', icon: 'remove_circle' },
                  { label: 'คะแนนสุทธิ', value: pointsData.summary.netPoints.toLocaleString(), accent: 'border-l-primary', iconBg: 'bg-primary-50 text-primary', icon: 'balance' },
                ].map((s, i) => (
                  <div key={i} className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-5 border-l-4 ${s.accent}`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${s.iconBg}`}>
                      <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{s.value}</p>
                  </div>
                ))}
              </div>
              <Card title="Top 10 ลูกค้าที่มีคะแนนมากที่สุด" noPadding>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[400px]">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">อันดับ</th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">ชื่อ</th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">อีเมล</th>
                        <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">คะแนน</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pointsData.topCustomers.map((customer: any, index: number) => (
                        <tr key={customer.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black text-white ${
                              index === 0 ? 'bg-amber-400' : index === 1 ? 'bg-slate-400' : index === 2 ? 'bg-orange-500' : 'bg-slate-200 !text-slate-500'
                            }`}>{index + 1}</span>
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-800">{customer.name}</td>
                          <td className="px-4 py-3 text-slate-500">{customer.email}</td>
                          <td className="px-4 py-3 text-right font-black text-primary">{customer.points.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ===== REDEMPTIONS ===== */}
          {activeTab === 'redemptions' && redemptionsData && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[
                  { label: 'จำนวนการแลก', value: redemptionsData.summary.totalRedemptions.toLocaleString(), accent: 'border-l-violet-500', iconBg: 'bg-violet-50 text-violet-600', icon: 'redeem' },
                  { label: 'คะแนนที่ใช้', value: redemptionsData.summary.totalPointsUsed.toLocaleString(), accent: 'border-l-pink-500', iconBg: 'bg-pink-50 text-pink-600', icon: 'stars' },
                ].map((s, i) => (
                  <div key={i} className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-5 border-l-4 ${s.accent}`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${s.iconBg}`}>
                      <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{s.value}</p>
                  </div>
                ))}
              </div>
              <Card title="ของรางวัลยอดนิยม">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={redemptionsData.popularRewards} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                      <YAxis dataKey="name" type="category" width={150} stroke="#94a3b8" fontSize={11} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="count" fill="#003399" radius={[0, 4, 4, 0]} name="จำนวนการแลก" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
