# Deploy บน Vercel

โปรเจกต์นี้รองรับการ deploy บน Vercel ทั้ง Frontend (Vite) และ Backend (Express เป็น Serverless)

## 1. Deploy ด้วย Vercel CLI

```bash
npm i -g vercel
vercel
```

หรือเชื่อมกับ Git (GitHub/GitLab) จาก [Vercel Dashboard](https://vercel.com) → Import Project

## 2. ตั้งค่า Environment Variables

ไปที่ **Project → Settings → Environment Variables** แล้วเพิ่ม:

### Frontend (Build time)

| Variable | ค่า | หมายเหตุ |
|----------|-----|----------|
| `VITE_API_BASE_URL` | `/api` | ให้ Frontend เรียก API ผ่านโดเมนเดียวกัน |
| `VITE_LIFF_ID` | `2009040357-wa8El5fE` | LIFF ID จาก LINE Developers |
| `VITE_LINE_CHANNEL_ID` | `2009040357` | Channel ID |

### Backend (Runtime — ใช้กับ Serverless)

| Variable | ค่า | หมายเหตุ |
|----------|-----|----------|
| `JWT_SECRET` | สร้างค่าลับยาวๆ | ใช้ลงชื่อ JWT |
| `SUPABASE_URL` | `https://xxx.supabase.co` | จาก Supabase Dashboard |
| `SUPABASE_SERVICE_KEY` | `eyJ...` | Service role key จาก Supabase |
| `LINE_CHANNEL_ID` | `2009040357` | LINE Channel ID |
| `LINE_CHANNEL_SECRET` | ค่าลับจาก LINE | ห้ามเปิดเผย |
| `CORS_ORIGINS` | (ไม่บังคับ) | คั่นด้วย comma ถ้าต้องจำกัด origin |

**หมายเหตุ:** บน Vercel โดเมน `*.vercel.app` ถูกอนุญาตใน CORS อยู่แล้ว ไม่ต้องใส่ใน `CORS_ORIGINS` ก็ได้

## 3. ตั้งค่า LINE LIFF หลัง Deploy

1. ได้ URL จาก Vercel เช่น `https://jespark-xxx.vercel.app`
2. ไปที่ **LINE Developers Console** → Channel → แท็บ **LIFF**
3. แก้ **Endpoint URL** เป็น `https://jespark-xxx.vercel.app` (ใช้ URL จริงที่ได้)
4. แท็บ **LINE Login** → ตั้ง **Callback URL** เป็น `https://jespark-xxx.vercel.app`

## 4. โครงสร้างบน Vercel

- **Frontend:** Build จาก Vite → ใช้โฟลเดอร์ `dist`
- **API:** Request ไปที่ `/api/*` จะถูกส่งไปที่ `api/index.js` (Express จาก `server/server.js`)
- **Rewrites:** ใน `vercel.json` — `/api/(.*)` → function `/api`, นอกนั้น → SPA `/index.html`

## 5. รัน Backend แยก (Local)

```bash
cd server
npm install
npm run dev
```

Frontend ใช้ `VITE_API_BASE_URL=http://localhost:5001/api` ใน `.env` ตอนรัน local
