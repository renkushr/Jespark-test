import express from 'express';
import supabase from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { updateProfileValidator } from '../middleware/validator.js';

const router = express.Router();

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      birthDate: user.birth_date,
      tier: user.tier,
      memberId: user.member_id,
      memberSince: user.member_since,
      points: user.points,
      walletBalance: user.wallet_balance,
      avatar: user.avatar,
      needsProfile: !user.phone || !(user.name && /^[ก-๏\s]+$/.test(user.name.trim()) && user.name.trim().includes(' '))
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/me', authenticateToken, updateProfileValidator, async (req, res) => {
  try {
    const { name, phone, birthDate } = req.body;

    // Validate Thai name: must be Thai characters only + have space (first + last name)
    const THAI_NAME_REGEX = /^[ก-๏\s]+$/;
    if (name) {
      const trimmed = name.trim();
      if (!THAI_NAME_REGEX.test(trimmed)) {
        return res.status(400).json({ error: 'ชื่อ-นามสกุลต้องเป็นภาษาไทยเท่านั้น' });
      }
      if (!trimmed.includes(' ')) {
        return res.status(400).json({ error: 'กรุณากรอกทั้งชื่อและนามสกุล' });
      }
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone;
    if (birthDate !== undefined) updateData.birth_date = birthDate;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.user.userId)
      .select()
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        birthDate: user.birth_date,
        tier: user.tier,
        memberSince: user.member_since,
        points: user.points,
        walletBalance: user.wallet_balance,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Points management is admin-only via /api/admin/points/add

export default router;
