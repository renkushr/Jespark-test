import supabase from './config/supabase.js';

async function fixRLS() {
  console.log('Checking RLS status on users table...\n');

  // Try to call rpc to add a policy - this requires a function to exist
  // Instead, let's check if we can use the supabase-js admin functions

  // First check what key we're using
  const { data: testData, error: testError } = await supabase
    .from('users')
    .select('id')
    .limit(1);

  console.log('Users query result:', { data: testData, error: testError?.message });

  // Check rewards (should work)
  const { data: rewardsData, error: rewardsError } = await supabase
    .from('rewards')
    .select('id')
    .limit(1);

  console.log('Rewards query result:', { data: rewardsData, error: rewardsError?.message });

  // Try using rpc to run SQL
  console.log('\nTrying to add RLS policy via rpc...');
  const { data: rpcData, error: rpcError } = await supabase.rpc('exec_sql', {
    sql: "CREATE POLICY IF NOT EXISTS \"anon_read_users\" ON public.users FOR SELECT TO anon USING (true);"
  });

  if (rpcError) {
    console.log('RPC not available:', rpcError.message);
    console.log('\n--- MANUAL FIX NEEDED ---');
    console.log('Go to Supabase Dashboard → SQL Editor and run:');
    console.log('');
    console.log('CREATE POLICY "anon_read_users" ON public.users FOR SELECT TO anon USING (true);');
    console.log('');
    console.log('OR disable RLS entirely:');
    console.log('ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;');
  } else {
    console.log('✅ RLS policy added!', rpcData);
  }
}

fixRLS();
