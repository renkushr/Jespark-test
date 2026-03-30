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

interface ReceiptData {
  storeName: string;
  receiptNo: string;
  date: string;
  customerName: string;
  hn: string;
  items: { description: string; price: string }[];
  subtotal: string;
  discount: string;
  total: string;
  totalText: string;
  rawText: string;
}

const emptyReceipt: ReceiptData = {
  storeName: '',
  receiptNo: '',
  date: '',
  customerName: '',
  hn: '',
  items: [],
  subtotal: '',
  discount: '',
  total: '',
  totalText: '',
  rawText: '',
};

function parseReceipt(text: string): ReceiptData {
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l);
  const data: ReceiptData = { ...emptyReceipt, rawText: text, items: [] };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Store name — usually first few non-empty lines with Thai or company names
    if (i < 5 && !data.storeName && /(?:โรงพยาบาล|บริษัท|ร้าน|hospital|company|clinic|shop|ห้าง|สำนักงาน)/i.test(line)) {
      data.storeName = line;
    }
    // Also check line below for company name continuation
    if (i < 5 && !data.storeName && /(?:จำกัด|co\.|ltd|inc)/i.test(line)) {
      data.storeName = (i > 0 ? lines[i - 1] + ' ' : '') + line;
    }

    // Receipt number
    if (/(?:เลขที่|เลขท|receipt\s*no|invoice\s*no|bill\s*no|ref|หมายเลข)/i.test(line)) {
      const numMatch = line.match(/(?:เลขที่|เลขท|no|ref|หมายเลข)[^\w\d]*[:\s]*([A-Za-z0-9\-]+)/i);
      if (numMatch) data.receiptNo = numMatch[1].trim();
      else {
        const fallback = line.match(/[A-Z]{1,3}[\-]?\d{5,}/);
        if (fallback) data.receiptNo = fallback[0];
      }
    }

    // Date — also capture time if present
    if (/(?:วันที่|วันท|date)/i.test(line) && !data.date) {
      const dateMatch = line.match(/(\d{1,2}\s*[\/\-\.]\s*\d{1,2}\s*[\/\-\.]\s*\d{2,4})/);
      if (dateMatch) {
        let dateStr = dateMatch[1].replace(/\s/g, '');
        // Check for time on same line
        const timeMatch = line.match(/(\d{1,2}[:\.:]\d{2}(?:[:\.:]\d{2})?\s*(?:น\.|u\.|AM|PM)?)/i);
        if (timeMatch) dateStr += ' ' + timeMatch[1];
        data.date = dateStr;
      } else {
        // Thai date: 30 มกราคม 2569 16:42:37 น.
        const thaiDate = line.match(/(\d{1,2}\s+(?:มกราคม|กุมภาพันธ์|มีนาคม|เมษายน|พฤษภาคม|มิถุนายน|กรกฎาคม|สิงหาคม|กันยายน|ตุลาคม|พฤศจิกายน|ธันวาคม|ม\.ค\.|ก\.พ\.|มี\.ค\.|เม\.ย\.|พ\.ค\.|มิ\.ย\.|ก\.ค\.|ส\.ค\.|ก\.ย\.|ต\.ค\.|พ\.ย\.|ธ\.ค\.)\s+\d{2,4}(?:\s+\d{1,2}[:\.:]\d{2}(?:[:\.:]\d{2})?\s*(?:น\.)?)?)/i);
        if (thaiDate) data.date = thaiDate[1];
      }
    }

    // HN number (e.g. HN : 67000122, HN: 12345, HN 12345)
    if (/(?:HN|H\.?N\.?)\s*[:：]?\s*\d+/i.test(line) && !data.hn) {
      const hnMatch = line.match(/(?:HN|H\.?N\.?)\s*[:：]?\s*(\d+)/i);
      if (hnMatch) data.hn = hnMatch[1].trim();
    }

    // Customer name
    if (/(?:ชื่อ[\-\s]*นามสกุล|ชื่อ|ผู้ป่วย|ลูกค้า|customer|patient|name|นาย|นาง|นางสาว|น\.ส\.|Mr|Mrs|Ms)/i.test(line) && !data.customerName) {
      // First: extract HN from same line if present
      if (!data.hn) {
        const hnInLine = line.match(/(?:HN|H\.?N\.?)\s*[:：]?\s*(\d+)/i);
        if (hnInLine) data.hn = hnInLine[1].trim();
      }

      const nameMatch = line.match(/(?:ชื่อ[\-\s]*นามสกุล|ชื่อ|ผู้ป่วย|ลูกค้า|customer|patient|name)\s*[:：\s]*(.+)/i);
      if (nameMatch && nameMatch[1].trim().length > 1) {
        // Clean out HN codes and trim
        data.customerName = nameMatch[1]
          .replace(/(?:HN|H\.?N\.?)\s*[:：]?\s*\d+/gi, '')
          .replace(/\s{2,}/g, ' ')
          .trim();
      } else {
        const prefixMatch = line.match(/((?:นาย|นาง|นางสาว|น\.ส\.|Mr\.?|Mrs\.?|Ms\.?)\s*.+)/i);
        if (prefixMatch) {
          data.customerName = prefixMatch[1]
            .replace(/(?:HN|H\.?N\.?)\s*[:：]?\s*\d+/gi, '')
            .replace(/\s{2,}/g, ' ')
            .trim();
        }
      }
    }

    // Items — lines with price pattern at the end
    if (i > 5) {
      const itemMatch = line.match(/^(.+?)\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})$/);
      if (itemMatch) {
        data.items.push({ description: itemMatch[1].trim(), price: itemMatch[4] });
      } else {
        const simpleItem = line.match(/^(.{4,}?)\s+([\d,]+\.\d{2})$/);
        if (simpleItem && !/(?:รวม|total|ส่วนลด|discount|subtotal|เงิน|ทั้งสิ้น|สุทธิ)/i.test(simpleItem[1])) {
          data.items.push({ description: simpleItem[1].trim(), price: simpleItem[2] });
        }
      }
    }

    // Subtotal
    if (/(?:รวมเป็นเงิน|subtotal|รวมเงิน)/i.test(line) && !/(?:ทั้งสิ้น|ทั้งสน)/i.test(line)) {
      const subMatch = line.match(/([\d,]+\.\d{2})/);
      if (subMatch) data.subtotal = subMatch[1];
    }

    // Discount
    if (/(?:ส่วนลด|discount)/i.test(line)) {
      const discMatch = line.match(/([\d,]+\.\d{2})/);
      if (discMatch) data.discount = discMatch[1];
    }

    // Total
    if (/(?:รวมเป็นเงินทั้งสิ้น|รวมทั้งสิ้น|total|ยอดรวม|สุทธิ|ยอดสุทธิ|net\s*amount|grand\s*total|รวมเป็นเงิน.*ทั้ง)/i.test(line)) {
      const totalMatch = line.match(/([\d,]+\.\d{2})/);
      if (totalMatch) data.total = totalMatch[1];
    }
    // Fallback: line with (Total) keyword
    if (/\(Total\)/i.test(line)) {
      const totalMatch = line.match(/([\d,]+\.\d{2})/);
      if (totalMatch) data.total = totalMatch[1];
    }

    // Total in text (e.g. "สามสิบบาทถ้วน" / "THIRTY BAHT")
    if (/(?:BAHT|บาท.*ถ้วน|บาทถ้วน)/i.test(line) && !data.totalText) {
      data.totalText = line;
    }
  }

  // If no total found, use the last decimal number found
  if (!data.total) {
    const allAmounts = text.match(/[\d,]+\.\d{2}/g);
    if (allAmounts && allAmounts.length > 0) {
      data.total = allAmounts[allAmounts.length - 1];
    }
  }

  // If store name still empty, use first meaningful line
  if (!data.storeName && lines.length > 0) {
    for (const l of lines.slice(0, 5)) {
      if (l.length > 5 && !/^\d+$/.test(l)) {
        data.storeName = l;
        break;
      }
    }
  }

  return data;
}

export default function ReceiptScanner() {
  // Image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // OCR
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  // Amount (editable)
  const [confirmedAmount, setConfirmedAmount] = useState<string>('');

  // Staff
  const [staffName, setStaffName] = useState<string>(() => localStorage.getItem('slip_staff_name') || '');

  // Customer search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string>('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Note
  const [note, setNote] = useState<string>('');

  // Submit
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

  // Save staff name
  useEffect(() => {
    if (staffName) localStorage.setItem('slip_staff_name', staffName);
  }, [staffName]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setReceipt(null);
    setConfirmedAmount('');
  };

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
      console.log('Receipt OCR Text:', text);

      const parsed = parseReceipt(text);
      setReceipt(parsed);

      if (parsed.total) {
        const amt = parsed.total.replace(/,/g, '');
        setConfirmedAmount(amt);
        showToast('success', `อ่านใบเสร็จสำเร็จ! ยอดรวม: ฿${parsed.total}`);
      } else {
        showToast('error', 'ไม่พบยอดรวม กรุณาใส่ยอดเงินเอง');
      }
    } catch (err) {
      console.error('OCR Error:', err);
      showToast('error', 'OCR ล้มเหลว');
    } finally {
      setOcrProcessing(false);
    }
  };

  useEffect(() => {
    if (imagePreview) runOCR();
  }, [imagePreview]);

  // Customer search with debounce — uses /admin/customers endpoint
  const searchCustomer = useCallback(async (query: string) => {
    if (query.length < 1) { setSearchResults([]); setSearchError(''); return; }
    setSearching(true);
    setSearchError('');
    try {
      const params = new URLSearchParams({ search: query, limit: '10' });
      const tk = localStorage.getItem('admin_token');
      const res = await fetch(`${API_BASE}/admin/customers?${params}`, { headers: { 'Authorization': `Bearer ${tk}` } });
      if (res.ok) {
        const data = await res.json();
        const mapped = (data.customers || []).map((c: any) => ({
          id: c.id,
          name: c.name || 'ไม่ระบุชื่อ',
          email: c.email,
          phone: c.phone,
          memberId: '',
          tier: c.tier,
          points: c.points
        }));
        setSearchResults(mapped);
      } else {
        const errData = await res.json().catch(() => ({}));
        setSearchError(errData.error || `เซิร์ฟเวอร์ตอบ ${res.status}`);
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchError('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้');
    } finally { setSearching(false); }
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (searchQuery.length >= 1) {
      searchTimeoutRef.current = setTimeout(() => searchCustomer(searchQuery), 300);
    } else { setSearchResults([]); }
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [searchQuery, searchCustomer]);

  // Validation warnings
  const hasHN = !!(receipt?.hn);
  const hasReceiptNo = !!(receipt?.receiptNo);

  // Amount mismatch warning
  const ocrAmountNum = receipt?.total ? parseFloat(receipt.total.replace(/,/g, '')) : null;
  const confirmedAmountNum = confirmedAmount ? parseFloat(confirmedAmount) : null;
  const amountMismatch = ocrAmountNum !== null && confirmedAmountNum !== null && Math.abs(ocrAmountNum - confirmedAmountNum) > 0.01;

  // Customer name cross-check
  const ocrCustomerName = receipt?.customerName?.trim() || '';
  const selectedName = selectedCustomer?.name?.trim() || '';
  const nameMatchWarning = ocrCustomerName && selectedName && !selectedName.includes(ocrCustomerName) && !ocrCustomerName.includes(selectedName);

  // Points
  const pointsEarned = confirmedAmount ? Math.floor(parseFloat(confirmedAmount) / 35) * 5 : 0;

  // Confirm
  const handleConfirm = async () => {
    if (!imageFile) { showToast('error', 'กรุณาถ่ายรูปหรืออัพโหลดใบเสร็จ'); return; }
    if (!confirmedAmount || parseFloat(confirmedAmount) <= 0) { showToast('error', 'กรุณาใส่ยอดเงิน'); return; }
    if (!selectedCustomer) { showToast('error', 'กรุณาเลือกลูกค้า'); return; }
    if (!staffName.trim()) { showToast('error', 'กรุณาใส่ชื่อพนักงาน'); return; }
    if (receipt && !hasHN) { showToast('error', 'ไม่พบเลข HN ในใบเสร็จ — ใบเสร็จอาจไม่ถูกต้อง'); return; }

    try {
      // Upload image
      setUploading(true);
      const formData = new FormData();
      formData.append('slip', imageFile);
      const tk = localStorage.getItem('admin_token');
      const uploadRes = await fetch(`${API_BASE}/slip-cashier/upload`, { method: 'POST', headers: { 'Authorization': `Bearer ${tk}` }, body: formData });
      if (!uploadRes.ok) { const err = await uploadRes.json(); throw new Error(err.error || 'Upload failed'); }
      const { imageUrl } = await uploadRes.json();
      setUploading(false);

      // Confirm transaction
      setConfirming(true);
      const confirmRes = await fetch(`${API_BASE}/slip-cashier/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tk}` },
        body: JSON.stringify({
          slipImageUrl: imageUrl,
          ocrAmount: receipt?.total ? parseFloat(receipt.total.replace(/,/g, '')) : null,
          confirmedAmount: parseFloat(confirmedAmount),
          customerId: selectedCustomer.id,
          customerName: selectedCustomer.name,
          staffName: staffName.trim(),
          receiptNo: receipt?.receiptNo || null,
          hnNumber: receipt?.hn || null,
          receiptDate: receipt?.date || null,
          flags: [
            ...(amountMismatch ? ['amount_mismatch'] : []),
            ...(nameMatchWarning ? ['name_mismatch'] : []),
          ],
          note: note || (receipt ? `ใบเสร็จ: ${receipt.storeName || ''} ${receipt.receiptNo || ''} ${receipt.hn ? 'HN:' + receipt.hn : ''}`.trim() : null)
        })
      });
      if (!confirmRes.ok) { const err = await confirmRes.json(); throw new Error(err.error || 'Confirm failed'); }
      const data = await confirmRes.json();
      setResultData(data.transaction);
      setShowResult(true);

      // Reset
      setImageFile(null);
      setImagePreview('');
      setReceipt(null);
      setConfirmedAmount('');
      setSelectedCustomer(null);
      setSearchQuery('');
      setNote('');
      setShowRaw(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    } catch (err: any) {
      showToast('error', err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setUploading(false);
      setConfirming(false);
    }
  };

  const handleClear = () => {
    setImageFile(null);
    setImagePreview('');
    setReceipt(null);
    setShowRaw(false);
    setConfirmedAmount('');
    setSelectedCustomer(null);
    setSearchQuery('');
    setSearchResults([]);
    setNote('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const InfoRow = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
    <div className="flex justify-between items-start py-2 border-b border-slate-50 last:border-b-0">
      <span className="text-slate-400 text-sm shrink-0 mr-3">{label}</span>
      <span className={`text-sm text-right ${bold ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>{value || '-'}</span>
    </div>
  );

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
        <h1 className="text-2xl font-black text-slate-900">อ่านใบเสร็จ</h1>
        <p className="text-sm text-slate-500 mt-0.5">ถ่ายรูปใบเสร็จ → OCR อ่านข้อมูล → ใส่ชื่อพนักงาน → เลือกลูกค้า → ยืนยันให้แต้ม</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Image + Receipt Info */}
        <div className="space-y-5">
          <Card title="1. ใบเสร็จ">
            {!imagePreview ? (
              <div className="space-y-3">
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-3 p-6 border-2 border-dashed border-primary/30 rounded-xl bg-primary-50/50 hover:bg-primary-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-primary text-3xl">photo_camera</span>
                  <span className="font-bold text-primary">ถ่ายรูปใบเสร็จ</span>
                </button>
                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageSelect} className="hidden" />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-3 p-4 border-2 border-dashed border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-400 text-2xl">upload_file</span>
                  <span className="font-bold text-slate-500">อัพโหลดรูปใบเสร็จ</span>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <img src={imagePreview} alt="Receipt" className="w-full max-h-80 object-contain rounded-xl border border-slate-200" />
                  <button onClick={handleClear} className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-colors">
                    <span className="material-symbols-outlined text-slate-500 text-[18px]">close</span>
                  </button>
                </div>

                {ocrProcessing && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px] animate-spin">progress_activity</span>
                      <span className="text-sm text-slate-500">กำลังอ่านใบเสร็จ... {ocrProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${ocrProgress}%` }} />
                    </div>
                  </div>
                )}

                {!ocrProcessing && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" icon="refresh" onClick={runOCR}>สแกนใหม่</Button>
                    <Button variant="secondary" size="sm" icon="photo_camera" onClick={() => { handleClear(); cameraInputRef.current?.click(); }}>ถ่ายรูปใหม่</Button>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Receipt Info (show after OCR) */}
          {receipt && !ocrProcessing && (
            <>
              <Card title="ข้อมูลที่อ่านได้">
                <div className="space-y-0">
                  <InfoRow label="ชื่อสถานที่" value={receipt.storeName} bold />
                  <InfoRow label="เลขที่ใบเสร็จ" value={receipt.receiptNo} />
                  <InfoRow label="วันที่" value={receipt.date} />
                  <InfoRow label="ชื่อ-นามสกุล" value={receipt.customerName} bold />
                  <InfoRow label="เลข HN" value={receipt.hn} bold />
                </div>

                {/* Validation Warnings */}
                <div className="mt-3 space-y-2">
                  {!hasHN && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                      <span className="material-symbols-outlined text-red-500 text-[18px]">error</span>
                      <div>
                        <p className="text-sm font-bold text-red-700">ไม่พบเลข HN</p>
                        <p className="text-[10px] text-red-500">ใบเสร็จจากโรงพยาบาลจะมี HN เสมอ — ใบเสร็จนี้อาจไม่ถูกต้อง</p>
                      </div>
                    </div>
                  )}
                  {hasHN && hasReceiptNo && (
                    <div className="flex items-center gap-2 p-2.5 bg-green-50 border border-green-200 rounded-xl">
                      <span className="material-symbols-outlined text-green-500 text-[16px]">verified</span>
                      <p className="text-xs text-green-700 font-bold">พบ HN: {receipt.hn} · เลขที่: {receipt.receiptNo}</p>
                    </div>
                  )}
                </div>
              </Card>

              {receipt.items.length > 0 && (
                <Card title="รายการ">
                  <div className="space-y-0">
                    {receipt.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start py-2 border-b border-slate-50 last:border-b-0">
                        <span className="text-sm text-slate-700 flex-1 mr-3">
                          <span className="text-slate-400 mr-1.5">{idx + 1}.</span>
                          {item.description}
                        </span>
                        <span className="text-sm font-bold text-slate-800 shrink-0">฿{item.price}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Raw Text */}
              <Card>
                <button onClick={() => setShowRaw(!showRaw)} className="w-full flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-500 font-bold">
                    <span className="material-symbols-outlined text-[18px]">code</span>
                    ข้อความดิบจาก OCR
                  </span>
                  <span className="material-symbols-outlined text-slate-400 text-[18px]">{showRaw ? 'expand_less' : 'expand_more'}</span>
                </button>
                {showRaw && (
                  <pre className="mt-3 p-3 bg-slate-50 rounded-lg text-xs text-slate-600 whitespace-pre-wrap max-h-64 overflow-y-auto border border-slate-100 font-mono">
                    {receipt.rawText}
                  </pre>
                )}
              </Card>
            </>
          )}
        </div>

        {/* Right: Amount + Staff + Customer + Confirm */}
        <div className="space-y-5">
          {/* Amount */}
          <Card title="2. ยอดเงิน">
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
                {amountMismatch && (
                  <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                    <span className="material-symbols-outlined text-amber-500 text-[16px]">warning</span>
                    <p className="text-xs text-amber-700">
                      <span className="font-bold">ยอดไม่ตรง:</span> OCR อ่านได้ ฿{receipt?.total} แต่กรอก ฿{confirmedAmountNum?.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {confirmedAmount && parseFloat(confirmedAmount) > 0 && (
                <div className="bg-gradient-to-r from-primary-50 to-emerald-50 rounded-xl p-4 border border-primary-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">แต้มที่จะได้รับ</p>
                      <p className="text-3xl font-black text-primary mt-1">{pointsEarned.toLocaleString()}</p>
                    </div>
                    <div className="text-right text-[10px] text-slate-400">
                      <p>ทุก 35 บาท = 5 แต้ม</p>
                      <p className="font-bold text-slate-500 mt-1">฿{parseFloat(confirmedAmount).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Staff Name */}
          <Card title="3. พนักงาน">
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

          {/* Customer Search */}
          <Card title="4. เลือกลูกค้า">
            {selectedCustomer ? (
              <>
                <div className="flex items-center justify-between p-3 bg-primary-50 border border-primary-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-[20px]">person</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{selectedCustomer.name}</p>
                      <p className="text-[10px] text-slate-500">{selectedCustomer.tier} · {selectedCustomer.points?.toLocaleString()} แต้ม</p>
                    </div>
                  </div>
                  <button onClick={() => { setSelectedCustomer(null); setSearchQuery(''); }} className="p-1.5 hover:bg-white rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">close</span>
                  </button>
                </div>
                {nameMatchWarning && (
                  <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl mt-2">
                    <span className="material-symbols-outlined text-amber-500 text-[16px]">warning</span>
                    <div>
                      <p className="text-xs font-bold text-amber-700">ชื่อไม่ตรง</p>
                      <p className="text-[10px] text-amber-600">ใบเสร็จ: &quot;{ocrCustomerName}&quot; · ลูกค้าที่เลือก: &quot;{selectedName}&quot;</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ค้นหาด้วยชื่อ หรือ เบอร์โทร..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
                  />
                  {searching && (
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary text-[18px] animate-spin">progress_activity</span>
                  )}
                </div>

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
                          <p className="text-[10px] text-slate-400 truncate">{c.phone ? c.phone : ''}{c.phone && c.email ? ' · ' : ''}{c.email || (!c.phone ? '-' : '')}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[10px] font-bold text-primary">{c.points?.toLocaleString()} แต้ม</p>
                          <p className="text-[10px] text-slate-400">{c.tier}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {searchQuery.length >= 1 && !searching && searchResults.length === 0 && !searchError && (
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

          {/* Confirm Buttons */}
          <div className="flex gap-3">
            <Button variant="secondary" icon="refresh" onClick={handleClear} fullWidth>ล้างข้อมูล</Button>
            <Button
              variant="success"
              icon="check_circle"
              onClick={handleConfirm}
              isLoading={uploading || confirming}
              disabled={!imageFile || !confirmedAmount || !selectedCustomer || !staffName.trim() || ocrProcessing || (!!receipt && !hasHN)}
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
