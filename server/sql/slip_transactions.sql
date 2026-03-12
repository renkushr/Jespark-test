-- Slip Transactions table for OCR Cashier system
CREATE TABLE IF NOT EXISTS slip_transactions (
  id SERIAL PRIMARY KEY,
  slip_image_url TEXT NOT NULL,
  ocr_amount DECIMAL(10,2),
  confirmed_amount DECIMAL(10,2),
  points_earned INTEGER DEFAULT 0,
  customer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  customer_name TEXT,
  staff_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_slip_transactions_customer_id ON slip_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_slip_transactions_status ON slip_transactions(status);
CREATE INDEX IF NOT EXISTS idx_slip_transactions_created_at ON slip_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_slip_transactions_staff_name ON slip_transactions(staff_name);

-- Enable RLS (optional, backend uses service key)
ALTER TABLE slip_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: allow all for service role (backend)
CREATE POLICY "Service role full access" ON slip_transactions
  FOR ALL USING (true) WITH CHECK (true);
