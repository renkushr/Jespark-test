# 🛠️ CLI Tools สำหรับโปรเจกต์ Jespark Rewards

## 📦 CLI ที่ใช้ได้ตอนนี้

### 1. **npm/yarn/pnpm** - Package Manager
```bash
# ติดตั้ง dependencies
npm install
yarn install
pnpm install

# เพิ่ม package ใหม่
npm install <package-name>
yarn add <package-name>
pnpm add <package-name>

# ลบ package
npm uninstall <package-name>
yarn remove <package-name>
pnpm remove <package-name>
```

### 2. **Node.js** - Runtime
```bash
# รัน Backend
cd server
npm start              # Production
npm run dev            # Development (auto-reload)

# รัน Frontend
npm run dev            # Development server
npm run build          # Build for production
npm run preview        # Preview production build
```

### 3. **Vite** - Frontend Build Tool
```bash
# Development
npm run dev            # Start dev server (http://localhost:3001)

# Build
npm run build          # Build for production

# Preview
npm run preview        # Preview production build
```

---

## 🎯 CLI Tools แนะนำสำหรับโปรเจกต์นี้

### 🏆 1. **Prisma CLI** - Database ORM (แนะนำที่สุด)

**ติดตั้ง:**
```bash
cd server
npm install prisma @prisma/client
npm install -D prisma
```

**คำสั่งที่ใช้:**
```bash
# Initialize Prisma
npx prisma init

# Create migration
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio (Database GUI)
npx prisma studio

# Format schema
npx prisma format

# Validate schema
npx prisma validate

# Reset database
npx prisma migrate reset

# Deploy migrations (production)
npx prisma migrate deploy

# Seed database
npx prisma db seed
```

**ตัวอย่าง Schema:**
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            Int       @id @default(autoincrement())
  lineId        String?   @unique @map("line_id")
  email         String    @unique
  password      String
  name          String
  avatar        String?
  tier          String    @default("Member")
  points        Int       @default(0)
  walletBalance Float     @default(0) @map("wallet_balance")
  memberSince   String    @map("member_since")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  transactions  Transaction[]
  redemptions   Redemption[]
  notifications Notification[]
  
  @@map("users")
}
```

---

### 🗄️ 2. **Supabase CLI** - Backend as a Service

**ติดตั้ง:**
```bash
npm install -g supabase
# หรือ
brew install supabase/tap/supabase  # macOS
scoop install supabase              # Windows
```

**คำสั่งที่ใช้:**
```bash
# Login
supabase login

# Initialize project
supabase init

# Start local development
supabase start

# Stop local development
supabase stop

# Create migration
supabase migration new <migration-name>

# Apply migrations
supabase db push

# Reset database
supabase db reset

# Generate TypeScript types
supabase gen types typescript --local > types/supabase.ts

# Link to remote project
supabase link --project-ref <project-id>

# Deploy
supabase db push --linked
```

**ตัวอย่างการใช้:**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

// Query
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('line_id', lineId)
```

---

### 🔧 3. **TypeORM CLI** - Alternative ORM

**ติดตั้ง:**
```bash
cd server
npm install typeorm pg
npm install -D @types/node ts-node typescript
```

**คำสั่งที่ใช้:**
```bash
# Initialize
npx typeorm init

# Create migration
npx typeorm migration:create src/migrations/CreateUsers

# Run migrations
npx typeorm migration:run

# Revert migration
npx typeorm migration:revert

# Generate migration from entities
npx typeorm migration:generate src/migrations/UpdateUsers

# Show migrations
npx typeorm migration:show

# Sync schema (development only)
npx typeorm schema:sync
```

---

### 📊 4. **Sequelize CLI** - Another ORM Option

**ติดตั้ง:**
```bash
cd server
npm install sequelize pg pg-hstore
npm install -D sequelize-cli
```

**คำสั่งที่ใช้:**
```bash
# Initialize
npx sequelize-cli init

# Create model
npx sequelize-cli model:generate --name User --attributes name:string,email:string

# Run migrations
npx sequelize-cli db:migrate

# Undo migration
npx sequelize-cli db:migrate:undo

# Create seed
npx sequelize-cli seed:generate --name demo-users

# Run seeds
npx sequelize-cli db:seed:all

# Undo seeds
npx sequelize-cli db:seed:undo:all
```

---

### 🐳 5. **Docker CLI** - Containerization

**ติดตั้ง Docker Desktop**

**คำสั่งที่ใช้:**
```bash
# Build image
docker build -t jespark-backend ./server
docker build -t jespark-frontend .

# Run container
docker run -p 5000:5000 jespark-backend
docker run -p 3001:3001 jespark-frontend

# Docker Compose (รันทั้งระบบ)
docker-compose up
docker-compose down
docker-compose logs
docker-compose ps

# Clean up
docker system prune
```

**ตัวอย่าง docker-compose.yml:**
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: jespark
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://admin:password@postgres:5432/jespark
    depends_on:
      - postgres

  frontend:
    build: .
    ports:
      - "3001:3001"
    depends_on:
      - backend

volumes:
  postgres_data:
```

---

### 🧪 6. **Testing CLIs**

#### Jest (Unit Testing)
```bash
npm install -D jest @types/jest ts-jest

# Run tests
npm test
npm run test:watch
npm run test:coverage
```

#### Vitest (Vite-native)
```bash
npm install -D vitest

# Run tests
npm run test
npm run test:ui
```

#### Playwright (E2E Testing)
```bash
npm install -D @playwright/test

# Run tests
npx playwright test
npx playwright test --ui
npx playwright codegen  # Record tests
```

---

### 📝 7. **Database Management CLIs**

#### PostgreSQL CLI (psql)
```bash
# Connect
psql -h localhost -U admin -d jespark

# Commands
\l                  # List databases
\c jespark          # Connect to database
\dt                 # List tables
\d users            # Describe table
\q                  # Quit

# Backup
pg_dump jespark > backup.sql

# Restore
psql jespark < backup.sql
```

#### MongoDB CLI (mongosh)
```bash
# Connect
mongosh "mongodb://localhost:27017/jespark"

# Commands
show dbs
use jespark
show collections
db.users.find()
db.users.insertOne({...})
```

---

### 🔍 8. **Development Tools**

#### ESLint (Code Linting)
```bash
npm install -D eslint

npx eslint .
npx eslint --fix .
```

#### Prettier (Code Formatting)
```bash
npm install -D prettier

npx prettier --write .
npx prettier --check .
```

#### Nodemon (Auto-reload)
```bash
npm install -D nodemon

npx nodemon server.js
```

#### Concurrently (Run multiple commands)
```bash
npm install -D concurrently

# package.json
"scripts": {
  "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\""
}
```

---

### 🚀 9. **Deployment CLIs**

#### Vercel CLI
```bash
npm install -g vercel

vercel login
vercel          # Deploy
vercel --prod   # Deploy to production
vercel logs
```

#### Netlify CLI
```bash
npm install -g netlify-cli

netlify login
netlify init
netlify deploy
netlify deploy --prod
```

#### Railway CLI
```bash
npm install -g @railway/cli

railway login
railway init
railway up
railway logs
```

#### Render CLI
```bash
npm install -g @render/cli

render login
render deploy
```

---

### 📊 10. **Monitoring & Debugging**

#### PM2 (Process Manager)
```bash
npm install -g pm2

pm2 start server.js --name jespark-backend
pm2 list
pm2 logs
pm2 restart jespark-backend
pm2 stop jespark-backend
pm2 delete jespark-backend
pm2 monit
```

#### Node Inspector
```bash
node --inspect server.js
node --inspect-brk server.js  # Break on start
```

---

## 🎯 แนะนำสำหรับโปรเจกต์นี้

### สำหรับ Database: **Prisma CLI** 🏆

**ทำไม?**
- ✅ Type-safe
- ✅ Auto-completion
- ✅ Migration system ดี
- ✅ Prisma Studio (GUI)
- ✅ รองรับ PostgreSQL, MySQL, MongoDB
- ✅ Documentation ดี

**เริ่มต้น:**
```bash
cd server
npm install prisma @prisma/client
npx prisma init
npx prisma studio  # Open GUI
```

### สำหรับ Backend as a Service: **Supabase CLI** 🏆

**ทำไม?**
- ✅ ไม่ต้อง setup database
- ✅ Authentication built-in
- ✅ Realtime subscriptions
- ✅ File storage
- ✅ ฟรี

**เริ่มต้น:**
```bash
npm install -g supabase
supabase login
supabase init
supabase start
```

---

## 📋 คำสั่งที่ใช้บ่อย

### Development
```bash
# Start Backend
cd server && npm run dev

# Start Frontend
npm run dev

# Start Both (ใช้ concurrently)
npm run dev:all
```

### Database
```bash
# Prisma
npx prisma studio          # Open GUI
npx prisma migrate dev     # Create migration
npx prisma generate        # Generate client

# Supabase
supabase start            # Start local
supabase db push          # Apply migrations
```

### Testing
```bash
npm test                  # Run tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

### Build & Deploy
```bash
npm run build            # Build frontend
vercel --prod            # Deploy to Vercel
netlify deploy --prod    # Deploy to Netlify
```

---

## 🎨 ตัวอย่าง package.json Scripts

### Backend (server/package.json)
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "migrate": "prisma migrate dev",
    "studio": "prisma studio",
    "seed": "node prisma/seed.js"
  }
}
```

### Frontend (package.json)
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint .",
    "format": "prettier --write ."
  }
}
```

### Root (package.json) - Monorepo
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "cd server && npm run dev",
    "dev:client": "npm run dev",
    "install:all": "npm install && cd server && npm install",
    "build": "npm run build:client && npm run build:server",
    "test": "npm run test:client && npm run test:server"
  }
}
```

---

## 🚀 Quick Start Guide

### 1. เริ่มต้นโปรเจกต์
```bash
# Clone/Open project
cd c:\Users\PC\Desktop\newlnw

# Install dependencies
npm install
cd server && npm install && cd ..
```

### 2. Setup Database (เลือก 1 อัน)

#### Option A: Prisma + PostgreSQL
```bash
cd server
npm install prisma @prisma/client
npx prisma init
# แก้ไข prisma/schema.prisma
npx prisma migrate dev --name init
npx prisma studio
```

#### Option B: Supabase
```bash
npm install -g supabase
supabase login
supabase init
supabase start
```

### 3. Start Development
```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
npm run dev
```

### 4. Open Browser
```
Frontend: http://localhost:3001
Backend:  http://localhost:5000
Prisma Studio: http://localhost:5555
```

---

## 💡 Tips

### 1. ใช้ Aliases
```bash
# .bashrc or .zshrc
alias dev="npm run dev"
alias backend="cd server && npm run dev"
alias frontend="npm run dev"
alias studio="npx prisma studio"
```

### 2. ใช้ VS Code Tasks
```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Backend",
      "type": "npm",
      "script": "dev",
      "path": "server/",
      "problemMatcher": []
    },
    {
      "label": "Start Frontend",
      "type": "npm",
      "script": "dev",
      "problemMatcher": []
    }
  ]
}
```

### 3. ใช้ npm scripts
```bash
# แทนที่จะพิมพ์ยาวๆ
npx prisma migrate dev

# ใช้
npm run migrate
```

---

**สรุป**: แนะนำใช้ **Prisma CLI** หรือ **Supabase CLI** สำหรับ database management เพราะง่าย, ทันสมัย, และมี GUI ให้ใช้งาน
