import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// โหลด .env จากโฟลเดอร์ server (local) — บน Vercel ใช้ env จาก Dashboard
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
// ใช้ Service Role Key เพื่อ bypass RLS — Backend ต้องอ่าน/เขียน users ได้ (LINE login, register, getMe)
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  const hint = process.env.VERCEL
    ? 'Set SUPABASE_URL and SUPABASE_SERVICE_KEY in Vercel Project → Settings → Environment Variables (Production), then Redeploy.'
    : 'Set SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) in server/.env';
  throw new Error(`Missing Supabase credentials. ${hint}`);
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
