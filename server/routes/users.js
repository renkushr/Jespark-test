import express from 'express';
import supabase from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { updateProfileValidator, addPointsValidator } from '../middleware/validator.js';

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
      memberSince: user.member_since,
      points: user.points,
      walletBalance: user.wallet_balance,
      avatar: user.avatar
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

    const updateData = {};
    if (name) updateData.name = name;
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

// Add points to user
router.post('/points/add', authenticateToken, addPointsValidator, async (req, res) => {
  try {
    const { points, title, subtitle } = req.body;

    if (!points || points <= 0) {
      return res.status(400).json({ error: 'Valid points amount required' });
    }

    // Get current user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('points')
      .eq('id', req.user.userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user points
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ points: user.points + points })
      .eq('id', req.user.userId)
      .select('points')
      .single();

    if (updateError) throw updateError;

    // Create points history
    await supabase
      .from('points_history')
      .insert({
        user_id: req.user.userId,
        points: points,
        type: 'earned',
        description: title || 'คะแนนสะสม'
      });

    res.json({
      message: 'Points added successfully',
      points: updatedUser.points
    });
  } catch (error) {
    console.error('Add points error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
