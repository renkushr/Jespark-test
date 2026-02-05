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

// ==================== REPORTS ENDPOINTS ====================

// Sales Report
router.get('/reports/sales', async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const end = endDate || new Date().toISOString();

    const { data: transactions, error } = await supabase
      .from('cashier_transactions')
      .select('*')
      .gte('created_at', start)
      .lte('created_at', end)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by day/week/month
    const grouped = {};
    transactions.forEach(t => {
      const date = new Date(t.created_at);
      let key;
      
      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        const firstDay = new Date(date.getFullYear(), 0, 1);
        const days = Math.floor((date - firstDay) / (24 * 60 * 60 * 1000));
        key = `Week ${Math.ceil((days + 1) / 7)}`;
      } else if (groupBy === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!grouped[key]) {
        grouped[key] = {
          date: key,
          totalSales: 0,
          totalTransactions: 0,
          totalPoints: 0
        };
      }

      grouped[key].totalSales += parseFloat(t.amount || 0);
      grouped[key].totalTransactions += 1;
      grouped[key].totalPoints += parseInt(t.points_earned || 0);
    });

    const data = Object.values(grouped);
    const totalTransactions = data.reduce((sum, d) => sum + d.totalTransactions, 0);
    
    const summary = {
      totalSales: data.reduce((sum, d) => sum + d.totalSales, 0),
      totalTransactions: totalTransactions,
      totalPoints: data.reduce((sum, d) => sum + d.totalPoints, 0),
      averageSale: totalTransactions > 0 
        ? data.reduce((sum, d) => sum + d.totalSales, 0) / totalTransactions
        : 0
    };

    res.json({
      summary,
      data,
      period: { startDate: start, endDate: end, groupBy }
    });
  } catch (error) {
    console.error('Get sales report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Members Report
router.get('/reports/members', async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const end = endDate || new Date().toISOString();

    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .gte('created_at', start)
      .lte('created_at', end)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by day/week/month
    const grouped = {};
    users.forEach(u => {
      const date = new Date(u.created_at);
      let key;
      
      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        const firstDay = new Date(date.getFullYear(), 0, 1);
        const days = Math.floor((date - firstDay) / (24 * 60 * 60 * 1000));
        key = `Week ${Math.ceil((days + 1) / 7)}`;
      } else if (groupBy === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!grouped[key]) {
        grouped[key] = {
          date: key,
          newMembers: 0,
          byTier: { Member: 0, Silver: 0, Gold: 0, Platinum: 0 }
        };
      }

      grouped[key].newMembers += 1;
      grouped[key].byTier[u.tier || 'Member'] += 1;
    });

    const data = Object.values(grouped);
    
    // Get current tier distribution
    const { data: allUsers } = await supabase
      .from('users')
      .select('tier');
    
    const tierDistribution = {
      Member: 0,
      Silver: 0,
      Gold: 0,
      Platinum: 0
    };
    
    if (allUsers) {
      allUsers.forEach(u => {
        tierDistribution[u.tier || 'Member'] += 1;
      });
    }

    res.json({
      summary: {
        totalNewMembers: data.reduce((sum, d) => sum + d.newMembers, 0),
        currentTierDistribution: tierDistribution
      },
      data,
      period: { startDate: start, endDate: end, groupBy }
    });
  } catch (error) {
    console.error('Get members report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Points Report
router.get('/reports/points', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const end = endDate || new Date().toISOString();

    // Get points given from cashier transactions
    const { data: transactions, error: transError } = await supabase
      .from('cashier_transactions')
      .select('points_earned')
      .gte('created_at', start)
      .lte('created_at', end);

    if (transError) throw transError;

    const pointsGiven = transactions.reduce((sum, t) => sum + (parseInt(t.points_earned) || 0), 0);

    // Get points used from redemptions
    const { data: redemptions, error: redeemError } = await supabase
      .from('redemptions')
      .select('points_used')
      .gte('created_at', start)
      .lte('created_at', end);

    if (redeemError) throw redeemError;

    const pointsUsed = redemptions.reduce((sum, r) => sum + (parseInt(r.points_used) || 0), 0);

    // Get top customers by points
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, points')
      .order('points', { ascending: false })
      .limit(10);

    if (usersError) throw usersError;

    res.json({
      summary: {
        totalPointsGiven: pointsGiven,
        totalPointsUsed: pointsUsed,
        netPoints: pointsGiven - pointsUsed
      },
      topCustomers: users || [],
      period: { startDate: start, endDate: end }
    });
  } catch (error) {
    console.error('Get points report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Redemptions Report
router.get('/reports/redemptions', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const end = endDate || new Date().toISOString();

    const { data: redemptions, error } = await supabase
      .from('redemptions')
      .select(`
        *,
        rewards:reward_id (name, points_required),
        users:user_id (name, email)
      `)
      .gte('created_at', start)
      .lte('created_at', end);

    if (error) throw error;

    // Group by reward
    const byReward = {};
    redemptions.forEach(r => {
      const rewardName = r.rewards?.name || 'Unknown';
      if (!byReward[rewardName]) {
        byReward[rewardName] = {
          name: rewardName,
          count: 0,
          totalPoints: 0
        };
      }
      byReward[rewardName].count += 1;
      byReward[rewardName].totalPoints += r.points_used || 0;
    });

    const popularRewards = Object.values(byReward)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.json({
      summary: {
        totalRedemptions: redemptions.length,
        totalPointsUsed: redemptions.reduce((sum, r) => sum + (r.points_used || 0), 0)
      },
      popularRewards,
      recentRedemptions: redemptions.slice(0, 20),
      period: { startDate: start, endDate: end }
    });
  } catch (error) {
    console.error('Get redemptions report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== END REPORTS ENDPOINTS ====================

// ==================== POINTS MANAGEMENT ENDPOINTS ====================

// Deduct Points
router.post('/points/deduct', async (req, res) => {
  try {
    const { userId, points, reason } = req.body;

    if (!userId || !points || points <= 0) {
      return res.status(400).json({ error: 'Valid userId and points required' });
    }

    // Get current user points
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('points, name')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.points < points) {
      return res.status(400).json({ error: 'Insufficient points' });
    }

    // Deduct points
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ points: user.points - points })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Record in points history
    await supabase
      .from('points_history')
      .insert({
        user_id: userId,
        points: -points,
        type: 'deducted',
        description: reason || 'Points deducted by admin'
      });

    res.json({
      message: 'Points deducted successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        points: updatedUser.points
      },
      deducted: points
    });
  } catch (error) {
    console.error('Deduct points error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk Add Points
router.post('/points/bulk-add', async (req, res) => {
  try {
    const { userIds, points, description } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0 || !points || points <= 0) {
      return res.status(400).json({ error: 'Valid userIds array and points required' });
    }

    const results = [];
    const errors = [];

    for (const userId of userIds) {
      try {
        // Get current points
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('points, name')
          .eq('id', userId)
          .single();

        if (userError || !user) {
          errors.push({ userId, error: 'User not found' });
          continue;
        }

        // Add points
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({ points: user.points + points })
          .eq('id', userId)
          .select()
          .single();

        if (updateError) {
          errors.push({ userId, error: 'Failed to update' });
          continue;
        }

        // Record in history
        await supabase
          .from('points_history')
          .insert({
            user_id: userId,
            points: points,
            type: 'added',
            description: description || 'Bulk points addition by admin'
          });

        results.push({
          userId,
          name: updatedUser.name,
          newPoints: updatedUser.points
        });
      } catch (err) {
        errors.push({ userId, error: 'Processing error' });
      }
    }

    res.json({
      message: `Points added to ${results.length} users`,
      success: results,
      failed: errors,
      summary: {
        total: userIds.length,
        successful: results.length,
        failed: errors.length
      }
    });
  } catch (error) {
    console.error('Bulk add points error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Expiring Points
router.get('/points/expiring', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(days));

    const { data: expiringPoints, error } = await supabase
      .from('points_history')
      .select(`
        *,
        users:user_id (id, name, email, points)
      `)
      .eq('type', 'earned')
      .not('expires_at', 'is', null)
      .lte('expires_at', expiryDate.toISOString())
      .gte('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: true });

    if (error) throw error;

    const summary = {
      totalUsers: new Set(expiringPoints.map(p => p.user_id)).size,
      totalPoints: expiringPoints.reduce((sum, p) => sum + (p.points || 0), 0),
      expiringIn: parseInt(days)
    };

    res.json({
      summary,
      expiringPoints: expiringPoints.map(p => ({
        id: p.id,
        userId: p.user_id,
        userName: p.users?.name,
        userEmail: p.users?.email,
        points: p.points,
        expiresAt: p.expires_at,
        daysLeft: Math.ceil((new Date(p.expires_at) - new Date()) / (1000 * 60 * 60 * 24)),
        description: p.description
      }))
    });
  } catch (error) {
    console.error('Get expiring points error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update Points Expiry
router.put('/points/expiry/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { expiresAt } = req.body;

    if (!expiresAt) {
      return res.status(400).json({ error: 'expiresAt date required' });
    }

    const { data, error } = await supabase
      .from('points_history')
      .update({ expires_at: expiresAt })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: 'Points expiry updated successfully',
      pointsHistory: data
    });
  } catch (error) {
    console.error('Update points expiry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export Points History
router.get('/points/export', async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;

    let query = supabase
      .from('points_history')
      .select(`
        *,
        users:user_id (name, email)
      `)
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data: history, error } = await query;

    if (error) throw error;

    if (format === 'csv') {
      // Generate CSV
      const csv = [
        'Date,User,Email,Type,Points,Description',
        ...history.map(h => 
          `${new Date(h.created_at).toISOString()},${h.users?.name || ''},${h.users?.email || ''},${h.type},${h.points},"${h.description}"`
        )
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=points-history.csv');
      return res.send(csv);
    }

    // Default JSON format
    res.json({
      total: history.length,
      data: history.map(h => ({
        date: h.created_at,
        userId: h.user_id,
        userName: h.users?.name,
        userEmail: h.users?.email,
        type: h.type,
        points: h.points,
        description: h.description
      }))
    });
  } catch (error) {
    console.error('Export points history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Points History (existing endpoint enhanced)
router.get('/points/history', async (req, res) => {
  try {
    const { limit = 50, offset = 0, userId, type } = req.query;

    let query = supabase
      .from('points_history')
      .select(`
        *,
        users:user_id (name, email)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (type) {
      query = query.eq('type', type);
    }

    query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    const { data: history, error, count } = await query;

    if (error) throw error;

    res.json({
      history: history.map(h => ({
        id: h.id,
        user_id: h.user_id,
        points: h.points,
        type: h.type,
        description: h.description,
        created_at: h.created_at,
        expires_at: h.expires_at,
        user: h.users ? {
          name: h.users.name,
          email: h.users.email
        } : null
      })),
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get points history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== END POINTS MANAGEMENT ENDPOINTS ====================

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
