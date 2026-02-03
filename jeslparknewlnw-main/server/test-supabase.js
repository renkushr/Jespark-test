import supabase from './config/supabase.js';

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');

  try {
    // Test 1: Query rewards
    console.log('1️⃣ Testing rewards table...');
    const { data: rewards, error: rewardsError } = await supabase
      .from('rewards')
      .select('*')
      .limit(3);

    if (rewardsError) throw rewardsError;
    console.log('✅ Rewards:', rewards.length, 'items');
    console.log('   Sample:', rewards[0]?.name);

    // Test 2: Query stores
    console.log('\n2️⃣ Testing stores table...');
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('*')
      .limit(3);

    if (storesError) throw storesError;
    console.log('✅ Stores:', stores.length, 'items');
    console.log('   Sample:', stores[0]?.name);

    // Test 3: Count users
    console.log('\n3️⃣ Testing users table...');
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;
    console.log('✅ Users:', count, 'users');

    console.log('\n🎉 Supabase connection successful!');
    console.log('✅ All tables are working correctly');
    
  } catch (error) {
    console.error('\n❌ Supabase connection failed:');
    console.error('Error:', error.message);
    console.error('\nPlease check:');
    console.error('1. SUPABASE_URL is correct in .env');
    console.error('2. SUPABASE_ANON_KEY is correct in .env');
    console.error('3. SQL schema was run successfully');
  }
}

testConnection();
