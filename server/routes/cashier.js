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

// ==================== ENHANCED CASHIER FEATURES ====================

// Get transaction history
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, offset = 0, customerId, startDate, endDate } = req.query;

    let query = supabase
      .from('cashier_transactions')
      .select(`
        *,
        customer:customer_id (id, name, email),
        cashier:cashier_id (id, name, email)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (customerId) {
      query = query.eq('customer_id', customerId);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    const { data: transactions, error, count } = await query;

    if (error) throw error;

    res.json({
      transactions: transactions.map(t => ({
        id: t.id,
        customerId: t.customer_id,
        customerName: t.customer?.name,
        customerEmail: t.customer?.email,
        cashierId: t.cashier_id,
        cashierName: t.cashier?.name,
        amount: t.amount,
        pointsEarned: t.points_earned,
        pointsUsed: t.points_used || 0,
        discount: t.discount || 0,
        finalAmount: t.final_amount || t.amount,
        paymentMethod: t.payment_method,
        status: t.status || 'completed',
        createdAt: t.created_at
      })),
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Checkout with points discount
router.post('/checkout-with-points', authenticateToken, transactionLimiter, async (req, res) => {
  try {
    const { customerId, amount, usePoints, paymentMethod = 'cash' } = req.body;

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

    // Validate points usage
    const pointsToUse = usePoints ? parseInt(usePoints) : 0;
    if (pointsToUse > customer.points) {
      return res.status(400).json({ error: 'Insufficient points' });
    }

    // Calculate discount (1 point = 1 baht)
    const discount = pointsToUse;
    const finalAmount = Math.max(0, amount - discount);

    // Calculate earned points (10% of final amount)
    const earnedPoints = Math.floor(finalAmount * 0.1);
    
    // Update customer points
    const newPoints = customer.points - pointsToUse + earnedPoints;
    const { data: updatedCustomer, error: updateError } = await supabase
      .from('users')
      .update({ points: newPoints })
      .eq('id', customer.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Create cashier transaction record
    const { data: transaction, error: transError } = await supabase
      .from('cashier_transactions')
      .insert({
        customer_id: customer.id,
        cashier_id: req.user.userId,
        amount: amount,
        points_earned: earnedPoints,
        points_used: pointsToUse,
        discount: discount,
        final_amount: finalAmount,
        payment_method: paymentMethod,
        status: 'completed'
      })
      .select()
      .single();

    if (transError) throw transError;

    // Create points history for earned points
    if (earnedPoints > 0) {
      await supabase
        .from('points_history')
        .insert({
          user_id: customer.id,
          points: earnedPoints,
          type: 'earned',
          description: `Purchase at Store - ฿${finalAmount.toFixed(2)}`,
          reference_type: 'cashier',
          reference_id: transaction.id
        });
    }

    // Create points history for used points
    if (pointsToUse > 0) {
      await supabase
        .from('points_history')
        .insert({
          user_id: customer.id,
          points: -pointsToUse,
          type: 'redeemed',
          description: `Used points for discount - Transaction #${transaction.id}`,
          reference_type: 'cashier',
          reference_id: transaction.id
        });
    }

    // Create notification
    await supabase
      .from('notifications')
      .insert({
        user_id: customer.id,
        title: 'Purchase Completed!',
        message: pointsToUse > 0 
          ? `You used ${pointsToUse} points and earned ${earnedPoints} points from your ฿${finalAmount.toFixed(2)} purchase`
          : `You earned ${earnedPoints} points from your ฿${amount.toFixed(2)} purchase`,
        type: 'success'
      });

    res.json({
      message: 'Checkout successful',
      transaction: {
        id: transaction.id,
        amount: amount,
        discount: discount,
        finalAmount: finalAmount,
        pointsUsed: pointsToUse,
        pointsEarned: earnedPoints,
        paymentMethod: paymentMethod,
        timestamp: transaction.created_at
      },
      customer: {
        id: updatedCustomer.id,
        name: updatedCustomer.name,
        points: updatedCustomer.points
      }
    });
  } catch (error) {
    console.error('Checkout with points error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Refund/Void transaction
router.post('/refund/:transactionId', authenticateToken, async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { reason } = req.body;

    // Get transaction
    const { data: transaction, error: transError } = await supabase
      .from('cashier_transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (transError || !transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.status === 'refunded') {
      return res.status(400).json({ error: 'Transaction already refunded' });
    }

    // Get customer
    const { data: customer, error: customerError } = await supabase
      .from('users')
      .select('*')
      .eq('id', transaction.customer_id)
      .single();

    if (customerError || !customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Calculate points adjustment
    // Remove earned points, return used points
    const pointsAdjustment = transaction.points_used - transaction.points_earned;
    const newPoints = customer.points + pointsAdjustment;

    // Update customer points
    await supabase
      .from('users')
      .update({ points: Math.max(0, newPoints) })
      .eq('id', customer.id);

    // Update transaction status
    await supabase
      .from('cashier_transactions')
      .update({ 
        status: 'refunded',
        refund_reason: reason || 'Refund requested',
        refunded_at: new Date().toISOString(),
        refunded_by: req.user.userId
      })
      .eq('id', transactionId);

    // Create points history for refund
    if (transaction.points_earned > 0) {
      await supabase
        .from('points_history')
        .insert({
          user_id: customer.id,
          points: -transaction.points_earned,
          type: 'deducted',
          description: `Refund: Transaction #${transactionId}`,
          reference_type: 'refund',
          reference_id: transactionId
        });
    }

    if (transaction.points_used > 0) {
      await supabase
        .from('points_history')
        .insert({
          user_id: customer.id,
          points: transaction.points_used,
          type: 'added',
          description: `Points returned: Transaction #${transactionId}`,
          reference_type: 'refund',
          reference_id: transactionId
        });
    }

    // Create notification
    await supabase
      .from('notifications')
      .insert({
        user_id: customer.id,
        title: 'Transaction Refunded',
        message: `Your transaction of ฿${transaction.final_amount.toFixed(2)} has been refunded`,
        type: 'info'
      });

    res.json({
      message: 'Transaction refunded successfully',
      refund: {
        transactionId: transactionId,
        amount: transaction.final_amount,
        pointsReturned: transaction.points_used,
        pointsDeducted: transaction.points_earned,
        newBalance: Math.max(0, newPoints)
      }
    });
  } catch (error) {
    console.error('Refund transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get today's summary for current cashier
router.get('/my-summary', authenticateToken, async (req, res) => {
  try {
    const cashierId = req.user.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // Get today's transactions for this cashier
    const { data: transactions, error } = await supabase
      .from('cashier_transactions')
      .select('*')
      .eq('cashier_id', cashierId)
      .gte('created_at', todayISO);

    if (error) throw error;

    const completed = transactions.filter(t => t.status === 'completed');
    const refunded = transactions.filter(t => t.status === 'refunded');

    const summary = {
      totalTransactions: transactions.length,
      completedTransactions: completed.length,
      refundedTransactions: refunded.length,
      totalRevenue: completed.reduce((sum, t) => sum + parseFloat(t.final_amount || t.amount), 0),
      totalDiscount: completed.reduce((sum, t) => sum + parseFloat(t.discount || 0), 0),
      totalPointsGiven: completed.reduce((sum, t) => sum + t.points_earned, 0),
      totalPointsUsed: completed.reduce((sum, t) => sum + (t.points_used || 0), 0),
      uniqueCustomers: new Set(completed.map(t => t.customer_id)).size,
      paymentMethods: {
        cash: completed.filter(t => t.payment_method === 'cash').length,
        card: completed.filter(t => t.payment_method === 'card').length,
        qr: completed.filter(t => t.payment_method === 'qr').length
      },
      recentTransactions: transactions
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10)
        .map(t => ({
          id: t.id,
          amount: t.final_amount || t.amount,
          pointsEarned: t.points_earned,
          status: t.status,
          createdAt: t.created_at
        }))
    };

    res.json(summary);
  } catch (error) {
    console.error('Get my summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== END ENHANCED CASHIER FEATURES ====================

export default router;
