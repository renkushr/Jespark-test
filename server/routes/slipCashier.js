import express from 'express';
import supabase from '../config/supabase.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { logAdminAction } from '../utils/adminLogger.js';
import multer from 'multer';

const router = express.Router();

router.use(authenticateAdmin);

// Multer config: store in memory for upload to Supabase Storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// ============================================================
// POST /slip-cashier/upload — Upload slip image to Supabase Storage
// ============================================================
router.post('/upload', upload.single('slip'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const fileName = `slip_${Date.now()}_${Math.random().toString(36).substring(7)}.${req.file.mimetype.split('/')[1]}`;
    const filePath = `slips/${fileName}`;

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from('slips')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      // If bucket doesn't exist, try to create it
      if (uploadError.message?.includes('not found') || uploadError.statusCode === 404) {
        // Create the bucket
        const { error: bucketError } = await supabase.storage.createBucket('slips', {
          public: true,
          fileSizeLimit: 10485760 // 10MB
        });
        if (bucketError && !bucketError.message?.includes('already exists')) {
          throw bucketError;
        }
        // Retry upload
        const { data: retryData, error: retryError } = await supabase.storage
          .from('slips')
          .upload(filePath, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: false
          });
        if (retryError) throw retryError;
      } else {
        throw uploadError;
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from('slips').getPublicUrl(filePath);

    res.json({
      imageUrl: urlData.publicUrl,
      fileName
    });
  } catch (error) {
    console.error('Slip upload error:', error);
    res.status(500).json({ error: 'Failed to upload slip image' });
  }
});

// ============================================================
// POST /slip-cashier/confirm — Confirm slip transaction
// ============================================================
router.post('/confirm', async (req, res) => {
  try {
    const { slipImageUrl, ocrAmount, confirmedAmount, customerId, customerName, staffName, note, receiptNo, hnNumber, receiptDate, flags } = req.body;

    if (!slipImageUrl || !confirmedAmount || !customerId || !staffName) {
      return res.status(400).json({ error: 'Missing required fields: slipImageUrl, confirmedAmount, customerId, staffName' });
    }

    const amount = parseFloat(confirmedAmount);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // --- Duplicate receipt check ---
    if (receiptNo) {
      const { data: existing } = await supabase
        .from('slip_transactions')
        .select('id, confirmed_at, customer_name')
        .eq('receipt_no', receiptNo)
        .limit(1);

      if (existing && existing.length > 0) {
        const prev = existing[0];
        const prevDate = prev.confirmed_at ? new Date(prev.confirmed_at).toLocaleString('th-TH') : '';
        return res.status(409).json({
          error: `ใบเสร็จเลขที่ ${receiptNo} ถูกใช้ไปแล้ว${prevDate ? ' เมื่อ ' + prevDate : ''}${prev.customer_name ? ' (ลูกค้า: ' + prev.customer_name + ')' : ''}`
        });
      }
    }

    // --- Date validation ---
    if (receiptDate) {
      const thaiMonths = { 'มกราคม':0,'กุมภาพันธ์':1,'มีนาคม':2,'เมษายน':3,'พฤษภาคม':4,'มิถุนายน':5,'กรกฎาคม':6,'สิงหาคม':7,'กันยายน':8,'ตุลาคม':9,'พฤศจิกายน':10,'ธันวาคม':11 };
      let parsedDate = null;

      // Try Thai date: "30 มกราคม 2569 16:42:37 น."
      const thaiMatch = receiptDate.match(/(\d{1,2})\s+(มกราคม|กุมภาพันธ์|มีนาคม|เมษายน|พฤษภาคม|มิถุนายน|กรกฎาคม|สิงหาคม|กันยายน|ตุลาคม|พฤศจิกายน|ธันวาคม)\s+(\d{4})/);
      if (thaiMatch) {
        const day = parseInt(thaiMatch[1]);
        const month = thaiMonths[thaiMatch[2]];
        let year = parseInt(thaiMatch[3]);
        if (year > 2500) year -= 543; // Convert Buddhist year
        parsedDate = new Date(year, month, day);
      }

      // Try numeric date: "30/01/2569" or "30-01-69"
      if (!parsedDate) {
        const numMatch = receiptDate.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/);
        if (numMatch) {
          const day = parseInt(numMatch[1]);
          const month = parseInt(numMatch[2]) - 1;
          let year = parseInt(numMatch[3]);
          if (year > 2500) year -= 543;
          if (year < 100) year += 2000;
          parsedDate = new Date(year, month, day);
        }
      }

      if (parsedDate && !isNaN(parsedDate.getTime())) {
        const daysDiff = Math.floor((Date.now() - parsedDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff > 30) {
          return res.status(400).json({ error: `ใบเสร็จหมดอายุ — วันที่ใบเสร็จเก่ากว่า 30 วัน (${receiptDate})` });
        }
      }
    }

    // Calculate points: every 35 baht = 5 points
    const pointsEarned = Math.floor(amount / 35) * 5;

    // Build insert data
    const insertData = {
      slip_image_url: slipImageUrl,
      ocr_amount: ocrAmount ? parseFloat(ocrAmount) : null,
      confirmed_amount: amount,
      points_earned: pointsEarned,
      customer_id: parseInt(customerId),
      customer_name: customerName || null,
      staff_name: staffName,
      status: 'confirmed',
      note: note || null,
      confirmed_at: new Date().toISOString()
    };

    // Add new columns if they exist (graceful)
    if (receiptNo) insertData.receipt_no = receiptNo;
    if (hnNumber) insertData.hn_number = hnNumber;
    if (flags && flags.length > 0) insertData.flags = flags;

    // Insert slip transaction
    const { data: slipTx, error: insertError } = await supabase
      .from('slip_transactions')
      .insert(insertData)
      .select()
      .single();

    if (insertError) throw insertError;

    // Add points to customer
    if (pointsEarned > 0) {
      // Get current points
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('points')
        .eq('id', parseInt(customerId))
        .single();

      if (!userError && user) {
        const newPoints = (user.points || 0) + pointsEarned;
        await supabase
          .from('users')
          .update({ points: newPoints })
          .eq('id', parseInt(customerId));

        // Add points history
        await supabase
          .from('points_history')
          .insert({
            user_id: parseInt(customerId),
            points: pointsEarned,
            type: 'earned',
            description: `สแกนสลิป ฿${amount.toFixed(2)} โดย ${staffName}`,
          });
      }
    }

    if (req.user?.role === 'admin') {
      logAdminAction(req, { action: 'slip_confirm', category: 'cashier', targetType: 'user', targetId: customerId, details: { amount, pointsEarned, staffName, receiptNo: receiptNo || null, slipTxId: slipTx.id } });
    }

    res.json({
      message: 'Transaction confirmed',
      transaction: {
        id: slipTx.id,
        slipImageUrl: slipTx.slip_image_url,
        ocrAmount: slipTx.ocr_amount,
        confirmedAmount: slipTx.confirmed_amount,
        pointsEarned: slipTx.points_earned,
        customerId: slipTx.customer_id,
        customerName: slipTx.customer_name,
        staffName: slipTx.staff_name,
        status: slipTx.status,
        note: slipTx.note,
        createdAt: slipTx.created_at,
        confirmedAt: slipTx.confirmed_at
      }
    });
  } catch (error) {
    console.error('Confirm error:', error);
    res.status(500).json({ error: 'Failed to confirm transaction' });
  }
});

// ============================================================
// GET /slip-cashier/logs — Get all slip transaction logs
// ============================================================
router.get('/logs', async (req, res) => {
  try {
    const { status, staffName, customerId, dateFrom, dateTo, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from('slip_transactions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (status) query = query.eq('status', status);
    if (staffName) query = query.ilike('staff_name', `%${staffName}%`);
    if (customerId) query = query.eq('customer_id', parseInt(customerId));
    if (dateFrom) query = query.gte('created_at', dateFrom);
    if (dateTo) query = query.lte('created_at', dateTo);

    const { data: logs, error, count } = await query;

    if (error) throw error;

    res.json({
      logs: (logs || []).map(log => ({
        id: log.id,
        slipImageUrl: log.slip_image_url,
        ocrAmount: log.ocr_amount,
        confirmedAmount: log.confirmed_amount,
        pointsEarned: log.points_earned,
        customerId: log.customer_id,
        customerName: log.customer_name,
        staffName: log.staff_name,
        status: log.status,
        note: log.note,
        createdAt: log.created_at,
        confirmedAt: log.confirmed_at
      })),
      total: count || 0
    });
  } catch (error) {
    console.error('Logs error:', error);
    res.status(500).json({ error: 'Failed to load logs' });
  }
});

// ============================================================
// GET /slip-cashier/logs/:id — Get single slip transaction detail
// ============================================================
router.get('/logs/:id', async (req, res) => {
  try {
    const { data: log, error } = await supabase
      .from('slip_transactions')
      .select('*')
      .eq('id', parseInt(req.params.id))
      .single();

    if (error || !log) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({
      log: {
        id: log.id,
        slipImageUrl: log.slip_image_url,
        ocrAmount: log.ocr_amount,
        confirmedAmount: log.confirmed_amount,
        pointsEarned: log.points_earned,
        customerId: log.customer_id,
        customerName: log.customer_name,
        staffName: log.staff_name,
        status: log.status,
        note: log.note,
        createdAt: log.created_at,
        confirmedAt: log.confirmed_at
      }
    });
  } catch (error) {
    console.error('Log detail error:', error);
    res.status(500).json({ error: 'Failed to load transaction detail' });
  }
});

// ============================================================
// GET /slip-cashier/search-customer — Search customer for slip cashier
// ============================================================
router.get('/search-customer', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 1) {
      return res.json({ customers: [] });
    }

    const safeQ = q.replace(/[%,]/g, '');
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, phone, tier, points')
      .or(`name.ilike.%${safeQ}%,email.ilike.%${safeQ}%,phone.ilike.%${safeQ}%`)
      .limit(10);

    if (error) throw error;

    res.json({
      customers: (data || []).map(u => ({
        id: u.id,
        name: u.name || 'ไม่ระบุชื่อ',
        email: u.email,
        phone: u.phone,
        memberId: u.member_id || null,
        tier: u.tier,
        points: u.points
      }))
    });
  } catch (error) {
    console.error('Search customer error:', error);
    res.status(500).json({ error: 'Failed to search customer' });
  }
});

export default router;
