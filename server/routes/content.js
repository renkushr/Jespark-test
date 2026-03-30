import express from 'express';
import supabase from '../config/supabase.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { logAdminAction } from '../utils/adminLogger.js';
import multer from 'multer';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, GIF images are allowed'), false);
    }
  }
});

const SIZE_SPECS = {
  banners: { width: 1200, height: 480, ratio: '5:2', desc: 'Banner หน้าแรก (แนะนำ 1200×480px, อัตราส่วน 5:2)' },
  brands:  { width: 200, height: 200, ratio: '1:1', desc: 'โลโก้แบรนด์ วงกลม (แนะนำ 200×200px, 1:1)' },
  deals:   { width: 560, height: 315, ratio: '16:9', desc: 'รูปดีล/โปรโมชัน (แนะนำ 560×315px, 16:9)' },
};

async function uploadToStorage(file, folder) {
  const ext = file.mimetype.split('/')[1] === 'jpeg' ? 'jpg' : file.mimetype.split('/')[1];
  const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('content')
    .upload(fileName, file.buffer, { contentType: file.mimetype, upsert: false });

  if (uploadError && (uploadError.message?.includes('not found') || uploadError.statusCode === 404)) {
    await supabase.storage.createBucket('content', { public: true, fileSizeLimit: 5242880 });
    const { error: retryError } = await supabase.storage
      .from('content')
      .upload(fileName, file.buffer, { contentType: file.mimetype, upsert: false });
    if (retryError) throw retryError;
  } else if (uploadError) {
    throw uploadError;
  }

  const { data: urlData } = supabase.storage.from('content').getPublicUrl(fileName);
  return urlData.publicUrl;
}

// ─── PUBLIC ENDPOINTS ──────────────────────────────────────

router.get('/banners', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    res.json({ banners: data || [] });
  } catch (err) {
    console.error('Get banners error:', err);
    res.json({ banners: [] });
  }
});

router.get('/brands', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('brand_icons')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    res.json({ brands: data || [] });
  } catch (err) {
    console.error('Get brands error:', err);
    res.json({ brands: [] });
  }
});

router.get('/deals', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    res.json({ deals: data || [] });
  } catch (err) {
    console.error('Get deals error:', err);
    res.json({ deals: [] });
  }
});

router.get('/size-specs', (req, res) => {
  res.json(SIZE_SPECS);
});

// ─── ADMIN: IMAGE UPLOAD ───────────────────────────────────

router.post('/upload/:type', authenticateAdmin, upload.single('image'), async (req, res) => {
  try {
    const { type } = req.params;
    if (!['banners', 'brands', 'deals'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type. Use: banners, brands, deals' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imageUrl = await uploadToStorage(req.file, type);
    const spec = SIZE_SPECS[type];

    res.json({ imageUrl, spec });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed: ' + (err.message || 'Unknown error') });
  }
});

// ─── ADMIN: BANNERS CRUD ───────────────────────────────────

router.get('/admin/banners', authenticateAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    res.json({ banners: data || [], spec: SIZE_SPECS.banners });
  } catch (err) {
    console.error('Admin get banners error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/banners', authenticateAdmin, async (req, res) => {
  try {
    const { title, subtitle, image_url, button_text, link_type, gradient_color, sort_order, is_active } = req.body;
    if (!title || !image_url) {
      return res.status(400).json({ error: 'title and image_url are required' });
    }

    const { data, error } = await supabase
      .from('banners')
      .insert({
        title,
        subtitle: subtitle || '',
        image_url,
        button_text: button_text || 'ดูรายละเอียด',
        link_type: link_type || 'rewards',
        gradient_color: gradient_color || 'from-dark-green/90 to-transparent',
        sort_order: sort_order || 0,
        is_active: is_active !== false,
      })
      .select()
      .single();
    if (error) throw error;

    logAdminAction(req, 'create_banner', 'content', { bannerId: data.id, title });
    res.status(201).json({ banner: data });
  } catch (err) {
    console.error('Create banner error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/admin/banners/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {};
    const fields = ['title', 'subtitle', 'image_url', 'button_text', 'link_type', 'gradient_color', 'sort_order', 'is_active'];
    fields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const { data, error } = await supabase
      .from('banners')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    logAdminAction(req, 'update_banner', 'content', { bannerId: id, updates });
    res.json({ banner: data });
  } catch (err) {
    console.error('Update banner error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/admin/banners/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('banners').delete().eq('id', id);
    if (error) throw error;

    logAdminAction(req, 'delete_banner', 'content', { bannerId: id });
    res.json({ message: 'Banner deleted' });
  } catch (err) {
    console.error('Delete banner error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── ADMIN: BRAND ICONS CRUD ───────────────────────────────

router.get('/admin/brands', authenticateAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('brand_icons')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    res.json({ brands: data || [], spec: SIZE_SPECS.brands });
  } catch (err) {
    console.error('Admin get brands error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/brands', authenticateAdmin, async (req, res) => {
  try {
    const { name, logo_url, link_url, sort_order, is_active } = req.body;
    if (!name || !logo_url) {
      return res.status(400).json({ error: 'name and logo_url are required' });
    }

    const { data, error } = await supabase
      .from('brand_icons')
      .insert({
        name,
        logo_url,
        link_url: link_url || '/rewards',
        sort_order: sort_order || 0,
        is_active: is_active !== false,
      })
      .select()
      .single();
    if (error) throw error;

    logAdminAction(req, 'create_brand', 'content', { brandId: data.id, name });
    res.status(201).json({ brand: data });
  } catch (err) {
    console.error('Create brand error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/admin/brands/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {};
    const fields = ['name', 'logo_url', 'link_url', 'sort_order', 'is_active'];
    fields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const { data, error } = await supabase
      .from('brand_icons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    logAdminAction(req, 'update_brand', 'content', { brandId: id, updates });
    res.json({ brand: data });
  } catch (err) {
    console.error('Update brand error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/admin/brands/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('brand_icons').delete().eq('id', id);
    if (error) throw error;

    logAdminAction(req, 'delete_brand', 'content', { brandId: id });
    res.json({ message: 'Brand deleted' });
  } catch (err) {
    console.error('Delete brand error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── ADMIN: DEALS CRUD ────────────────────────────────────

router.get('/admin/deals', authenticateAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    res.json({ deals: data || [], spec: SIZE_SPECS.deals });
  } catch (err) {
    console.error('Admin get deals error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/deals', authenticateAdmin, async (req, res) => {
  try {
    const { title, subtitle, tag, image_url, link_url, sort_order, is_active } = req.body;
    if (!title || !image_url) {
      return res.status(400).json({ error: 'title and image_url are required' });
    }

    const { data, error } = await supabase
      .from('deals')
      .insert({
        title,
        subtitle: subtitle || '',
        tag: tag || '',
        image_url,
        link_url: link_url || '/rewards',
        sort_order: sort_order || 0,
        is_active: is_active !== false,
      })
      .select()
      .single();
    if (error) throw error;

    logAdminAction(req, 'create_deal', 'content', { dealId: data.id, title });
    res.status(201).json({ deal: data });
  } catch (err) {
    console.error('Create deal error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/admin/deals/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {};
    const fields = ['title', 'subtitle', 'tag', 'image_url', 'link_url', 'sort_order', 'is_active'];
    fields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const { data, error } = await supabase
      .from('deals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    logAdminAction(req, 'update_deal', 'content', { dealId: id, updates });
    res.json({ deal: data });
  } catch (err) {
    console.error('Update deal error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/admin/deals/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('deals').delete().eq('id', id);
    if (error) throw error;

    logAdminAction(req, 'delete_deal', 'content', { dealId: id });
    res.json({ message: 'Deal deleted' });
  } catch (err) {
    console.error('Delete deal error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
