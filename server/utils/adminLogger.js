import supabase from '../config/supabase.js';

let tableExists = null;

async function checkTable() {
  if (tableExists !== null) return tableExists;
  const { error } = await supabase.from('admin_logs').select('id').limit(1);
  tableExists = !error;
  if (error) {
    console.warn('[AdminLogger] admin_logs table not found — falling back to console. Run the migration SQL in Supabase Dashboard.');
  }
  return tableExists;
}

export async function logAdminAction(req, { action, category = 'general', targetType = null, targetId = null, details = null }) {
  const entry = {
    admin_id: req.user?.userId || null,
    admin_email: req.user?.email || 'unknown',
    action,
    category,
    target_type: targetType,
    target_id: targetId ? String(targetId) : null,
    details: details || null,
    ip_address: req.headers['x-forwarded-for'] || req.ip || null,
    user_agent: req.headers['user-agent'] || null,
  };

  try {
    const ok = await checkTable();
    if (ok) {
      const { error } = await supabase.from('admin_logs').insert(entry);
      if (error) {
        console.error('[AdminLogger] Insert failed:', error.message);
        tableExists = null;
      }
    } else {
      console.log('[AdminLogger]', JSON.stringify(entry));
    }
  } catch (err) {
    console.error('[AdminLogger] Unexpected error:', err.message);
  }
}

export function logLogin(req, { adminId, email, success, reason = null }) {
  return logAdminAction(
    { ...req, user: { userId: adminId, email } },
    {
      action: success ? 'login_success' : 'login_failed',
      category: 'auth',
      details: { success, reason },
    }
  );
}
