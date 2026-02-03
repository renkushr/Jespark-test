import express from 'express';
import supabase from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user coupons
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { data: coupons, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('user_id', req.user.userId)
      .eq('is_used', false)
      .order('expires_at');

    if (error) throw error;

    res.json({
      coupons: coupons.map(c => ({
        id: c.id,
        code: c.code,
        title: c.title,
        description: c.description,
        discountType: c.discount_type,
        discountValue: c.discount_value,
        minPurchase: c.min_purchase,
        expiryDate: c.expires_at,
        isUsed: c.is_used
      }))
    });
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Use coupon
router.post('/:id/use', authenticateToken, async (req, res) => {
  try {
    const { data: coupon, error: findError } = await supabase
      .from('coupons')
      .select('*')
      .eq('id', parseInt(req.params.id))
      .eq('user_id', req.user.userId)
      .eq('is_used', false)
      .single();

    if (findError || !coupon) {
      return res.status(404).json({ error: 'Coupon not found or already used' });
    }

    const expiryDate = new Date(coupon.expires_at);
    if (expiryDate < new Date()) {
      return res.status(400).json({ error: 'Coupon expired' });
    }

    const { error: updateError } = await supabase
      .from('coupons')
      .update({ 
        is_used: true,
        used_at: new Date().toISOString()
      })
      .eq('id', parseInt(req.params.id));

    if (updateError) throw updateError;

    res.json({
      message: 'Coupon used successfully',
      discount: {
        type: coupon.discount_type,
        value: coupon.discount_value
      }
    });
  } catch (error) {
    console.error('Use coupon error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
