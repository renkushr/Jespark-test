import express from 'express';
import supabase from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.user.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      notifications: notifications.map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        isRead: n.is_read,
        time: new Date(n.created_at).toLocaleString('th-TH')
      }))
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { data: notification, error: findError } = await supabase
      .from('notifications')
      .select('id')
      .eq('id', parseInt(req.params.id))
      .eq('user_id', req.user.userId)
      .single();
    
    if (findError || !notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const { error: updateError } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', parseInt(req.params.id));

    if (updateError) throw updateError;

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark all as read
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', req.user.userId)
      .eq('is_read', false);
    
    if (error) throw error;
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
