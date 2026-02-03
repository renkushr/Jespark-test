import express from 'express';
import supabase from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { transactionLimiter } from '../middleware/rateLimiter.js';
import { topupValidator, paymentValidator, paginationValidator } from '../middleware/validator.js';

const router = express.Router();

// Get wallet balance
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('wallet_balance')
      .eq('id', req.user.userId)
      .single();
    
    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ balance: user.wallet_balance });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Top up wallet
router.post('/topup', authenticateToken, transactionLimiter, topupValidator, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount required' });
    }

    // Get current balance
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('wallet_balance')
      .eq('id', req.user.userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update balance
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ wallet_balance: user.wallet_balance + amount })
      .eq('id', req.user.userId)
      .select('wallet_balance')
      .single();

    if (updateError) throw updateError;

    // Create transaction record
    await supabase
      .from('transactions')
      .insert({
        user_id: req.user.userId,
        type: 'topup',
        amount: amount,
        description: `เติมเงิน ฿${amount.toFixed(2)}`,
        status: 'completed'
      });

    res.json({
      message: 'Top-up successful',
      balance: updatedUser.wallet_balance
    });
  } catch (error) {
    console.error('Top-up error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Make payment
router.post('/payment', authenticateToken, transactionLimiter, paymentValidator, async (req, res) => {
  try {
    const { amount, title, subtitle } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount required' });
    }

    // Get current user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('wallet_balance, points')
      .eq('id', req.user.userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.wallet_balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const earnedPoints = Math.floor(amount * 0.1);
    
    // Update balance and points
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ 
        wallet_balance: user.wallet_balance - amount,
        points: user.points + earnedPoints
      })
      .eq('id', req.user.userId)
      .select('wallet_balance, points')
      .single();

    if (updateError) throw updateError;

    // Create transaction record
    await supabase
      .from('transactions')
      .insert({
        user_id: req.user.userId,
        type: 'payment',
        amount: amount,
        description: title || `ชำระเงิน ฿${amount.toFixed(2)}`,
        status: 'completed'
      });

    // Create points history
    await supabase
      .from('points_history')
      .insert({
        user_id: req.user.userId,
        points: earnedPoints,
        type: 'earned',
        description: `รับคะแนนจากการชำระเงิน`
      });

    res.json({
      message: 'Payment successful',
      balance: updatedUser.wallet_balance,
      earnedPoints: earnedPoints,
      totalPoints: updatedUser.points
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get transactions
router.get('/transactions', authenticateToken, paginationValidator, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', req.user.userId)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) throw error;

    res.json({
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        description: t.description,
        status: t.status,
        date: new Date(t.created_at).toLocaleDateString('th-TH'),
        time: new Date(t.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        created_at: t.created_at
      }))
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
