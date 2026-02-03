import express from 'express';
import supabase from '../config/supabase.js';

const router = express.Router();

// Get all stores
router.get('/', async (req, res) => {
  try {
    const { data: stores, error } = await supabase
      .from('stores')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    res.json({
      stores: stores.map(s => ({
        id: s.id,
        name: s.name,
        address: s.address,
        phone: s.phone,
        latitude: s.latitude,
        longitude: s.longitude,
        openingHours: s.opening_hours
      }))
    });
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get store by ID
router.get('/:id', async (req, res) => {
  try {
    const { data: store, error } = await supabase
      .from('stores')
      .select('*')
      .eq('id', parseInt(req.params.id))
      .single();

    if (error || !store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    res.json({
      id: store.id,
      name: store.name,
      address: store.address,
      phone: store.phone,
      latitude: store.latitude,
      longitude: store.longitude,
      openingHours: store.opening_hours
    });
  } catch (error) {
    console.error('Get store error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
