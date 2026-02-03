# 🚀 Supabase Setup Guide - Jespark Rewards

## ✅ สิ่งที่ติดตั้งแล้ว

- ✅ `@supabase/supabase-js` package
- ✅ Supabase client configuration (`server/config/supabase.js`)
- ✅ Database schema (`server/supabase/schema.sql`)
- ✅ Environment variables template

---

## 📋 ขั้นตอนการ Setup Supabase

### 1. สร้าง Supabase Project

#### ไปที่ Supabase Dashboard
1. เปิด https://supabase.com
2. คลิก **"Start your project"** หรือ **"Sign In"**
3. Login ด้วย GitHub (แนะนำ) หรือ Email

#### สร้าง Project ใหม่
1. คลิก **"New Project"**
2. กรอกข้อมูล:
   - **Name**: `jespark-rewards`
   - **Database Password**: สร้างรหัสผ่านที่แข็งแรง (เก็บไว้ดีๆ!)
   - **Region**: `Southeast Asia (Singapore)` (ใกล้ไทยสุด)
   - **Pricing Plan**: `Free` (500MB database, 1GB storage)
3. คลิก **"Create new project"**
4. รอ 1-2 นาที ให้ Supabase สร้าง database

---

### 2. ดึง API Keys

#### หา API Keys
1. ไปที่ **Settings** (เกียร์ซ้ายล่าง)
2. คลิก **API**
3. คัดลอก:
   - **Project URL** (ตัวอย่าง: `https://xxxxx.supabase.co`)
   - **anon public** key (ตัวอย่าง: `eyJhbGciOiJIUzI1NiIsInR5cCI6...`)
   - **service_role** key (ตัวอย่าง: `eyJhbGciOiJIUzI1NiIsInR5cCI6...`)

#### อัปเดต .env file
```bash
# เปิดไฟล์ server/.env
# แทนที่ค่าเหล่านี้:

SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 3. สร้าง Database Tables

#### ใช้ SQL Editor
1. ไปที่ **SQL Editor** (ซ้ายมือ)
2. คลิก **"New query"**
3. คัดลอกโค้ดจากไฟล์ `server/supabase/schema.sql`
4. วางในช่อง SQL Editor
5. คลิก **"Run"** (หรือกด Ctrl+Enter)
6. รอจนเห็น **"Success. No rows returned"**

#### ตรวจสอบ Tables
1. ไปที่ **Table Editor** (ซ้ายมือ)
2. ควรเห็น tables:
   - ✅ users
   - ✅ rewards
   - ✅ transactions
   - ✅ redemptions
   - ✅ notifications
   - ✅ coupons
   - ✅ stores
   - ✅ points_history
   - ✅ cashier_transactions

---

### 4. ตั้งค่า Authentication (Optional)

#### Enable Email/Password Auth
1. ไปที่ **Authentication** > **Providers**
2. เปิด **Email** provider
3. ปิด **Confirm email** (สำหรับ development)

#### Enable LINE Login (ในอนาคต)
1. ไปที่ **Authentication** > **Providers**
2. เลือก **LINE**
3. กรอก LINE Channel ID และ Secret

---

### 5. ทดสอบการเชื่อมต่อ

#### สร้างไฟล์ทดสอบ
```javascript
// server/test-supabase.js
import supabase from './config/supabase.js';

async function testConnection() {
  try {
    // Test query
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .limit(5);

    if (error) throw error;

    console.log('✅ Supabase connected successfully!');
    console.log('📊 Sample rewards:', data);
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
  }
}

testConnection();
```

#### รันทดสอบ
```bash
cd server
node test-supabase.js
```

**ผลลัพธ์ที่ต้องการ:**
```
✅ Supabase connected successfully!
📊 Sample rewards: [
  { id: 1, name: 'Starbucks Coffee', points_required: 500, ... },
  ...
]
```

---

## 🔧 Configuration Files

### `server/config/supabase.js`
```javascript
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;
```

### `server/.env`
```bash
PORT=5000
JWT_SECRET=jespark_rewards_secret_key_2026_secure
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here
```

---

## 📊 Database Schema Overview

### Tables

#### **users** - ข้อมูลผู้ใช้
- `id` - Primary key
- `line_id` - LINE User ID (unique)
- `email` - Email (unique)
- `name` - ชื่อ
- `avatar` - รูปโปรไฟล์
- `tier` - ระดับสมาชิก (Member, Silver, Gold)
- `points` - คะแนนสะสม
- `wallet_balance` - ยอดเงินในกระเป๋า

#### **rewards** - ของรางวัล
- `id` - Primary key
- `name` - ชื่อของรางวัล
- `points_required` - คะแนนที่ต้องใช้
- `category` - หมวดหมู่
- `stock` - จำนวนคงเหลือ

#### **transactions** - ธุรกรรมการเงิน
- `id` - Primary key
- `user_id` - Foreign key to users
- `type` - ประเภท (topup, payment, refund)
- `amount` - จำนวนเงิน

#### **redemptions** - การแลกของรางวัล
- `id` - Primary key
- `user_id` - Foreign key to users
- `reward_id` - Foreign key to rewards
- `points_used` - คะแนนที่ใช้
- `status` - สถานะ (pending, approved, completed)

#### **notifications** - การแจ้งเตือน
- `id` - Primary key
- `user_id` - Foreign key to users
- `title` - หัวข้อ
- `message` - ข้อความ
- `is_read` - อ่านแล้วหรือยัง

#### **coupons** - คูปองส่วนลด
- `id` - Primary key
- `user_id` - Foreign key to users
- `code` - รหัสคูปอง
- `discount_value` - มูลค่าส่วนลด
- `is_used` - ใช้แล้วหรือยัง

#### **stores** - ร้านค้า
- `id` - Primary key
- `name` - ชื่อร้าน
- `address` - ที่อยู่
- `latitude`, `longitude` - พิกัด

#### **points_history** - ประวัติคะแนน
- `id` - Primary key
- `user_id` - Foreign key to users
- `points` - จำนวนคะแนน
- `type` - ประเภท (earned, spent, expired)

#### **cashier_transactions** - ธุรกรรมแคชเชียร์
- `id` - Primary key
- `customer_id` - Foreign key to users
- `amount` - จำนวนเงิน
- `points_earned` - คะแนนที่ได้รับ

---

## 🔐 Security Features

### Row Level Security (RLS)
- ✅ Users สามารถดูและแก้ไขข้อมูลของตัวเองเท่านั้น
- ✅ Transactions, Redemptions, Notifications มี RLS
- ✅ Rewards และ Stores เปิดให้ทุกคนดูได้

### Indexes
- ✅ สร้าง indexes สำหรับ queries ที่ใช้บ่อย
- ✅ เพิ่มความเร็วในการค้นหา

### Triggers
- ✅ Auto-update `updated_at` timestamp
- ✅ รันอัตโนมัติเมื่อมีการ UPDATE

---

## 💻 ตัวอย่างการใช้งาน

### Query Data
```javascript
import supabase from './config/supabase.js';

// Get all rewards
const { data, error } = await supabase
  .from('rewards')
  .select('*')
  .eq('is_active', true);

// Get user by LINE ID
const { data: user } = await supabase
  .from('users')
  .select('*')
  .eq('line_id', lineId)
  .single();

// Get user with transactions
const { data } = await supabase
  .from('users')
  .select(`
    *,
    transactions (*)
  `)
  .eq('id', userId);
```

### Insert Data
```javascript
// Create new user
const { data, error } = await supabase
  .from('users')
  .insert({
    line_id: 'U1234567890',
    email: 'user@example.com',
    name: 'John Doe',
    member_since: '2026'
  })
  .select()
  .single();

// Create transaction
await supabase
  .from('transactions')
  .insert({
    user_id: userId,
    type: 'topup',
    amount: 100.00,
    description: 'Top up wallet'
  });
```

### Update Data
```javascript
// Update user points
const { data, error } = await supabase
  .from('users')
  .update({ points: newPoints })
  .eq('id', userId)
  .select()
  .single();

// Mark notification as read
await supabase
  .from('notifications')
  .update({ is_read: true })
  .eq('id', notificationId);
```

### Delete Data
```javascript
// Delete notification
await supabase
  .from('notifications')
  .delete()
  .eq('id', notificationId);
```

---

## 🎯 Next Steps

### 1. อัปเดต Backend Routes
- ✅ แทนที่ JSON database ด้วย Supabase queries
- ✅ เริ่มจาก `routes/auth.js`
- ✅ ตามด้วย `routes/users.js`, `routes/rewards.js`, etc.

### 2. Migrate Data
- ถ้ามีข้อมูลใน `database.json` อยู่แล้ว
- สร้าง script migrate data ไป Supabase

### 3. Test API Endpoints
- ทดสอบทุก endpoint ว่าทำงานกับ Supabase
- ตรวจสอบ error handling

### 4. Enable Realtime (Optional)
```javascript
// Subscribe to changes
const channel = supabase
  .channel('notifications')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'notifications' },
    (payload) => {
      console.log('New notification:', payload.new);
    }
  )
  .subscribe();
```

---

## 🔍 Useful Supabase Features

### 1. **Table Editor**
- แก้ไขข้อมูลแบบ GUI
- เพิ่ม/ลบ rows ได้ง่าย

### 2. **SQL Editor**
- รัน SQL queries
- สร้าง functions, triggers

### 3. **Database**
- ดู schema
- จัดการ indexes, policies

### 4. **Storage**
- เก็บไฟล์ (รูปโปรไฟล์, QR codes)
- CDN built-in

### 5. **Logs**
- ดู API logs
- Debug errors

---

## 📚 Resources

### Documentation
- Supabase Docs: https://supabase.com/docs
- JavaScript Client: https://supabase.com/docs/reference/javascript
- SQL Reference: https://supabase.com/docs/guides/database

### Tutorials
- Quick Start: https://supabase.com/docs/guides/getting-started
- Database Design: https://supabase.com/docs/guides/database/tables
- Row Level Security: https://supabase.com/docs/guides/auth/row-level-security

---

## ✅ Checklist

- [ ] สร้าง Supabase project
- [ ] คัดลอก API keys
- [ ] อัปเดต `.env` file
- [ ] รัน `schema.sql` ใน SQL Editor
- [ ] ตรวจสอบ tables ใน Table Editor
- [ ] ทดสอบการเชื่อมต่อ
- [ ] อัปเดต Backend routes
- [ ] ทดสอบ API endpoints
- [ ] Deploy to production

---

**Status**: ✅ Setup Complete  
**Next**: อัปเดต Backend routes ให้ใช้ Supabase แทน JSON database
