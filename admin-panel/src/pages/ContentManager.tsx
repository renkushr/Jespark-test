import { useState, useEffect, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
const tk = () => localStorage.getItem('admin_token') || '';

type Tab = 'banners' | 'brands' | 'deals';

interface Banner {
  id: number; title: string; subtitle: string; image_url: string;
  button_text: string; link_type: string; gradient_color: string;
  sort_order: number; is_active: boolean;
}
interface Brand {
  id: number; name: string; logo_url: string; link_url: string;
  sort_order: number; is_active: boolean;
}
interface Deal {
  id: number; title: string; subtitle: string; tag: string;
  image_url: string; link_url: string; sort_order: number; is_active: boolean;
}

const SPECS: Record<Tab, { width: number; height: number; ratio: string; desc: string }> = {
  banners: { width: 1200, height: 480, ratio: '5:2', desc: 'Banner หน้าแรก (แนะนำ 1200×480px, อัตราส่วน 5:2)' },
  brands:  { width: 200, height: 200, ratio: '1:1', desc: 'โลโก้แบรนด์ วงกลม (แนะนำ 200×200px, 1:1)' },
  deals:   { width: 560, height: 315, ratio: '16:9', desc: 'รูปดีล/โปรโมชัน (แนะนำ 560×315px, 16:9)' },
};

const GRADIENT_OPTIONS = [
  { value: 'from-dark-green/90 to-transparent', label: 'เขียวเข้ม' },
  { value: 'from-primary-dark/90 to-transparent', label: 'เขียวสด' },
  { value: 'from-black/70 to-transparent', label: 'ดำ' },
  { value: 'from-blue-900/80 to-transparent', label: 'น้ำเงิน' },
  { value: 'from-red-900/80 to-transparent', label: 'แดง' },
  { value: 'from-purple-900/80 to-transparent', label: 'ม่วง' },
];

export default function ContentManager() {
  const [tab, setTab] = useState<Tab>('banners');
  const [banners, setBanners] = useState<Banner[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const headers = () => ({ Authorization: `Bearer ${tk()}`, 'Content-Type': 'application/json' });

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [b, br, d] = await Promise.all([
        fetch(`${API_BASE}/content/admin/banners`, { headers: headers() }).then(r => r.json()),
        fetch(`${API_BASE}/content/admin/brands`, { headers: headers() }).then(r => r.json()),
        fetch(`${API_BASE}/content/admin/deals`, { headers: headers() }).then(r => r.json()),
      ]);
      setBanners(b.banners || []);
      setBrands(br.brands || []);
      setDeals(d.deals || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function uploadImage(file: File): Promise<string | null> {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`${API_BASE}/content/upload/${tab}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tk()}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data.imageUrl;
    } catch (e: any) {
      alert('อัพโหลดล้มเหลว: ' + (e.message || 'Unknown'));
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file);
    if (url) {
      const key = tab === 'brands' ? 'logo_url' : 'image_url';
      setEditItem((prev: any) => ({ ...prev, [key]: url }));
    }
    if (fileRef.current) fileRef.current.value = '';
  }

  function openNew() {
    if (tab === 'banners') {
      setEditItem({ title: '', subtitle: '', image_url: '', button_text: 'ดูรายละเอียด', link_type: 'rewards', gradient_color: 'from-dark-green/90 to-transparent', sort_order: banners.length, is_active: true });
    } else if (tab === 'brands') {
      setEditItem({ name: '', logo_url: '', link_url: '/rewards', sort_order: brands.length, is_active: true });
    } else {
      setEditItem({ title: '', subtitle: '', tag: '', image_url: '', link_url: '/rewards', sort_order: deals.length, is_active: true });
    }
    setShowForm(true);
  }

  function openEdit(item: any) {
    setEditItem({ ...item });
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const isNew = !editItem.id;
      const endpoint = tab === 'brands'
        ? `${API_BASE}/content/admin/brands${isNew ? '' : '/' + editItem.id}`
        : tab === 'banners'
          ? `${API_BASE}/content/admin/banners${isNew ? '' : '/' + editItem.id}`
          : `${API_BASE}/content/admin/deals${isNew ? '' : '/' + editItem.id}`;

      const res = await fetch(endpoint, {
        method: isNew ? 'POST' : 'PUT',
        headers: headers(),
        body: JSON.stringify(editItem),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setShowForm(false);
      setEditItem(null);
      await loadAll();
    } catch (e: any) {
      alert('บันทึกล้มเหลว: ' + (e.message || 'Unknown'));
    }
    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!confirm('ต้องการลบรายการนี้?')) return;
    try {
      const endpoint = tab === 'brands'
        ? `${API_BASE}/content/admin/brands/${id}`
        : tab === 'banners'
          ? `${API_BASE}/content/admin/banners/${id}`
          : `${API_BASE}/content/admin/deals/${id}`;
      await fetch(endpoint, { method: 'DELETE', headers: headers() });
      await loadAll();
    } catch (e) { console.error(e); }
  }

  async function toggleActive(item: any) {
    const endpoint = tab === 'brands'
      ? `${API_BASE}/content/admin/brands/${item.id}`
      : tab === 'banners'
        ? `${API_BASE}/content/admin/banners/${item.id}`
        : `${API_BASE}/content/admin/deals/${item.id}`;
    await fetch(endpoint, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ is_active: !item.is_active }),
    });
    await loadAll();
  }

  const items = tab === 'banners' ? banners : tab === 'brands' ? brands : deals;
  const spec = SPECS[tab];

  const tabs: { key: Tab; label: string; icon: string; count: number }[] = [
    { key: 'banners', label: 'แบนเนอร์', icon: 'view_carousel', count: banners.length },
    { key: 'brands', label: 'แบรนด์', icon: 'storefront', count: brands.length },
    { key: 'deals', label: 'ดีล/โปรโมชัน', icon: 'local_offer', count: deals.length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">จัดการคอนเทนต์หน้าแอป</h1>
          <p className="text-slate-500 text-sm mt-1">จัดการแบนเนอร์, แบรนด์, และดีลที่แสดงบนหน้าแรกของลูกค้า</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-sm">
          <span className="material-symbols-outlined text-[20px]">add</span>
          เพิ่มรายการใหม่
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-0">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setShowForm(false); }}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
              tab === t.key
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
            {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Size Spec Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <span className="material-symbols-outlined text-blue-600 mt-0.5">info</span>
        <div>
          <p className="text-blue-800 font-semibold text-sm">{spec.desc}</p>
          <p className="text-blue-600 text-xs mt-1">
            ขนาด: <strong>{spec.width}×{spec.height}px</strong> · อัตราส่วน: <strong>{spec.ratio}</strong> · รูปแบบ: JPEG, PNG, WebP · ขนาดไฟล์ไม่เกิน 5MB
          </p>
        </div>
      </div>

      {/* Form */}
      {showForm && editItem && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-slate-900">{editItem.id ? 'แก้ไข' : 'เพิ่มใหม่'}</h3>
            <button onClick={() => { setShowForm(false); setEditItem(null); }} className="text-slate-400 hover:text-slate-600">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              รูปภาพ <span className="text-slate-400 font-normal">({spec.width}×{spec.height}px, {spec.ratio})</span>
            </label>
            {(tab === 'brands' ? editItem.logo_url : editItem.image_url) && (
              <div className="mb-3">
                <img
                  src={tab === 'brands' ? editItem.logo_url : editItem.image_url}
                  alt="preview"
                  className={`border border-slate-200 rounded-lg object-cover ${
                    tab === 'banners' ? 'h-32 w-auto max-w-full' :
                    tab === 'brands' ? 'h-20 w-20 rounded-full' :
                    'h-28 w-auto max-w-[280px]'
                  }`}
                />
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">{uploading ? 'hourglass_top' : 'cloud_upload'}</span>
                {uploading ? 'กำลังอัพโหลด...' : 'อัพโหลดรูป'}
              </button>
              <input
                type="url"
                placeholder="หรือวาง URL รูปภาพ..."
                value={tab === 'brands' ? editItem.logo_url : editItem.image_url}
                onChange={(e) => {
                  const key = tab === 'brands' ? 'logo_url' : 'image_url';
                  setEditItem({ ...editItem, [key]: e.target.value });
                }}
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFileChange} className="hidden" />
          </div>

          {/* Common fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tab !== 'brands' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">ชื่อ / หัวข้อ</label>
                  <input type="text" value={editItem.title} onChange={e => setEditItem({ ...editItem, title: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="เช่น Double Points Weekend" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">รายละเอียด</label>
                  <input type="text" value={editItem.subtitle} onChange={e => setEditItem({ ...editItem, subtitle: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="คำอธิบายสั้นๆ" />
                </div>
              </>
            )}

            {tab === 'brands' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">ชื่อแบรนด์</label>
                  <input type="text" value={editItem.name} onChange={e => setEditItem({ ...editItem, name: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="เช่น Starbucks" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">ลิงก์ปลายทาง</label>
                  <input type="text" value={editItem.link_url} onChange={e => setEditItem({ ...editItem, link_url: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="/rewards" />
                </div>
              </>
            )}

            {tab === 'banners' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">ข้อความปุ่ม</label>
                  <input type="text" value={editItem.button_text} onChange={e => setEditItem({ ...editItem, button_text: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="ดูรายละเอียด" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">สีพื้นหลัง Gradient</label>
                  <select value={editItem.gradient_color} onChange={e => setEditItem({ ...editItem, gradient_color: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    {GRADIENT_OPTIONS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">ลิงก์ปลายทาง</label>
                  <select value={editItem.link_type} onChange={e => setEditItem({ ...editItem, link_type: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <option value="rewards">หน้า Rewards</option>
                    <option value="stores">หน้า Stores</option>
                    <option value="wallet">หน้า Wallet</option>
                    <option value="scan">หน้า Scan</option>
                  </select>
                </div>
              </>
            )}

            {tab === 'deals' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">ป้ายแท็ก</label>
                  <input type="text" value={editItem.tag} onChange={e => setEditItem({ ...editItem, tag: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="เช่น ยอดนิยม, พาร์ทเนอร์" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">ลิงก์ปลายทาง</label>
                  <input type="text" value={editItem.link_url} onChange={e => setEditItem({ ...editItem, link_url: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="/rewards" />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">ลำดับการแสดง</label>
              <input type="number" value={editItem.sort_order} onChange={e => setEditItem({ ...editItem, sort_order: parseInt(e.target.value) || 0 })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={editItem.is_active} onChange={e => setEditItem({ ...editItem, is_active: e.target.checked })} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
              <span className="text-sm font-medium text-slate-700">เปิดใช้งาน</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
              <span className="material-symbols-outlined text-[18px]">{saving ? 'hourglass_top' : 'save'}</span>
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
            <button onClick={() => { setShowForm(false); setEditItem(null); }}
              className="px-5 py-2.5 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {/* Items List */}
      {loading ? (
        <div className="text-center py-12"><div className="animate-spin inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <span className="material-symbols-outlined text-slate-300 text-5xl">image</span>
          <p className="text-slate-500 mt-3 font-medium">ยังไม่มีรายการ</p>
          <button onClick={openNew} className="mt-4 text-primary font-semibold text-sm hover:underline">+ เพิ่มรายการแรก</button>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item: any) => (
            <div key={item.id} className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex ${!item.is_active ? 'opacity-60' : ''}`}>
              {/* Preview */}
              <div className={`shrink-0 bg-slate-100 flex items-center justify-center ${
                tab === 'banners' ? 'w-48 h-28' : tab === 'brands' ? 'w-24 h-24' : 'w-40 h-24'
              }`}>
                <img
                  src={tab === 'brands' ? item.logo_url : item.image_url}
                  alt={item.title || item.name}
                  className={`object-cover ${
                    tab === 'brands' ? 'w-16 h-16 rounded-full' : 'w-full h-full'
                  }`}
                  onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="%23ccc"><rect width="100" height="100"/><text x="50%" y="55%" font-size="12" text-anchor="middle" fill="%23999">No Image</text></svg>'; }}
                />
              </div>

              {/* Info */}
              <div className="flex-1 p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-900 truncate">{item.title || item.name}</h4>
                    {item.tag && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">{item.tag}</span>}
                  </div>
                  {item.subtitle && <p className="text-slate-500 text-sm mt-0.5 truncate">{item.subtitle}</p>}
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span>ลำดับ: {item.sort_order}</span>
                    <span className={`flex items-center gap-1 ${item.is_active ? 'text-green-600' : 'text-red-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${item.is_active ? 'bg-green-500' : 'bg-red-400'}`} />
                      {item.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => toggleActive(item)} title={item.is_active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                    className={`p-2 rounded-lg hover:bg-slate-100 transition-colors ${item.is_active ? 'text-green-600' : 'text-slate-400'}`}>
                    <span className="material-symbols-outlined text-[20px]">{item.is_active ? 'visibility' : 'visibility_off'}</span>
                  </button>
                  <button onClick={() => openEdit(item)} className="p-2 rounded-lg hover:bg-slate-100 text-blue-600 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
