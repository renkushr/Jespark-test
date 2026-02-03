import express from 'express';
import supabase from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard stats (TODO: Add proper authentication in production)
router.get('/stats', async (req, res) => {
  try {
    // Get total users
    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (usersError) throw usersError;

    // Get total points
    const { data: users, error: pointsError } = await supabase
      .from('users')
      .select('points');

    if (pointsError) throw pointsError;

    const totalPoints = users.reduce((sum, user) => sum + (user.points || 0), 0);

    // Get total revenue from cashier transactions
    const { data: transactions, error: transError } = await supabase
      .from('cashier_transactions')
      .select('amount');

    if (transError) throw transError;

    const totalRevenue = transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    // Get active rewards
    const { count: activeRewards, error: rewardsError } = await supabase
      .from('rewards')
      .select('*', { count: 'exact', head: true });

    if (rewardsError) throw rewardsError;

    res.json({
      totalUsers: totalUsers || 0,
      totalPoints: totalPoints || 0,
      totalRevenue: totalRevenue || 0,
      activeRewards: activeRewards || 0
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users with pagination
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { data: users, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      users: users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        tier: user.tier,
        points: user.points,
        walletBalance: user.wallet_balance,
        memberSince: user.member_since,
        createdAt: user.created_at
      })),
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all rewards
router.get('/rewards', async (req, res) => {
  try {
    const { data: rewards, error } = await supabase
      .from('rewards')
      .select('*')
      .order('points_required', { ascending: true });

    if (error) throw error;

    res.json({
      rewards: rewards.map(reward => ({
        id: reward.id,
        name: reward.name,
        description: reward.description,
        points: reward.points_required,
        category: reward.category,
        image: reward.image,
        stock: reward.stock
      }))
    });
  } catch (error) {
    console.error('Get rewards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent transactions
router.get('/transactions/recent', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const { data: transactions, error } = await supabase
      .from('cashier_transactions')
      .select(`
        *,
        users:customer_id (name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    res.json({
      transactions: transactions.map(t => ({
        id: t.id,
        customerName: t.users?.name || 'Unknown',
        customerEmail: t.users?.email || '',
        amount: parseFloat(t.amount),
        points: t.points_earned,
        paymentMethod: t.payment_method,
        createdAt: t.created_at
      }))
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all transactions with pagination
router.get('/transactions', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { data: transactions, error, count } = await supabase
      .from('cashier_transactions')
      .select(`
        *,
        users:customer_id (name, email)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      transactions: transactions.map(t => ({
        id: t.id,
        customerName: t.users?.name || 'Unknown',
        customerEmail: t.users?.email || '',
        amount: parseFloat(t.amount),
        points: t.points_earned,
        paymentMethod: t.payment_method,
        notes: t.notes,
        createdAt: t.created_at
      })),
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get revenue chart data (last 6 months)
router.get('/analytics/revenue', async (req, res) => {
  try {
    const { data: transactions, error } = await supabase
      .from('cashier_transactions')
      .select('amount, created_at')
      .gte('created_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by month
    const monthlyRevenue = {};
    transactions.forEach(t => {
      const month = new Date(t.created_at).toLocaleDateString('en-US', { month: 'short' });
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + parseFloat(t.amount);
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const data = months.map(month => monthlyRevenue[month] || 0);

    res.json({ labels: months, data });
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user growth chart data (last 6 months)
router.get('/analytics/users', async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by month
    const monthlyUsers = {};
    users.forEach(u => {
      const month = new Date(u.created_at).toLocaleDateString('en-US', { month: 'short' });
      monthlyUsers[month] = (monthlyUsers[month] || 0) + 1;
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const data = months.map(month => monthlyUsers[month] || 0);

    res.json({ labels: months, data });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, tier, points, wallet_balance } = req.body;

    const { data, error } = await supabase
      .from('users')
      .update({
        name,
        email,
        phone,
        tier,
        points,
        wallet_balance
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'User updated successfully', user: data });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create reward
router.post('/rewards', async (req, res) => {
  try {
    const { name, description, points_required, category, image, stock } = req.body;

    const { data, error } = await supabase
      .from('rewards')
      .insert({
        name,
        description,
        points_required,
        category,
        image,
        stock
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Reward created successfully', reward: data });
  } catch (error) {
    console.error('Create reward error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update reward
router.put('/rewards/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, points_required, category, image, stock } = req.body;

    const { data, error } = await supabase
      .from('rewards')
      .update({
        name,
        description,
        points_required,
        category,
        image,
        stock
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Reward updated successfully', reward: data });
  } catch (error) {
    console.error('Update reward error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete reward
router.delete('/rewards/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('rewards')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Reward deleted successfully' });
  } catch (error) {
    console.error('Delete reward error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
