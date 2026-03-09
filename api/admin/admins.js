const { createClient } = require('@supabase/supabase-js');

// Get service role key from environment (should be set in Vercel project settings)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pwcqgwpkvesoowpnomad.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('SUPABASE_ROLE_KEY is not configured');
}

// Create admin client with service role key (bypasses RLS)
const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

module.exports = async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method } = req;

  // Get all admin users
  if (method === 'GET') {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ ok: false, error: 'Service not configured' });
      }
      
      const { data, error } = await supabaseAdmin
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Don't return password_hash
      const safeData = (data || []).map(admin => ({
        ...admin,
        password_hash: undefined
      }));

      return res.status(200).json({ ok: true, data: safeData });
    } catch (error) {
      console.error('Error fetching admins:', error);
      return res.status(500).json({ ok: false, error: error.message });
    }
  }

  // Create new admin user
  if (method === 'POST') {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ ok: false, error: 'Service not configured' });
      }

      const { email, password, name, phone, role, branch_id, is_active } = req.body || {};

      if (!email || !password || !name) {
        return res.status(400).json({ ok: false, error: 'Email, password, and name are required' });
      }

      const { data, error } = await supabaseAdmin
        .from('admin_users')
        .insert({
          email,
          password_hash: password, // In production, hash this server-side
          name,
          phone: phone || null,
          role: role || 'admin',
          branch_id: branch_id || null,
          is_active: is_active !== false,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return res.status(409).json({ ok: false, error: 'An admin with this email already exists' });
        }
        throw error;
      }

      // Don't return password_hash
      const safeData = {
        ...data,
        password_hash: undefined
      };

      return res.status(201).json({ ok: true, data: safeData });
    } catch (error) {
      console.error('Error creating admin:', error);
      return res.status(500).json({ ok: false, error: error.message });
    }
  }

  // Update admin user
  if (method === 'PUT') {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ ok: false, error: 'Service not configured' });
      }

      const { id, ...updates } = req.body || {};

      if (!id) {
        return res.status(400).json({ ok: false, error: 'Admin ID is required' });
      }

      // Remove password_hash from updates if not provided, or handle separately
      delete updates.password_hash;

      const { data, error } = await supabaseAdmin
        .from('admin_users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const safeData = {
        ...data,
        password_hash: undefined
      };

      return res.status(200).json({ ok: true, data: safeData });
    } catch (error) {
      console.error('Error updating admin:', error);
      return res.status(500).json({ ok: false, error: error.message });
    }
  }

  // Delete admin user
  if (method === 'DELETE') {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ ok: false, error: 'Service not configured' });
      }

      const { id } = req.body || {};

      if (!id) {
        return res.status(400).json({ ok: false, error: 'Admin ID is required' });
      }

      const { error } = await supabaseAdmin
        .from('admin_users')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return res.status(200).json({ ok: true });
    } catch (error) {
      console.error('Error deleting admin:', error);
      return res.status(500).json({ ok: false, error: error.message });
    }
  }

  res.setHeader('Allow', 'GET, POST, PUT, DELETE, OPTIONS');
  return res.status(405).json({ ok: false, error: 'Method not allowed' });
};