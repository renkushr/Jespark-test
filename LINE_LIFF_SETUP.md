# LINE LIFF Integration Guide

## ✅ โปรเจคเชื่อมต่อ LIFF แล้ว

แอปนี้เชื่อมต่อ LINE LIFF แล้ว โดยจะ:

- **เริ่มต้น LIFF ตอนเปิดแอป** – เมื่อมี `VITE_LIFF_ID` ใน `.env` แอปจะ init LIFF ก่อน แล้วค่อยโหลดหน้าต่อ
- **ล็อกอินด้วย LINE** – หน้า Login มีปุ่ม "เข้าสู่ระบบผ่าน LINE" (ใช้ Mock ถ้ายังไม่ตั้ง LIFF)
- **รองรับ redirect หลัง LINE Login** – หลังกดล็อกอิน LINE แล้วกลับมา แอปจะดึง profile และล็อกอินให้อัตโนมัติ

**สิ่งที่คุณต้องทำ:** สร้าง LINE Login Channel + LIFF App ใน LINE Developers แล้วใส่ LIFF ID กับ Channel ID ใน `.env` ตามขั้นตอนด้านล่าง

---

## 📋 ขั้นตอนการตั้งค่า LINE LIFF

### 1. สร้าง LINE Login Channel

1. ไปที่ **LINE Developers Console**: https://developers.line.biz/console/
2. Login ด้วย LINE account
3. สร้าง Provider ใหม่ (ถ้ายังไม่มี)
4. คลิก **Create a new channel**
5. เลือก **LINE Login**
6. กรอกข้อมูล:
   - Channel name: `Jespark Rewards`
   - Channel description: `ระบบสะสมคะแนน Jespark`
   - App types: เลือก `Web app`
   - Email address: อีเมลของคุณ

### 2. ตั้งค่า LINE Login Channel

1. ไปที่แท็บ **LINE Login**
2. ตั้งค่า **Callback URL**:
   ```
   https://localhost:3000
   ```
   (สำหรับ production ใช้ domain จริง เช่น `https://your-domain.com`)

3. เปิดใช้งาน:
   - ✅ Email address permission
   - ✅ OpenID Connect

### 3. สร้าง LIFF App

**หมายเหตุ:** LINE LIFF บังคับใช้ **HTTPS** เท่านั้น — โปรเจคนี้รัน Frontend แบบ HTTPS บน local แล้ว

1. ไปที่แท็บ **LIFF**
2. คลิก **Add**
3. กรอกข้อมูล:
   - **LIFF app name**: `Jespark Rewards`
   - **Size**: `Full`
   - **Endpoint URL**: `https://localhost:3000` (development — ใช้ HTTPS)
   - **Scope**: เลือก
     - ✅ profile
     - ✅ openid
     - ✅ email (optional)
   - **Bot link feature**: `Off` (ถ้าไม่มี bot)

4. คลิก **Add** และจะได้ **LIFF ID** (เช่น `1234567890-AbCdEfGh`)

**ครั้งแรกที่เปิด:** เบราว์เซอร์จะเตือน certificate (self-signed) — กด **Advanced** → **Proceed to localhost** เพื่อเข้าได้

### 4. รับ Credentials

จากหน้า **Basic settings**:
- **Channel ID**: `1234567890`
- **Channel secret**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

จากหน้า **LIFF**:
- **LIFF ID**: `1234567890-AbCdEfGh`

---

## 🔧 การติดตั้งและใช้งาน

### 1. ติดตั้ง LIFF SDK

```bash
npm install @line/liff
```

### 2. สร้างไฟล์ .env

สร้างไฟล์ `.env` ในโฟลเดอร์หลัก:

```env
# LINE LIFF Configuration
VITE_LIFF_ID=1234567890-AbCdEfGh
VITE_LINE_CHANNEL_ID=1234567890

# Backend API
VITE_API_URL=http://localhost:5000
```

### 3. สร้างไฟล์ .env สำหรับ Backend

สร้างหรืออัปเดตไฟล์ `server/.env`:

```env
# Existing configs...
PORT=5000
JWT_SECRET=your-secret-key

# LINE Configuration
LINE_CHANNEL_ID=1234567890
LINE_CHANNEL_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
LINE_CALLBACK_URL=http://localhost:3000/auth/callback

# Supabase (existing)
SUPABASE_URL=https://vzlywwykogfzyjryhdrq.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
```

---

## 📱 การใช้งาน LIFF

### ทดสอบบน LINE App

1. เปิด LINE app บนมือถือ
2. ไปที่ **LINE Official Account Manager**
3. เลือก channel ที่สร้าง
4. คลิก **LIFF URL**:
   ```
   https://liff.line.me/1234567890-AbCdEfGh
   ```

### ทดสอบบน Browser (Development)

1. รัน Frontend (รันแบบ HTTPS แล้ว):
   ```bash
   npm run dev
   ```

2. เปิด browser ไปที่:
   ```
   https://localhost:3000
   ```
   ครั้งแรกถ้าเบราว์เซอร์เตือน certificate — กด **Advanced** → **Proceed to localhost (unsafe)**

3. คลิกปุ่ม "เข้าสู่ระบบผ่าน LINE"

4. ระบบจะ redirect ไปหา LINE Login

**ทดสอบจาก LINE App บนมือถือ:** ถ้าเปิด LIFF จาก LINE แล้ว error (certificate) ให้ใช้ [ngrok](https://ngrok.com/) สร้าง tunnel HTTPS ไปที่ `https://localhost:3000` แล้วตั้ง **LIFF Endpoint URL** เป็น URL ที่ ngrok ให้ (เช่น `https://xxxx.ngrok.io`)

---

## 🔐 Security Notes

### Production Checklist

- [ ] เปลี่ยน Callback URL เป็น HTTPS
- [ ] เปลี่ยน Endpoint URL เป็น domain จริง
- [ ] เก็บ Channel Secret ใน environment variables
- [ ] ตั้งค่า CORS ให้ถูกต้อง
- [ ] เปิดใช้งาน SSL/TLS
- [ ] ตั้งค่า Rate Limiting

### Environment Variables

**ห้าม commit ไฟล์เหล่านี้:**
- `.env`
- `server/.env`
- ไฟล์ที่มี credentials

เพิ่มใน `.gitignore`:
```
.env
.env.local
.env.production
server/.env
```

---

## 📚 Resources

- **LINE Developers**: https://developers.line.biz/
- **LIFF Documentation**: https://developers.line.biz/en/docs/liff/
- **LINE Login**: https://developers.line.biz/en/docs/line-login/
- **LIFF SDK**: https://www.npmjs.com/package/@line/liff

---

## 🐛 Troubleshooting

### LIFF ไม่ทำงาน

1. ตรวจสอบ LIFF ID ใน `.env`
2. ตรวจสอบ Endpoint URL ใน LIFF settings
3. ลอง clear cache และ reload

### Login ไม่สำเร็จ

1. ตรวจสอบ Callback URL
2. ตรวจสอบ Channel Secret
3. ดู error logs ใน Console

### CORS Error

1. ตั้งค่า CORS ใน backend
2. ตรวจสอบ domain ใน LIFF settings

---

## ✅ Next Steps

1. ✅ สร้าง LINE Login Channel
2. ✅ สร้าง LIFF App
3. ✅ รับ credentials
4. ✅ โปรเจคใช้ LIFF SDK และ init ตอนเปิดแอป
5. ⏳ ใส่ LIFF ID ใน `.env` แล้วทดสอบ LINE Login
6. ⏳ Deploy production แล้วอัป Endpoint URL ใน LIFF

---

**สร้างเมื่อ:** Feb 3, 2026  
**Status:** Ready for implementation
