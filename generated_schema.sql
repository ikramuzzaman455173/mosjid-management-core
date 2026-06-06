-- ==========================================
-- 0. CLEANUP WRONG TABLES
-- ==========================================
DROP TABLE IF EXISTS system_users CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS committee_members CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS donations CASCADE;
DROP TABLE IF EXISTS income CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS bank_transactions CASCADE;
DROP TABLE IF EXISTS cash_transactions CASCADE;
DROP TABLE IF EXISTS mobile_banking CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS meetings CASCADE;
DROP TABLE IF EXISTS notices CASCADE;
DROP TABLE IF EXISTS prayer_times CASCADE;
DROP TABLE IF EXISTS qurbani CASCADE;
DROP TABLE IF EXISTS ramadan CASCADE;
DROP TABLE IF EXISTS zakat CASCADE;
DROP TABLE IF EXISTS gallery CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- ==========================================
-- 1. CREATE CORRECT TABLES BASED ON TYPES
-- ==========================================
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  default_nisab DECIMAL(12,2),
  fitra_prices JSONB,
  prayer_city TEXT,
  prayer_country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accounts (
  account_no TEXT,
  bank_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_balance DECIMAL(12,2),
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  is_active BOOLEAN,
  kind TEXT,
  name TEXT,
  opening_balance DECIMAL(12,2)
);

CREATE TABLE IF NOT EXISTS assets (
  category TEXT,
  condition TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  current_value DECIMAL(12,2),
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  location TEXT,
  name TEXT,
  notes TEXT,
  photo_url TEXT,
  purchase_date TEXT,
  purchase_price DECIMAL(12,2),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  action TEXT,
  actor_email TEXT,
  actor_user_id UUID,
  changes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  entity TEXT,
  entity_id UUID,
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS committee_members (
  committee_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  joined_at TEXT,
  member_id UUID,
  position TEXT
);

CREATE TABLE IF NOT EXISTS committees (
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  description TEXT,
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT,
  status TEXT,
  tenure_end TEXT,
  tenure_start TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS donations (
  amount DECIMAL(12,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  donation_date TEXT,
  donor_name TEXT,
  donor_phone TEXT,
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  kind TEXT,
  member_id UUID,
  notes TEXT,
  receipt_no TEXT
);

CREATE TABLE IF NOT EXISTS events (
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  description TEXT,
  event_date TEXT,
  event_type TEXT,
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  location TEXT,
  title TEXT
);

CREATE TABLE IF NOT EXISTS expenses (
  account_id UUID,
  amount DECIMAL(12,2),
  approved BOOLEAN,
  attachment_url TEXT,
  bill_no TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  expense_date TEXT,
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  notes TEXT,
  vendor TEXT
);

CREATE TABLE IF NOT EXISTS income (
  account_id UUID,
  amount DECIMAL(12,2),
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  income_date TEXT,
  notes TEXT,
  source TEXT
);

CREATE TABLE IF NOT EXISTS inventory_items (
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  current_stock DECIMAL(12,2),
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  min_stock DECIMAL(12,2),
  name TEXT,
  notes TEXT,
  unit TEXT,
  unit_price DECIMAL(12,2),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meeting_attendance (
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  meeting_id UUID,
  member_id UUID,
  remarks TEXT,
  status TEXT
);

CREATE TABLE IF NOT EXISTS meeting_documents (
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  file_name TEXT,
  file_url TEXT,
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  meeting_id UUID,
  uploaded_by TEXT
);

CREATE TABLE IF NOT EXISTS meetings (
  agenda TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  kind TEXT,
  location TEXT,
  meeting_date TEXT,
  minutes TEXT,
  status TEXT,
  title TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT,
  description TEXT,
  image_url TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT
);

CREATE TABLE IF NOT EXISTS members (
  address TEXT,
  blood_group TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  dob TEXT,
  email TEXT,
  father_name TEXT,
  full_name TEXT,
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  joining_date TEXT,
  member_code TEXT,
  membership_type TEXT,
  monthly_subscription DECIMAL(12,2),
  mother_name TEXT,
  nid TEXT,
  notes TEXT,
  occupation TEXT,
  phone TEXT,
  photo_url TEXT,
  status TEXT,
  expiry_date TEXT,
  qr_token TEXT UNIQUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notices (
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  kind TEXT,
  notice_date TEXT,
  published BOOLEAN,
  title TEXT
);

CREATE TABLE IF NOT EXISTS prayer_times (
  asr TEXT,
  asr_iqamah TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  dhuhr TEXT,
  dhuhr_iqamah TEXT,
  effective_date TEXT,
  fajr TEXT,
  fajr_iqamah TEXT,
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  isha TEXT,
  isha_iqamah TEXT,
  jummah TEXT,
  maghrib TEXT,
  maghrib_iqamah TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS qurbani_animals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT,
  cost DECIMAL(12,2),
  processing_cost DECIMAL(12,2),
  vendor TEXT,
  purchase_date TEXT,
  total_shares DECIMAL(12,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT
);

CREATE TABLE IF NOT EXISTS qurbani_shares (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  animal_id UUID,
  member_name TEXT,
  share_amount DECIMAL(12,2),
  contact TEXT,
  paid BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT
);

CREATE TABLE IF NOT EXISTS profiles (
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  full_name TEXT,
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  language TEXT,
  email TEXT,
  phone TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resolution_votes (
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  member_id UUID,
  resolution_id UUID,
  vote TEXT
);

CREATE TABLE IF NOT EXISTS resolutions (
  committee_id UUID,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  meeting_id UUID,
  resolution_date TEXT,
  status TEXT,
  title TEXT
);

CREATE TABLE IF NOT EXISTS stock_transactions (
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  item_id UUID,
  kind TEXT,
  quantity DECIMAL(12,2),
  reason TEXT,
  txn_date TEXT
);

CREATE TABLE IF NOT EXISTS subscriptions (
  amount DECIMAL(12,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  member_id UUID,
  month DECIMAL(12,2),
  notes TEXT,
  paid_amount DECIMAL(12,2),
  paid_date TEXT,
  receipt_no TEXT,
  status TEXT,
  year DECIMAL(12,2)
);

CREATE TABLE IF NOT EXISTS transactions (
  account_id UUID,
  amount DECIMAL(12,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  description TEXT,
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  kind TEXT,
  reference TEXT,
  txn_date TEXT
);

CREATE TABLE IF NOT EXISTS user_roles (
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  role TEXT,
  user_id UUID
);
