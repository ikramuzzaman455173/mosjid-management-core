import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers['x-cron-secret'];

  // 1. Verify Secret
  if (!cronSecret || authHeader !== cronSecret) {
    console.warn('Unauthorized cron attempt');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // 2. Initialize Supabase
  // Try to use service role key for admin privileges, fallback to anon key
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials missing');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const now = new Date().toISOString();
    
    // 3. Lightweight update query to keep Supabase project active
    const { error } = await supabase
      .from('app_health_checks')
      .update({
        status: 'active',
        lastCheckedAt: now,
        updatedAt: now
      })
      .eq('serviceName', 'main');

    if (error) {
      throw error;
    }

    console.log('Successfully executed Supabase keep-alive cron');
    return res.status(200).json({ success: true, message: 'Keep-alive successful' });
  } catch (error) {
    console.error('Keep-alive cron failed:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
