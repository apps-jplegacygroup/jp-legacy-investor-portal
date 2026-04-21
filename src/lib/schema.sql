CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Property Info
  address TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Tampa',
  state VARCHAR(2) NOT NULL DEFAULT 'FL',
  zip VARCHAR(10),
  property_type TEXT NOT NULL DEFAULT 'Multifamily',
  num_units INTEGER NOT NULL DEFAULT 4,
  beds_per_unit INTEGER NOT NULL DEFAULT 2,
  baths_per_unit DECIMAL(3,1) NOT NULL DEFAULT 1,
  year_built INTEGER,
  sqft INTEGER,
  image_url TEXT,
  image_urls TEXT[],
  ylopo_link TEXT,
  video_url TEXT,
  description TEXT,

  -- Financial Inputs
  purchase_price DECIMAL(12,2) NOT NULL,
  equity_percent DECIMAL(5,2) NOT NULL DEFAULT 5,
  annual_interest_rate DECIMAL(5,3) NOT NULL DEFAULT 6.5,
  loan_term_years INTEGER NOT NULL DEFAULT 30,
  monthly_rent_year1 DECIMAL(10,2) NOT NULL,
  rent_increase_percent DECIMAL(5,2) NOT NULL DEFAULT 5,
  vacancy_rate DECIMAL(5,2) NOT NULL DEFAULT 5,
  insurance DECIMAL(10,2) NOT NULL DEFAULT 14000,
  maintenance_percent DECIMAL(5,2) NOT NULL DEFAULT 3,
  property_mgmt_percent DECIMAL(5,2) NOT NULL DEFAULT 3,
  utilities_percent DECIMAL(5,2) NOT NULL DEFAULT 2,
  broker_fees DECIMAL(10,2) NOT NULL DEFAULT 0,
  hoa DECIMAL(10,2) NOT NULL DEFAULT 0,
  property_tax DECIMAL(10,2) NOT NULL DEFAULT 15000,
  tax_rate DECIMAL(5,2) NOT NULL DEFAULT 28,
  depreciation_years DECIMAL(5,1) NOT NULL DEFAULT 27.5,
  points_percent DECIMAL(5,3) NOT NULL DEFAULT 0,
  other_equity_spent DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_equity_invested DECIMAL(12,2) NOT NULL DEFAULT 0,

  monthly_rent_improved DECIMAL(10,2),
  renovation_cost DECIMAL(10,2),
  renovation_notes TEXT,

  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON properties;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
