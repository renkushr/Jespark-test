import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
// ใช้ Service Role Key เพื่อ bypass RLS — Backend ต้องอ่าน/เขียน users ได้ (LINE login, register, getMe)
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) in server/.env');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
