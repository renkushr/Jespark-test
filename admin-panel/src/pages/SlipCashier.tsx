import { useState, useRef, useEffect, useCallback } from 'react';
import Tesseract from 'tesseract.js';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  memberId: string;
  tier: string;
  points: number;
}

export default function SlipCashier() {
  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // OCR state
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrAmount, setOcrAmount] = useState<string>('');

  // Form state
  const [confirmedAmount, setConfirmedAmount] = useState<string>('');
  const [staffName, setStaffName] = useState<string>(() => localStorage.getItem('slip_staff_name') || '');
  const [note, setNote] = useState<string>('');

  // Customer search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string>('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Submit state
  const [uploading, setUploading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // Result modal
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

  // Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Save staff name to localStorage
  useEffect(() => {
    if (staffName) localStorage.setItem('slip_staff_name', staffName);
  }, [staffName]);

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setOcrAmount('');
    setConfirmedAmount('');
  };

  // OCR: Extract amount from slip
  const runOCR = async () => {
    if (!imagePreview) return;
    setOcrProcessing(true);
    setOcrProgress(0);
    try {
      const result = await Tesseract.recognize(imagePreview, 'tha+eng', {
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100));
          }
        }
      });

      const text = result.data.text;
      console.log('OCR Text:', text);

      // Strategy for Thai bank slips:
      // 1. First try: find amount near Thai keywords (จำนวน, บาท, THB, เงิน, ยอด)
      // 2. Second try: find numbers with decimal format (X,XXX.XX or X,XXX.00)
      // 3. Last resort: find the largest number with .00 ending
      let foundAmount: number | null = null;

      const lines = text.split('\n').map((l: string) => l.trim()).filter((l: string) => l);

      // Strategy 1: Look for amount near Thai money keywords
      const moneyKeywords = /(?:จำนวน|บาท|THB|เงิน|ยอด|โอน|amount|total|จ่าย|รับ|transfer)/i;
      for (const line of lines) {
        if (moneyKeywords.test(line)) {
          const nums = line.match(/[\d,]+\.\d{2}/g);
          if (nums) {
            for (const n of nums) {
              const val = parseFloat(n.replace(/,/g, ''));
              if (!isNaN(val) && val > 0 && val < 1000000) {
                foundAmount = val;
                break;
              }
            }
          }
          if (foundAmount) break;
        }
      }

      // Strategy 2: Find all numbers with .XX decimal format (typical for money)
      if (!foundAmount) {
        const decimalAmounts = text.match(/[\d,]+\.\d{2}/g);
        if (decimalAmounts) {
          const parsed = decimalAmounts
            .map((s: string) => parseFloat(s.replace(/,/g, '')))
            .filter((n: number) => !isNaN(n) && n > 1 && n < 1000000);
          if (parsed.length > 0) {
            // Pick the largest decimal-formatted number (likely the transfer amount)
            foundAmount = Math.max(...parsed);
          }
        }
      }

      // Strategy 3: Fallback — numbers with comma formatting (e.g. 3,540)
      if (!foundAmount) {
        const commaAmounts = text.match(/\d{1,3}(?:,\d{3})+(?:\.\d{2})?/g);
        if (commaAmounts) {
          const parsed = commaAmounts
            .map((s: string) => parseFloat(s.replace(/,/g, '')))
            .filter((n: number) => !isNaN(n) && n > 1 && n < 1000000);
          if (parsed.length > 0) {
            foundAmount = Math.max(...parsed);
          }
        }
      }

      if (foundAmount) {
        const amountStr = foundAmount.toFixed(2);
        setOcrAmount(amountStr);
        setConfirmedAmount(amountStr);
        showToast('success', `OCR พบยอดเงิน: ฿${foundAmount.toLocaleString()}`);
      } else {
        showToast('error', 'ไม่พบยอดเงินในสลิป กรุณาใส่ยอดเงินเอง');
      }
    } catch (err) {
      console.error('OCR Error:', err);
      showToast('error', 'OCR ล้มเหลว กรุณาใส่ยอดเงินเอง');
    } finally {
      setOcrProcessing(false);
    }
  };

  // Auto-run OCR when image is selected
  useEffect(() => {
    if (imagePreview) runOCR();
  }, [imagePreview]);

  // Customer search with debounce
  const searchCustomer = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setSearchError('');
      return;
    }
    setSearching(true);
    setSearchError('');
    try {
      const res = await fetch(`${API_BASE}/slip-cashier/search-customer?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.customers || []);
      } else {
        const errData = await res.json().catch(() => ({}));
        setSearchError(errData.error || `เซิร์ฟเวอร์ตอบ ${res.status}`);
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchError('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาตรวจสอบว่า server กำลังรันอยู่');
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (searchQuery.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => searchCustomer(searchQuery), 300);
    } else {
      setSearchResults([]);
    }
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [searchQuery, searchCustomer]);

  // Calculate points
  const pointsEarned = confirmedAmount ? Math.floor(parseFloat(confirmedAmount) / 35) * 5 : 0;

  // Handle confirm
  const handleConfirm = async () => {
    if (!imageFile) { showToast('error', 'กรุณาถ่ายรูปหรืออัพโหลดสลิป'); return; }
    if (!confirmedAmount || parseFloat(confirmedAmount) <= 0) { showToast('error', 'กรุณาใส่ยอดเงิน'); return; }
    if (!selectedCustomer) { showToast('error', 'กรุณาเลือกลูกค้า'); return; }
    if (!staffName.trim()) { showToast('error', 'กรุณาใส่ชื่อพนักงาน'); return; }

    try {
      // Step 1: Upload image
      setUploading(true);
      const formData = new FormData();
      formData.append('slip', imageFile);

      const uploadRes = await fetch(`${API_BASE}/slip-cashier/upload`, {
        method: 'POST',
        body: formData
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.error || 'Upload failed');
      }

      const { imageUrl } = await uploadRes.json();
      setUploading(false);

      // Step 2: Confirm transaction
      setConfirming(true);
      const confirmRes = await fetch(`${API_BASE}/slip-cashier/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slipImageUrl: imageUrl,
          ocrAmount: ocrAmount || null,
          confirmedAmount: parseFloat(confirmedAmount),
          customerId: selectedCustomer.id,
          customerName: selectedCustomer.name,
          staffName: staffName.trim(),
          note: note || null
        })
      });

      if (!confirmRes.ok) {
        const err = await confirmRes.json();
        throw new Error(err.error || 'Confirm failed');
      }

      const data = await confirmRes.json();
      setResultData(data.transaction);
      setShowResult(true);

      // Reset form
      setImageFile(null);
      setImagePreview('');
      setOcrAmount('');
      setConfirmedAmount('');
      setSelectedCustomer(null);
      setSearchQuery('');
      setNote('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';

    } catch (err: any) {
      showToast('error', err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setUploading(false);
      setConfirming(false);
    }
  };

  // Clear all
  const handleClear = () => {
    setImageFile(null);
    setImagePreview('');
    setOcrAmount('');
    setConfirmedAmount('');
    setSelectedCustomer(null);
    setSearchQuery('');
    setSearchResults([]);
    setNote('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 text-white rounded-xl shadow-lg ${toast.type === 'success' ? 'bg-success' : 'bg-danger'}`}>
          <span className="material-symbols-outlined text-[18px]">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">สแกนสลิป</h1>
        <p className="text-sm text-slate-500 mt-0.5">ถ่ายรูปหรืออัพโหลดสลิป → OCR อ่านยอดเงิน → เลือกลูกค้า → ยืนยันให้แต้ม</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Image Upload + OCR */}
        <div className="space-y-5">
          {/* Upload Area */}
          <Card title="1. สลิปการโอนเงิน">
            {!imagePreview ? (
              <div className="space-y-3">
                {/* Camera button */}
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-3 p-6 border-2 border-dashed border-primary/30 rounded-xl bg-primary-50/50 hover:bg-primary-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-primary text-3xl">photo_camera</span>
                  <span className="font-bold text-primary">ถ่ายรูปสลิป</span>
                </button>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                {/* File upload button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-3 p-4 border-2 border-dashed border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-400 text-2xl">upload_file</span>
                  <span className="font-bold text-slate-500">อัพโหลดรูปสลิป</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-3">
                {/* Preview */}
                <div className="relative">
                  <img src={imagePreview} alt="Slip preview" className="w-full max-h-80 object-contain rounded-xl border border-slate-200" />
                  <button
                    onClick={handleClear}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-colors"
                  >
                    <span className="material-symbols-outlined text-slate-500 text-[18px]">close</span>
                  </button>
                </div>

                {/* OCR Progress */}
                {ocrProcessing && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px] animate-spin">progress_activity</span>
                      <span className="text-sm text-slate-500">กำลังอ่านสลิป... {ocrProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${ocrProgress}%` }} />
                    </div>
                  </div>
                )}

                {/* OCR Result */}
                {!ocrProcessing && ocrAmount && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <span className="material-symbols-outlined text-success text-[18px]">check_circle</span>
                    <span className="text-sm text-emerald-700">OCR พบยอดเงิน: <span className="font-black">฿{parseFloat(ocrAmount).toLocaleString()}</span></span>
                  </div>
                )}

                {/* Re-scan button */}
                {!ocrProcessing && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" icon="refresh" onClick={runOCR}>สแกนใหม่</Button>
                    <Button variant="secondary" size="sm" icon="photo_camera" onClick={() => { handleClear(); cameraInputRef.current?.click(); }}>ถ่ายรูปใหม่</Button>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Staff Name */}
          <Card title="2. พนักงาน">
            <div className="space-y-1.5">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">badge</span>
                <input
                  type="text"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="ชื่อพนักงาน"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
                />
              </div>
              <p className="text-[10px] text-slate-400">ชื่อจะถูกจำไว้สำหรับครั้งถัดไป</p>
            </div>
          </Card>
        </div>

        {/* Right: Amount + Customer + Confirm */}
        <div className="space-y-5">
          {/* Amount */}
          <Card title="3. ยอดเงิน">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">ยอดเงิน (บาท)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-black text-slate-400">฿</span>
                  <input
                    type="number"
                    value={confirmedAmount}
                    onChange={(e) => setConfirmedAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-xl font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
                  />
                </div>
                {ocrAmount && confirmedAmount !== ocrAmount && (
                  <p className="text-[10px] text-amber-600">
                    <span className="material-symbols-outlined text-[12px] align-middle">info</span> OCR อ่านได้ ฿{parseFloat(ocrAmount).toLocaleString()} — คุณแก้ไขเป็น ฿{confirmedAmount ? parseFloat(confirmedAmount).toLocaleString() : '0'}
                  </p>
                )}
              </div>

              {/* Points Preview */}
              {confirmedAmount && parseFloat(confirmedAmount) > 0 && (
                <div className="bg-gradient-to-r from-primary-50 to-emerald-50 rounded-xl p-4 border border-primary-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">แต้มที่จะได้รับ</p>
                      <p className="text-3xl font-black text-primary mt-1">{pointsEarned.toLocaleString()}</p>
                    </div>
                    <div className="text-right text-[10px] text-slate-400">
                      <p>ทุก 35 บาท = 5 แต้ม</p>
                      <p className="font-bold text-slate-500 mt-1">฿{confirmedAmount ? parseFloat(confirmedAmount).toLocaleString() : '0'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Customer Search */}
          <Card title="4. เลือกลูกค้า">
            {selectedCustomer ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-primary-50 border border-primary-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-[20px]">person</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{selectedCustomer.name}</p>
                      <p className="text-[10px] text-slate-500">{selectedCustomer.memberId} · {selectedCustomer.tier} · {selectedCustomer.points?.toLocaleString()} แต้ม</p>
                    </div>
                  </div>
                  <button onClick={() => { setSelectedCustomer(null); setSearchQuery(''); }} className="p-1.5 hover:bg-white rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">close</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ค้นหาด้วยชื่อ, เบอร์โทร, หรือ Member ID..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
                  />
                  {searching && (
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary text-[18px] animate-spin">progress_activity</span>
                  )}
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    {searchResults.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => { setSelectedCustomer(c); setSearchQuery(''); setSearchResults([]); }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-b-0 text-left"
                      >
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-slate-400 text-[16px]">person</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-800 text-sm truncate">{c.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{c.memberId} · {c.phone || c.email || '-'}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[10px] font-bold text-primary">{c.points?.toLocaleString()} แต้ม</p>
                          <p className="text-[10px] text-slate-400">{c.tier}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {searchQuery.length >= 2 && !searching && searchResults.length === 0 && !searchError && (
                  <p className="text-sm text-slate-400 text-center py-3">ไม่พบลูกค้า</p>
                )}
                {searchError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <span className="material-symbols-outlined text-red-500 text-[18px]">error</span>
                    <p className="text-sm text-red-600">{searchError}</p>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Note */}
          <Card title="5. หมายเหตุ (ไม่บังคับ)">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="เพิ่มหมายเหตุ..."
              rows={2}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all resize-none"
            />
          </Card>

          {/* Confirm Button */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              icon="refresh"
              onClick={handleClear}
              fullWidth
            >
              ล้างข้อมูล
            </Button>
            <Button
              variant="success"
              icon="check_circle"
              onClick={handleConfirm}
              isLoading={uploading || confirming}
              disabled={!imageFile || !confirmedAmount || !selectedCustomer || !staffName.trim() || ocrProcessing}
              fullWidth
            >
              {uploading ? 'กำลังอัพโหลด...' : confirming ? 'กำลังยืนยัน...' : 'ยืนยันให้แต้ม'}
            </Button>
          </div>
        </div>
      </div>

      {/* Success Result Modal */}
      <Modal isOpen={showResult && !!resultData} onClose={() => setShowResult(false)} title="✅ ยืนยันสำเร็จ!"
        footer={<Button onClick={() => setShowResult(false)} icon="check">ปิด</Button>}
      >
        {resultData && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-primary-50 to-emerald-50 rounded-xl p-5 text-center border border-primary-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">แต้มที่ให้</p>
              <p className="text-4xl font-black text-primary mt-1">+{resultData.pointsEarned?.toLocaleString()}</p>
              <p className="text-sm text-slate-500 mt-1">จากยอด ฿{resultData.confirmedAmount?.toLocaleString()}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">ลูกค้า</span>
                <span className="font-bold text-slate-800">{resultData.customerName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">พนักงาน</span>
                <span className="font-bold text-slate-800">{resultData.staffName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">เวลา</span>
                <span className="font-bold text-slate-800">{resultData.confirmedAt ? new Date(resultData.confirmedAt).toLocaleString('th-TH') : '-'}</span>
              </div>
              {resultData.note && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">หมายเหตุ</span>
                  <span className="font-bold text-slate-800">{resultData.note}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
