import express from 'express';
import supabase from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all settings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category } = req.query;

    let query = supabase
      .from('system_settings')
      .select('*')
      .order('category', { ascending: true })
      .order('setting_key', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    const { data: settings, error } = await query;

    if (error) throw error;

    // Group by category
    const grouped = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push({
        key: setting.setting_key,
        value: parseSettingValue(setting.setting_value, setting.setting_type),
        type: setting.setting_type,
        description: setting.description
      });
      return acc;
    }, {});

    res.json({
      settings: grouped,
      raw: settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single setting
router.get('/:key', authenticateToken, async (req, res) => {
  try {
    const { key } = req.params;

    const { data: setting, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('setting_key', key)
      .single();

    if (error) throw error;

    if (!setting) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json({
      key: setting.setting_key,
      value: parseSettingValue(setting.setting_value, setting.setting_type),
      type: setting.setting_type,
      category: setting.category,
      description: setting.description
    });
  } catch (error) {
    console.error('Get setting error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update single setting
router.put('/:key', authenticateToken, async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({ error: 'Value is required' });
    }

    // Get current setting to check type
    const { data: currentSetting, error: fetchError } = await supabase
      .from('system_settings')
      .select('*')
      .eq('setting_key', key)
      .single();

    if (fetchError || !currentSetting) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    // Validate value based on type
    const validatedValue = validateSettingValue(value, currentSetting.setting_type);
    if (validatedValue === null) {
      return res.status(400).json({ error: 'Invalid value for setting type' });
    }

    // Update setting
    const { data: updatedSetting, error: updateError } = await supabase
      .from('system_settings')
      .update({
        setting_value: validatedValue.toString(),
        updated_at: new Date().toISOString()
      })
      .eq('setting_key', key)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({
      message: 'Setting updated successfully',
      setting: {
        key: updatedSetting.setting_key,
        value: parseSettingValue(updatedSetting.setting_value, updatedSetting.setting_type),
        type: updatedSetting.setting_type
      }
    });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk update settings
router.put('/', authenticateToken, async (req, res) => {
  try {
    const { settings } = req.body;

    if (!settings || !Array.isArray(settings)) {
      return res.status(400).json({ error: 'Settings array is required' });
    }

    const results = [];
    const errors = [];

    for (const setting of settings) {
      try {
        const { key, value } = setting;

        // Get current setting
        const { data: currentSetting } = await supabase
          .from('system_settings')
          .select('*')
          .eq('setting_key', key)
          .single();

        if (!currentSetting) {
          errors.push({ key, error: 'Setting not found' });
          continue;
        }

        // Validate value
        const validatedValue = validateSettingValue(value, currentSetting.setting_type);
        if (validatedValue === null) {
          errors.push({ key, error: 'Invalid value' });
          continue;
        }

        // Update
        await supabase
          .from('system_settings')
          .update({
            setting_value: validatedValue.toString(),
            updated_at: new Date().toISOString()
          })
          .eq('setting_key', key);

        results.push({ key, value: validatedValue });
      } catch (err) {
        errors.push({ key: setting.key, error: err.message });
      }
    }

    res.json({
      message: `Updated ${results.length} settings`,
      updated: results,
      errors: errors,
      summary: {
        total: settings.length,
        successful: results.length,
        failed: errors.length
      }
    });
  } catch (error) {
    console.error('Bulk update settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset settings to default
router.post('/reset', authenticateToken, async (req, res) => {
  try {
    const { category } = req.body;

    // This would reset to default values
    // For now, we'll just return a message
    res.json({
      message: 'Reset functionality not implemented yet',
      note: 'This would reset settings to default values'
    });
  } catch (error) {
    console.error('Reset settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to parse setting value based on type
function parseSettingValue(value, type) {
  switch (type) {
    case 'number':
      return parseFloat(value);
    case 'boolean':
      return value === 'true' || value === true;
    case 'json':
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    default:
      return value;
  }
}

// Helper function to validate setting value
function validateSettingValue(value, type) {
  switch (type) {
    case 'number':
      const num = parseFloat(value);
      return isNaN(num) ? null : num;
    case 'boolean':
      if (typeof value === 'boolean') return value;
      if (value === 'true') return true;
      if (value === 'false') return false;
      return null;
    case 'json':
      if (typeof value === 'object') return JSON.stringify(value);
      try {
        JSON.parse(value);
        return value;
      } catch {
        return null;
      }
    default:
      return value;
  }
}

export default router;
