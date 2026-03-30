-- Migration: align existing databases with schema additions (safe for production)
-- Uses ADD COLUMN IF NOT EXISTS and CREATE TABLE IF NOT EXISTS.

-- cashier_transactions
ALTER TABLE cashier_transactions ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'completed';
ALTER TABLE cashier_transactions ADD COLUMN IF NOT EXISTS final_amount DECIMAL(10,2);
ALTER TABLE cashier_transactions ADD COLUMN IF NOT EXISTS points_used INTEGER DEFAULT 0;
ALTER TABLE cashier_transactions ADD COLUMN IF NOT EXISTS discount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE cashier_transactions ADD COLUMN IF NOT EXISTS refund_reason TEXT;
ALTER TABLE cashier_transactions ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;
ALTER TABLE cashier_transactions ADD COLUMN IF NOT EXISTS refunded_by BIGINT REFERENCES users(id);

-- points_history
ALTER TABLE points_history ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- slip_transactions (full definition when table does not exist yet)
CREATE TABLE IF NOT EXISTS slip_transactions (
  id BIGSERIAL PRIMARY KEY,
  slip_image_url TEXT NOT NULL,
  ocr_amount DECIMAL(10,2),
  confirmed_amount DECIMAL(10,2),
  points_earned INTEGER DEFAULT 0,
  customer_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  customer_name TEXT,
  staff_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  note TEXT,
  receipt_no TEXT,
  hn_number TEXT,
  flags JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

-- Columns that may be missing on older slip_transactions deployments
ALTER TABLE slip_transactions ADD COLUMN IF NOT EXISTS receipt_no TEXT;
ALTER TABLE slip_transactions ADD COLUMN IF NOT EXISTS hn_number TEXT;
ALTER TABLE slip_transactions ADD COLUMN IF NOT EXISTS flags JSONB;

-- wallet_transactions
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  cashier_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  points_earned INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_points_history_expires_at ON points_history(expires_at);
CREATE INDEX IF NOT EXISTS idx_cashier_transactions_status ON cashier_transactions(status);
CREATE INDEX IF NOT EXISTS idx_slip_transactions_customer_id ON slip_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_slip_transactions_status ON slip_transactions(status);
CREATE INDEX IF NOT EXISTS idx_slip_transactions_created_at ON slip_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_slip_transactions_staff_name ON slip_transactions(staff_name);
CREATE INDEX IF NOT EXISTS idx_slip_transactions_receipt_no ON slip_transactions(receipt_no);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_customer_id ON wallet_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_cashier_id ON wallet_transactions(cashier_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);

-- ─── Content Management Tables ─────────────────────────────

-- Banners (hero slider on member home)
-- Recommended size: 1200×480px (5:2), max 5MB, JPEG/PNG/WebP
CREATE TABLE IF NOT EXISTS banners (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle TEXT DEFAULT '',
  image_url TEXT NOT NULL,
  button_text VARCHAR(100) DEFAULT 'ดูรายละเอียด',
  link_type VARCHAR(50) DEFAULT 'rewards',
  gradient_color VARCHAR(100) DEFAULT 'from-dark-green/90 to-transparent',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brand Icons (circular logos on member home)
-- Recommended size: 200×200px (1:1 square, displayed as circle), max 5MB
CREATE TABLE IF NOT EXISTS brand_icons (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logo_url TEXT NOT NULL,
  link_url VARCHAR(255) DEFAULT '/rewards',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deals / Promotions (horizontal card slider on member home)
-- Recommended size: 560×315px (16:9), max 5MB, JPEG/PNG/WebP
CREATE TABLE IF NOT EXISTS deals (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle TEXT DEFAULT '',
  tag VARCHAR(100) DEFAULT '',
  image_url TEXT NOT NULL,
  link_url VARCHAR(255) DEFAULT '/rewards',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_banners_active_sort ON banners(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_brand_icons_active_sort ON brand_icons(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_deals_active_sort ON deals(is_active, sort_order);
