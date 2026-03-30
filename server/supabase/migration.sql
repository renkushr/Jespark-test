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
