import express from 'express';
import supabase from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { redemptionLimiter } from '../middleware/rateLimiter.js';
import { redeemValidator, idParamValidator } from '../middleware/validator.js';

const router = express.Router();

// Get all rewards
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = supabase
      .from('rewards')
      .select('*')
      .eq('is_active', true);

    if (category) {
      query = query.eq('category', category);
    }

    const { data: rewards, error } = await query;

    if (error) throw error;

    res.json({
      rewards: rewards.map(r => ({
        id: r.id,
        title: r.name,
        description: r.description,
        points: r.points_required,
        category: r.category,
        image: r.image_url,
        stock: r.stock
      }))
    });
  } catch (error) {
    console.error('Get rewards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get reward by ID
router.get('/:id', idParamValidator, async (req, res) => {
  try {
    const { data: reward, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('id', parseInt(req.params.id))
      .single();

    if (error || !reward) {
      return res.status(404).json({ error: 'Reward not found' });
    }

    res.json({
      id: reward.id,
      title: reward.name,
      description: reward.description,
      points: reward.points_required,
      category: reward.category,
      image: reward.image_url,
      stock: reward.stock
    });
  } catch (error) {
    console.error('Get reward error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Redeem reward
router.post('/redeem', authenticateToken, redemptionLimiter, redeemValidator, async (req, res) => {
  try {
    const { rewardId } = req.body;

    if (!rewardId) {
      return res.status(400).json({ error: 'Reward ID required' });
    }

    // Get reward
    const { data: reward, error: rewardError } = await supabase
      .from('rewards')
      .select('*')
      .eq('id', parseInt(rewardId))
      .single();

    if (rewardError || !reward) {
      return res.status(404).json({ error: 'Reward not found' });
    }

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('points')
      .eq('id', req.user.userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.points < reward.points_required) {
      return res.status(400).json({ error: 'Insufficient points' });
    }

    if (reward.stock === 0) {
      return res.status(400).json({ error: 'Reward out of stock' });
    }

    // Update user points
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ points: user.points - reward.points_required })
      .eq('id', req.user.userId)
      .select('points')
      .single();

    if (updateError) throw updateError;

    // Update reward stock
    if (reward.stock > 0) {
      await supabase
        .from('rewards')
        .update({ stock: reward.stock - 1 })
        .eq('id', parseInt(rewardId));
    }

    // Create redemption
    const { data: redemption, error: redemptionError } = await supabase
      .from('redemptions')
      .insert({
        user_id: req.user.userId,
        reward_id: parseInt(rewardId),
        points_used: reward.points_required,
        status: 'pending'
      })
      .select()
      .single();

    if (redemptionError) throw redemptionError;

    // Create points history
    await supabase
      .from('points_history')
      .insert({
        user_id: req.user.userId,
        points: -reward.points_required,
        type: 'spent',
        description: `แลกของรางวัล: ${reward.name}`,
        reference_id: redemption.id,
        reference_type: 'redemption'
      });

    // Create notification
    await supabase
      .from('notifications')
      .insert({
        user_id: req.user.userId,
        title: 'แลกของรางวัลสำเร็จ',
        message: `คุณได้แลก ${reward.name} เรียบร้อยแล้ว`,
        type: 'success'
      });

    res.json({
      message: 'Reward redeemed successfully',
      redemptionId: redemption.id,
      remainingPoints: updatedUser.points
    });
  } catch (error) {
    console.error('Redeem reward error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user redemptions
router.get('/user/redemptions', authenticateToken, async (req, res) => {
  try {
    const { data: redemptions, error } = await supabase
      .from('redemptions')
      .select(`
        *,
        rewards (*)
      `)
      .eq('user_id', req.user.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      redemptions: redemptions.map(r => ({
        id: r.id,
        rewardId: r.reward_id,
        pointsUsed: r.points_used,
        status: r.status,
        createdAt: r.created_at,
        reward: r.rewards ? {
          title: r.rewards.name,
          description: r.rewards.description,
          image: r.rewards.image_url,
          category: r.rewards.category
        } : null
      }))
    });
  } catch (error) {
    console.error('Get redemptions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
