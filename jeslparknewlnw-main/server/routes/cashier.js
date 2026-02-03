import express from 'express';
import supabase from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { transactionLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Search customer by email or phone
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    // Search by email or phone
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .or(`email.eq.${q},phone.eq.${q},email.ilike.${q}`);

    if (error) throw error;

    const user = users && users.length > 0 ? users[0] : null;

    if (!user) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        tier: user.tier,
        memberSince: user.member_since,
        points: user.points,
        walletBalance: user.wallet_balance,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Search customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cashier checkout - charge customer and give points
router.post('/checkout', authenticateToken, transactionLimiter, async (req, res) => {
  try {
    const { customerId, amount } = req.body;

    if (!customerId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid customer ID and amount required' });
    }

    // Get customer
    const { data: customer, error: customerError } = await supabase
      .from('users')
      .select('*')
      .eq('id', parseInt(customerId))
      .single();

    if (customerError || !customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Calculate earned points (10% of amount)
    const earnedPoints = Math.floor(amount * 0.1);
    
    // Update customer points
    const { data: updatedCustomer, error: updateError } = await supabase
      .from('users')
      .update({ points: customer.points + earnedPoints })
      .eq('id', customer.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Create cashier transaction record
    await supabase
      .from('cashier_transactions')
      .insert({
        customer_id: customer.id,
        cashier_id: req.user.userId,
        amount: amount,
        points_earned: earnedPoints,
        payment_method: 'cash'
      });

    // Create points history
    await supabase
      .from('points_history')
      .insert({
        user_id: customer.id,
        points: earnedPoints,
        type: 'earned',
        description: `Purchase at Store - ฿${amount.toFixed(2)}`,
        reference_type: 'cashier'
      });

    // Create notification
    await supabase
      .from('notifications')
      .insert({
        user_id: customer.id,
        title: 'Purchase Completed!',
        message: `You earned ${earnedPoints} points from your ฿${amount.toFixed(2)} purchase`,
        type: 'success'
      });

    res.json({
      message: 'Checkout successful',
      earnedPoints: earnedPoints,
      totalPoints: updatedCustomer.points,
      balance: updatedCustomer.wallet_balance,
      transaction: {
        amount: amount,
        points: earnedPoints,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get cashier statistics (optional - for dashboard)
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // Get today's cashier transactions
    const { data: todayTransactions, error: transError } = await supabase
      .from('cashier_transactions')
      .select('*')
      .gte('created_at', todayISO);

    if (transError) throw transError;

    const todayRevenue = todayTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const todayPointsGiven = todayTransactions.reduce((sum, t) => sum + t.points_earned, 0);
    const todayCustomers = new Set(todayTransactions.map(t => t.customer_id)).size;

    // Get total users count
    const { count: totalCustomers, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    res.json({
      today: {
        transactions: todayTransactions.length,
        revenue: todayRevenue,
        pointsGiven: todayPointsGiven,
        customers: todayCustomers
      },
      total: {
        customers: totalCustomers || 0
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
