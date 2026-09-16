CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  book_id VARCHAR(32) NOT NULL,
  title TEXT,
  stripe_session_id VARCHAR(255) UNIQUE,
  status VARCHAR(32) NOT NULL DEFAULT 'reserved',
  email TEXT,
  shipping_json TEXT,
  amount_cents INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS orders_book_id_status_idx ON orders (book_id, status);
