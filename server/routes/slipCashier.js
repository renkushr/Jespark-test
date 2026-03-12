import express from 'express';
import supabase from '../config/supabase.js';
import multer from 'multer';

const router = express.Router();

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
    const { slipImageUrl, ocrAmount, confirmedAmount, customerId, customerName, staffName, note } = req.body;

    if (!slipImageUrl || !confirmedAmount || !customerId || !staffName) {
      return res.status(400).json({ error: 'Missing required fields: slipImageUrl, confirmedAmount, customerId, staffName' });
    }

    const amount = parseFloat(confirmedAmount);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Calculate points: every 35 baht = 5 points
    const pointsEarned = Math.floor(amount / 35) * 5;

    // Insert slip transaction
    const { data: slipTx, error: insertError } = await supabase
      .from('slip_transactions')
      .insert({
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
      })
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
    if (!q || q.length < 2) {
      return res.json({ customers: [] });
    }

    const { data, error } = await supabase
      .from('users')
      .select('id, name, display_name, email, phone, member_id, tier, points')
      .or(`name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%,member_id.ilike.%${q}%,display_name.ilike.%${q}%`)
      .limit(10);

    if (error) throw error;

    res.json({
      customers: (data || []).map(u => ({
        id: u.id,
        name: u.display_name || u.name || 'ไม่ระบุชื่อ',
        email: u.email,
        phone: u.phone,
        memberId: u.member_id,
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
