-- ==============================================================================
-- BAYTUL MAMUR MOSQUE MANAGEMENT SYSTEM - COMPREHENSIVE DEMO SEED DATA (v3)
-- Purpose: Complete, meaningful, production-grade mock data for ALL 22+ pages.
-- Safe to re-run: Uses strictly valid hex UUIDs, schema safety ALTERs, and ON CONFLICT.
-- ==============================================================================

-- 0. SCHEMA ENSURANCE (Guarantees tables and columns exist)
CREATE TABLE IF NOT EXISTS public.app_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  default_nisab numeric DEFAULT 85000,
  fitra_prices jsonb DEFAULT '{"wheat": 115, "barley": 165, "raisins": 550, "dates": 450, "cheese": 850}'::jsonb,
  prayer_city text DEFAULT 'Dhaka',
  prayer_country text DEFAULT 'Bangladesh',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.qurbani_animals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL,
  cost numeric NOT NULL,
  processing_cost numeric DEFAULT 0,
  vendor text,
  purchase_date date,
  total_shares integer NOT NULL DEFAULT 7,
  created_at timestamptz DEFAULT now(),
  created_by uuid
);

CREATE TABLE IF NOT EXISTS public.qurbani_shares (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_id uuid NOT NULL REFERENCES public.qurbani_animals(id) ON DELETE CASCADE,
  member_name text NOT NULL,
  share_amount numeric NOT NULL,
  contact text,
  paid boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  created_by uuid
);

CREATE TABLE IF NOT EXISTS public.gallery_images (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text,
  description text,
  image_url text NOT NULL,
  category text DEFAULT 'general',
  media_type text DEFAULT 'image',
  video_url text,
  created_at timestamptz DEFAULT now(),
  created_by uuid
);

-- Ensure all optional/custom columns exist across tables
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS qr_token TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS expiry_date TEXT;
ALTER TABLE public.meetings ADD COLUMN IF NOT EXISTS meeting_type TEXT DEFAULT 'local';
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS receipt_no TEXT;
ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS receipt_no TEXT;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS bill_no TEXT;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT true;

-- বাল্ক সিডের সময় স্টক ট্রিগার সাময়িক বন্ধ
DROP TRIGGER IF EXISTS apply_stock_txn_trg ON public.stock_transactions;


  -- 1. APP SETTINGS (Settings, Zakat & Ramadan Calculators)
  INSERT INTO public.app_settings (id, default_nisab, fitra_prices, prayer_city, prayer_country)
  VALUES (
    'c0000001-0000-0000-0000-000000000001',
    85000,
    '{"wheat": 115, "barley": 165, "raisins": 550, "dates": 450, "cheese": 850}'::jsonb,
    'Dhaka',
    'Bangladesh'
  )
  ON CONFLICT (id) DO UPDATE SET
    default_nisab = EXCLUDED.default_nisab,
    fitra_prices = EXCLUDED.fitra_prices,
    prayer_city = EXCLUDED.prayer_city,
    prayer_country = EXCLUDED.prayer_country;

  -- 2. ACCOUNTS (Cash, Bank, Mobile Banking)
  INSERT INTO public.accounts (id, name, kind, bank_name, account_no, opening_balance, current_balance, is_active)
  VALUES
    ('b0000001-0000-0000-0000-000000000001', 'মসজিদ মূল ক্যাশ বাক্স (Cash in Hand)', 'cash', NULL, 'CASH-01', 15000.00, 42350.00, true),
    ('b0000001-0000-0000-0000-000000000002', 'ইমাম ও মুয়াজ্জিন কল্যাণ জরুরি ক্যাশ', 'cash', NULL, 'CASH-02', 5000.00, 12500.00, true),
    ('b0000001-0000-0000-0000-000000000003', 'ইসলামী ব্যাংক বাংলাদেশ লিঃ (চলতি হিসাব)', 'bank', 'Islami Bank Bangladesh Ltd (IBBL)', '2050123001189700', 350000.00, 485600.00, true),
    ('b0000001-0000-0000-0000-000000000004', 'আল-আরাফাহ ইসলামী ব্যাংক (সঞ্চয়ী হিসাব)', 'bank', 'Al-Arafah Islami Bank Ltd', '101176000452300', 180000.00, 275400.00, true),
    ('b0000001-0000-0000-0000-000000000005', 'বিকাশ মার্চেন্ট অ্যাকাউন্ট (bKash Merchant)', 'mobile_banking', 'bKash Limited', '01711-234567', 15000.00, 38200.00, true),
    ('b0000001-0000-0000-0000-000000000006', 'নগদ ইসলামিক অ্যাকাউন্ট (Nagad Islamic)', 'mobile_banking', 'Nagad', '01811-987654', 10000.00, 19850.00, true)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    kind = EXCLUDED.kind,
    bank_name = EXCLUDED.bank_name,
    account_no = EXCLUDED.account_no,
    current_balance = EXCLUDED.current_balance,
    is_active = EXCLUDED.is_active;

  -- 3. MEMBERS (Member Directory & Printable QR ID Cards)
  INSERT INTO public.members (
    id, member_code, full_name, photo_url, father_name, mother_name, nid, dob,
    phone, email, address, occupation, blood_group, membership_type,
    monthly_subscription, joining_date, status, notes, expiry_date, qr_token
  )
  VALUES
    (
      'a0000001-0000-0000-0000-000000000001', 'MB-101', 'আলহাজ্ব মোঃ রফিকুল ইসলাম',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&fit=crop&crop=face',
      'মরহুম হাজী আব্দুল করিম', 'মোসাম্মৎ রহিমা খাতুন', '19682691234567891', '1968-05-14',
      '01711234567', 'rafiqul.islam@example.com', 'বাড়ি # ১২, রোড # ৪, সেক্টর # ৭, উত্তরা, ঢাকা',
      'বিশিষ্ট ব্যবসায়ী ও সমাজসেবক', 'A+', 'founding', 1000.00, '2020-01-01', 'active',
      'মসজিদ পরিচালনা কমিটির সম্মানিত সভাপতি', '2028-12-31', 'QR-BM-101-RAF'
    ),
    (
      'a0000001-0000-0000-0000-000000000002', 'MB-102', 'ইঞ্জিনিয়ার মোঃ কামরুল হাসান',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&fit=crop&crop=face',
      'মোঃ সামসুল হক', 'খাদিজা বেগম', '19752699876543210', '1975-08-20',
      '01819345678', 'kamrul.hasan@example.com', 'বাড়ি # ৪৫/এ, রোড # ২, উত্তরা, ঢাকা',
      'চিফ স্ট্রাকচারাল ইঞ্জিনিয়ার', 'B+', 'permanent', 1500.00, '2021-03-15', 'active',
      'সাধারণ সম্পাদক (General Secretary)', '2028-12-31', 'QR-BM-102-KAM'
    ),
    (
      'a0000001-0000-0000-0000-000000000003', 'MB-103', 'হাজী মোঃ নূরুল আমিন',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&fit=crop&crop=face',
      'মরহুম আমিনুল ইসলাম', 'ফাতেমা বেগম', '19702695544332211', '1970-11-10',
      '01912456789', 'nurul.amin@example.com', 'প্লট # ১৮, সেক্টর # ১১, উত্তরা, ঢাকা',
      'আমদানি ও রপ্তানি ব্যবসায়ী', 'O+', 'permanent', 2000.00, '2020-06-01', 'active',
      'অর্থ সম্পাদক / ক্যাশিয়ার (Treasurer)', '2028-12-31', 'QR-BM-103-NUR'
    ),
    (
      'a0000001-0000-0000-0000-000000000004', 'MB-104', 'ডাঃ এ কে এম মিজানুর রহমান',
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&fit=crop&crop=face',
      'মরহুম ফজলুর রহমান', 'রোকেয়া বেগম', '19802697788990011', '1980-03-25',
      '01715567890', 'dr.mizan@example.com', 'বাড়ি # ৭, রোড # ৯, সেক্টর # ৩, উত্তরা, ঢাকা',
      'সহযোগী অধ্যাপক ও সিনিয়র চিকিৎসক', 'AB+', 'permanent', 1000.00, '2022-01-10', 'active',
      'সহ-সভাপতি (Vice President)', '2028-12-31', 'QR-BM-104-MIZ'
    ),
    (
      'a0000001-0000-0000-0000-000000000005', 'MB-105', 'মাওলানা মুফতি আব্দুল হান্নান',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&fit=crop&crop=face',
      'মাওলানা আব্দুর রশিদ', 'আমেনা খাতুন', '19822693322114455', '1982-07-15',
      '01611678901', 'imam.hannan@example.com', 'মসজিদ কোয়ার্টার, ২য় তলা, বায়তুল মামুর',
      'প্রধান ইমাম ও খতিব', 'O+', 'honorary', 0.00, '2020-01-01', 'active',
      'মসজিদের সিনিয়র পেশ ইমাম ও খতিব', '2030-12-31', 'QR-BM-105-HAN'
    ),
    (
      'a0000001-0000-0000-0000-000000000006', 'MB-106', 'হাফেজ ক্বারী জুবায়ের আহমেদ',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&fit=crop&crop=face',
      'মোঃ আইয়ুব আলী', 'জাহানারা বেগম', '19902691122334455', '1990-09-05',
      '01511789012', 'zubair.ahmed@example.com', 'মসজিদ কোয়ার্টার, বায়তুল মামুর',
      'প্রধান মুয়াজ্জিন ও সহকারী শিক্ষক', 'A+', 'honorary', 0.00, '2021-06-01', 'active',
      'সরাসরি আজান ও টিভি ডিসপ্লে দায়িত্বপ্রাপ্ত', '2030-12-31', 'QR-BM-106-ZUB'
    ),
    (
      'a0000001-0000-0000-0000-000000000007', 'MB-107', 'মোঃ তারিকুল ইসলাম',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&fit=crop&crop=face',
      'মোঃ মোশাররফ হোসেন', 'হাসিনা বেগম', '19882699988776655', '1988-12-12',
      '01718890123', 'tariqul@example.com', 'বাড়ি # ২১, রোড # ১, সেক্টর # ৭, উত্তরা',
      'সিনিয়র প্রিন্সিপাল অফিসার (ব্যাংক)', 'B+', 'general', 500.00, '2022-04-01', 'active',
      'যুগ্ম সাধারণ সম্পাদক (Joint Secretary)', '2028-12-31', 'QR-BM-107-TAR'
    ),
    (
      'a0000001-0000-0000-0000-000000000008', 'MB-108', 'আলহাজ্ব সুলতান মাহমুদ',
      'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&fit=crop&crop=face',
      'মরহুম জহিরুল ইসলাম', 'সখিনা বেগম', '19552690011223344', '1955-02-18',
      '01811901234', 'sultan.mahmud@example.com', 'বাড়ি # ৪, সেক্টর # ৪, উত্তরা, ঢাকা',
      'অবসরপ্রাপ্ত উপসচিব ও উপদেষ্টা', 'O+', 'founding', 1000.00, '2020-01-01', 'active',
      'উপদেষ্টা পরিষদ সদস্য', '2028-12-31', 'QR-BM-108-SUL'
    ),
    (
      'a0000001-0000-0000-0000-000000000009', 'MB-109', 'মোঃ জহিরুল হক',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&fit=crop&crop=face',
      'মোঃ নজরুল ইসলাম', 'শামসুন্নাহার', '19852694455667788', '1985-06-30',
      '01911012345', 'zahirul.haque@example.com', 'দোকান # ৩, মসজিদ মার্কেট, উত্তরা',
      'ফার্মেসী স্বত্বাধিকারী', 'A+', 'general', 500.00, '2023-01-15', 'active',
      'সাধারণ সদস্য ও ব্যবসায়ী প্রতিনিধি', '2027-12-31', 'QR-BM-109-ZAH'
    ),
    (
      'a0000001-0000-0000-0000-000000000010', 'MB-110', 'খন্দকার রেজাউল করিম',
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&fit=crop&crop=face',
      'খন্দকার লুৎফর রহমান', 'রাবেয়া খাতুন', '19832692233445566', '1983-10-05',
      '01712123456', 'rezaul.karim@example.com', 'বাড়ি # ৭২, সেক্টর # ৭, উত্তরা',
      'কলেজ শিক্ষক ও সাহিত্যিক', 'O-', 'general', 500.00, '2023-02-20', 'active',
      'প্রচার ও প্রকাশনা উপকমিটি', '2027-12-31', 'QR-BM-110-REZ'
    )
  ON CONFLICT (id) DO UPDATE SET
    member_code = EXCLUDED.member_code,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    occupation = EXCLUDED.occupation,
    monthly_subscription = EXCLUDED.monthly_subscription,
    status = EXCLUDED.status,
    qr_token = EXCLUDED.qr_token;

  -- 4. SUBSCRIPTIONS (Monthly Subscription Tracking & Receipts)
  -- Pre-clean demo subscriptions to guarantee idempotency without relying on composite UNIQUE constraints
  DELETE FROM public.subscriptions WHERE member_id IN (
    'a0000001-0000-0000-0000-000000000001',
    'a0000001-0000-0000-0000-000000000002',
    'a0000001-0000-0000-0000-000000000003',
    'a0000001-0000-0000-0000-000000000004',
    'a0000001-0000-0000-0000-000000000007',
    'a0000001-0000-0000-0000-000000000008',
    'a0000001-0000-0000-0000-000000000009',
    'a0000001-0000-0000-0000-000000000010'
  ) AND ((year = EXTRACT(YEAR FROM CURRENT_DATE)::INT AND month = EXTRACT(MONTH FROM CURRENT_DATE)::INT) OR (year = EXTRACT(YEAR FROM (CURRENT_DATE - INTERVAL '1 month'))::INT AND month = EXTRACT(MONTH FROM (CURRENT_DATE - INTERVAL '1 month'))::INT));

  INSERT INTO public.subscriptions (
    member_id, year, month, amount, paid_amount, status, paid_date, notes
  )
  VALUES
    -- Current Month
    ('a0000001-0000-0000-0000-000000000001', EXTRACT(YEAR FROM CURRENT_DATE)::INT, EXTRACT(MONTH FROM CURRENT_DATE)::INT, 1000.00, 1000.00, 'paid', CURRENT_DATE - 3, 'চলতি মাসের নিয়মিত মাসিক চাঁদা পরিশোধ (রশিদ নং REC-SUB-2601)'),
    ('a0000001-0000-0000-0000-000000000002', EXTRACT(YEAR FROM CURRENT_DATE)::INT, EXTRACT(MONTH FROM CURRENT_DATE)::INT, 1500.00, 1500.00, 'paid', CURRENT_DATE - 5, 'ব্যাংক ট্রান্সফারের মাধ্যমে প্রাপ্ত (রশিদ নং REC-SUB-2602)'),
    ('a0000001-0000-0000-0000-000000000003', EXTRACT(YEAR FROM CURRENT_DATE)::INT, EXTRACT(MONTH FROM CURRENT_DATE)::INT, 2000.00, 2000.00, 'paid', CURRENT_DATE - 2, 'নগদ জমা রশিদ প্রদান করা হয়েছে (রশিদ নং REC-SUB-2603)'),
    ('a0000001-0000-0000-0000-000000000004', EXTRACT(YEAR FROM CURRENT_DATE)::INT, EXTRACT(MONTH FROM CURRENT_DATE)::INT, 1000.00, 1000.00, 'paid', CURRENT_DATE - 4, 'বিকাশের মাধ্যমে পরিশোধিত (রশিদ নং REC-SUB-2604)'),
    ('a0000001-0000-0000-0000-000000000007', EXTRACT(YEAR FROM CURRENT_DATE)::INT, EXTRACT(MONTH FROM CURRENT_DATE)::INT, 500.00, 500.00, 'paid', CURRENT_DATE - 6, 'নগদ ক্যাশে গৃহীত (রশিদ নং REC-SUB-2605)'),
    ('a0000001-0000-0000-0000-000000000008', EXTRACT(YEAR FROM CURRENT_DATE)::INT, EXTRACT(MONTH FROM CURRENT_DATE)::INT, 1000.00, 1000.00, 'paid', CURRENT_DATE - 8, 'উপদেষ্টা মহোদয়ের মাসিক অনুদান (রশিদ নং REC-SUB-2606)'),
    ('a0000001-0000-0000-0000-000000000009', EXTRACT(YEAR FROM CURRENT_DATE)::INT, EXTRACT(MONTH FROM CURRENT_DATE)::INT, 500.00, 250.00, 'partial', CURRENT_DATE - 1, 'অর্ধেক জমা, অবশিষ্ট ২৫০ টাকা পরবর্তী সপ্তাহে দেবেন'),
    ('a0000001-0000-0000-0000-000000000010', EXTRACT(YEAR FROM CURRENT_DATE)::INT, EXTRACT(MONTH FROM CURRENT_DATE)::INT, 500.00, 0.00, 'due', NULL, 'বকেয়া রয়েছে, এসএমএস নোটিফিকেশন পাঠানো হয়েছে'),
    -- Previous Month
    ('a0000001-0000-0000-0000-000000000001', EXTRACT(YEAR FROM (CURRENT_DATE - INTERVAL '1 month'))::INT, EXTRACT(MONTH FROM (CURRENT_DATE - INTERVAL '1 month'))::INT, 1000.00, 1000.00, 'paid', CURRENT_DATE - 33, 'পূর্ববর্তী মাসের চাঁদা'),
    ('a0000001-0000-0000-0000-000000000002', EXTRACT(YEAR FROM (CURRENT_DATE - INTERVAL '1 month'))::INT, EXTRACT(MONTH FROM (CURRENT_DATE - INTERVAL '1 month'))::INT, 1500.00, 1500.00, 'paid', CURRENT_DATE - 34, 'অনলাইন ট্রান্সফার'),
    ('a0000001-0000-0000-0000-000000000003', EXTRACT(YEAR FROM (CURRENT_DATE - INTERVAL '1 month'))::INT, EXTRACT(MONTH FROM (CURRENT_DATE - INTERVAL '1 month'))::INT, 2000.00, 2000.00, 'paid', CURRENT_DATE - 32, 'নগদ পরিশোধ'),
    ('a0000001-0000-0000-0000-000000000004', EXTRACT(YEAR FROM (CURRENT_DATE - INTERVAL '1 month'))::INT, EXTRACT(MONTH FROM (CURRENT_DATE - INTERVAL '1 month'))::INT, 1000.00, 1000.00, 'paid', CURRENT_DATE - 35, 'নগদ জমা'),
    ('a0000001-0000-0000-0000-000000000007', EXTRACT(YEAR FROM (CURRENT_DATE - INTERVAL '1 month'))::INT, EXTRACT(MONTH FROM (CURRENT_DATE - INTERVAL '1 month'))::INT, 500.00, 500.00, 'paid', CURRENT_DATE - 31, 'ক্যাশ বাক্স');

  -- 5. DONATIONS (Donations, Zakat, Ramadan, Qurbani & Jummah Collections)
  INSERT INTO public.donations (
    id, donor_name, donor_phone, member_id, kind, amount, donation_date, notes
  )
  VALUES
    (
      'd0000003-0000-0000-0000-000000000001', 'সর্বসাধারণ মুসল্লিয়ান (জুমার বাক্স)', NULL, NULL,
      'jummah', 32450.00, CURRENT_DATE - 2, 'গত শুক্রবারের জুমার জামাতে সরাসরি দান বাক্সে প্রাপ্ত টাকা (রশিদ নং REC-JUM-104)'
    ),
    (
      'd0000003-0000-0000-0000-000000000002', 'আলহাজ্ব মোঃ রফিকুল ইসলাম', '01711234567', 'a0000001-0000-0000-0000-000000000001',
      'construction', 50000.00, CURRENT_DATE - 7, 'মসজিদের ২য় তলার মার্বেল ও টাইলস সংস্কার ফান্ডে বিশেষ অনুদান (রশিদ নং REC-DON-201)'
    ),
    (
      'd0000003-0000-0000-0000-000000000003', 'নাম প্রকাশে অনিচ্ছুক দ্বীনি ভাই', '01799887766', NULL,
      'zakat', 65000.00, CURRENT_DATE - 12, 'বাৎসরিক জাকাত ফান্ডে দরিদ্র ও বিধবা পুনর্বাসনের উদ্দেশ্যে দান (রশিদ নং REC-ZAK-088)'
    ),
    (
      'd0000003-0000-0000-0000-000000000004', 'হাজী মোঃ নূরুল আমিন', '01912456789', 'a0000001-0000-0000-0000-000000000003',
      'zakat', 45000.00, CURRENT_DATE - 15, 'ব্যবসায়িক জাকাত প্রদান (ব্যাবসার নিসাব অনুযায়ী হিসাবকৃত)'
    ),
    (
      'd0000003-0000-0000-0000-000000000005', 'ডাঃ এ কে এম মিজানুর রহমান', '01715567890', 'a0000001-0000-0000-0000-000000000004',
      'sadaqah', 10000.00, CURRENT_DATE - 9, 'পিতা-মাতার মাগফিরাত কামনায় মসজিদ ও মাদরাসা এতিমখানায় ছদকা'
    ),
    (
      'd0000003-0000-0000-0000-000000000006', 'মুহিব্বুর রহমান চৌধুরী', '01811445566', NULL,
      'ramadan', 25000.00, CURRENT_DATE - 20, 'রমজানুল মোবারকে রোজাদার মুসল্লিদের প্রতিদিনের গণ-ইফতার তহবিল'
    ),
    (
      'd0000003-0000-0000-0000-000000000007', 'শফিকুর রহমান ও পরিবার', '01611223344', NULL,
      'fitra', 8500.00, CURRENT_DATE - 22, 'পরিবারের ৮ সদস্যের সাদাকাতুল ফিতর বাবদ নগদ আদায়'
    ),
    (
      'd0000003-0000-0000-0000-000000000008', 'প্রবাসী মীর কাসেম (লন্ডন)', '+44781234567', NULL,
      'qurbani', 30000.00, CURRENT_DATE - 25, 'ঈদুল আজহা উপলক্ষে মসজিদের সম্মিলিত কোরবানি ও গোশত বিতরণ তহবিল'
    ),
    (
      'd0000003-0000-0000-0000-000000000009', 'সর্বসাধারণ মুসল্লিয়ান (জুমার বাক্স - পূর্ববর্তী সপ্তাহ)', NULL, NULL,
      'jummah', 28900.00, CURRENT_DATE - 9, 'পূর্ববর্তী সপ্তাহের জুমার দান বাক্স সংগ্রহ'
    ),
    (
      'd0000003-0000-0000-0000-000000000010', 'মেসার্স আল-মদিনা এন্টারপ্রাইজ', '01712334455', NULL,
      'general', 15000.00, CURRENT_DATE - 14, 'মসজিদের সার্বিক পরিচালনার জন্য সাধারণ এককালীন অনুদান'
    )
  ON CONFLICT (id) DO UPDATE SET
    donor_name = EXCLUDED.donor_name,
    amount = EXCLUDED.amount,
    kind = EXCLUDED.kind,
    donation_date = EXCLUDED.donation_date;

  -- 6. INCOME (Income Page & Financial Ledger)
  INSERT INTO public.income (
    id, category, source, amount, account_id, income_date, notes
  )
  VALUES
    (
      'e0000001-0000-0000-0000-000000000001', 'জুমার দান বাক্স', 'মুসল্লিদের স্বতঃস্ফূর্ত দান',
      32450.00, 'b0000001-0000-0000-0000-000000000001', CURRENT_DATE - 2, 'জুমার নামাজ শেষে চারজন কমিটির সদস্যের উপস্থিতিতে গণনা'
    ),
    (
      'e0000001-0000-0000-0000-000000000002', 'মাসিক সদস্য ফি', 'সম্মানিত সদস্যদের মাসিক চাঁদা',
      7500.00, 'b0000001-0000-0000-0000-000000000003', CURRENT_DATE - 5, 'চলতি মাসের প্রথম সপ্তাহের সদস্য কালেকশন'
    ),
    (
      'e0000001-0000-0000-0000-000000000003', 'মসজিদ মার্কেট দোকান ভাড়া', 'দোকান # ১ ও ২ (মাসিক ভাড়া)',
      24000.00, 'b0000001-0000-0000-0000-000000000003', CURRENT_DATE - 6, 'মসজিদ ওয়াকফ মার্কেটের দুটি বাণিজ্যিক দোকানের মাসিক নিয়মিত ভাড়া'
    ),
    (
      'e0000001-0000-0000-0000-000000000004', 'বিকাশ অনলাইন দান', 'মোবাইল কিউআর কোড স্ক্যান কালেকশন',
      12800.00, 'b0000001-0000-0000-0000-000000000005', CURRENT_DATE - 4, 'বিকাশ মার্চেন্ট নম্বরে সরাসরি সংগৃহীত সাধারণ অনুদান'
    ),
    (
      'e0000001-0000-0000-0000-000000000005', 'নির্মাণ ও সংস্কার ফান্ড', 'বিশেষ দাতা সদস্য অনুদান',
      50000.00, 'b0000001-0000-0000-0000-000000000004', CURRENT_DATE - 7, 'টাইলস এবং অযুখানা আধুনিকায়ন ফান্ডের অনুদান'
    ),
    (
      'e0000001-0000-0000-0000-000000000006', 'ওয়াকফ পুকুর ইজারা বাবদ আয়', 'বাৎসরিক মাছ চাষ ইজারা',
      18000.00, 'b0000001-0000-0000-0000-000000000004', CURRENT_DATE - 18, 'মসজিদ ওয়াকফ পুকুরের ১ম কিস্তির ইজারা অর্থ'
    ),
    (
      'e0000001-0000-0000-0000-000000000007', 'জুমার দান বাক্স (পূর্ববর্তী সপ্তাহ)', 'মুসল্লিদের স্বতঃস্ফূর্ত দান',
      28900.00, 'b0000001-0000-0000-0000-000000000001', CURRENT_DATE - 9, 'পূর্ববর্তী সপ্তাহের জুমার নামাজ কালেকশন'
    )
  ON CONFLICT (id) DO UPDATE SET
    category = EXCLUDED.category,
    amount = EXCLUDED.amount,
    account_id = EXCLUDED.account_id,
    income_date = EXCLUDED.income_date;

  -- 7. EXPENSES (Expenses Page & Financial Audit)
  INSERT INTO public.expenses (
    id, category, vendor, amount, account_id, expense_date, approved, notes
  )
  VALUES
    (
      'e0000002-0000-0000-0000-000000000001', 'ইমাম ও খতিবের মাসিক হাদিয়া', 'মাওলানা মুফতি আব্দুল হান্নান',
      25000.00, 'b0000001-0000-0000-0000-000000000003', CURRENT_DATE - 4, true, 'চলতি মাসের নির্ধারিত মাসিক হাদিয়া প্রদান (বিল নং PAY-IMAM-2601)'
    ),
    (
      'e0000002-0000-0000-0000-000000000002', 'মুয়াজ্জিনের মাসিক হাদিয়া', 'হাফেজ ক্বারী জুবায়ের আহমেদ',
      18000.00, 'b0000001-0000-0000-0000-000000000003', CURRENT_DATE - 4, true, 'মুয়াজ্জিন সাহেবের চলতি মাসের হাদিয়া (বিল নং PAY-MUAZ-2601)'
    ),
    (
      'e0000002-0000-0000-0000-000000000003', 'খাদেম ও পরিচ্ছন্নতাকর্মীর বেতন', 'মোঃ রফিকুল ও সুজন মিয়া (২ জন)',
      15000.00, 'b0000001-0000-0000-0000-000000000001', CURRENT_DATE - 5, true, 'মসজিদের সার্বক্ষণিক ২ জন খাদেমের মাসিক বেতন'
    ),
    (
      'e0000002-0000-0000-0000-000000000004', 'বিদ্যুৎ বিল (DESCO)', 'ঢাকা ইলেকট্রিক সাপ্লাই কোম্পানি লিঃ',
      14650.00, 'b0000001-0000-0000-0000-000000000003', CURRENT_DATE - 10, true, 'চলতি মাসের বিদ্যুৎ বিল পরিশোধ করা হয়েছে (বিল নং DESCO-OCT-4412)'
    ),
    (
      'e0000002-0000-0000-0000-000000000005', 'ওয়াসা পানির বিল (WASA)', 'ঢাকা ওয়াসা (রাজস্ব জোন-৯)',
      2800.00, 'b0000001-0000-0000-0000-000000000001', CURRENT_DATE - 11, true, 'অযুখখানা ও টয়লেট কমপ্লেক্সের মাসিক পানির বিল'
    ),
    (
      'e0000002-0000-0000-0000-000000000006', 'এসি ও ইলেকট্রিক রক্ষণাবেক্ষণ', 'মেসার্স কুলিং পয়েন্ট সার্ভিসিং',
      6500.00, 'b0000001-0000-0000-0000-000000000001', CURRENT_DATE - 8, true, 'মেইন হলের ৪টি ইনভার্টার এসির ফিল্টার ওয়াশ ও গ্যাস চেক'
    ),
    (
      'e0000002-0000-0000-0000-000000000007', 'জেনারেটরের ডিজেল জ্বালানি', 'পদ্মা ওয়েল ফিলিং স্টেশন',
      4200.00, 'b0000001-0000-0000-0000-000000000001', CURRENT_DATE - 13, true, 'লোডশেডিং ব্যাকআপ জেনারেটরের জন্য ৩৫ লিটার ডিজেল ক্রয়'
    ),
    (
      'e0000002-0000-0000-0000-000000000008', 'মসজিদ পরিষ্কার-পরিচ্ছন্নতার সামগ্রী', 'নিউ ঢাকা স্টোর',
      3400.00, 'b0000001-0000-0000-0000-000000000001', CURRENT_DATE - 14, true, 'হারপিক, ব্লিচিং পাউডার, ফ্লোর ক্লিনার ও মপ ক্রয়'
    )
  ON CONFLICT (id) DO UPDATE SET
    category = EXCLUDED.category,
    amount = EXCLUDED.amount,
    vendor = EXCLUDED.vendor,
    approved = EXCLUDED.approved,
    expense_date = EXCLUDED.expense_date;

  -- 8. TRANSACTIONS (Cash & Bank Transfers)
  INSERT INTO public.transactions (
    id, account_id, kind, amount, reference, description, txn_date
  )
  VALUES
    (
      'f0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000003',
      'credit', 50000.00, 'DEP-IBBL-2026', 'জুমার দান বাক্স থেকে নগদ টাকা ব্যাংক হিসাবে জমা', CURRENT_DATE - 3
    ),
    (
      'f0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000001',
      'debit', 50000.00, 'TRF-TO-BANK', 'ক্যাশ বাক্স থেকে ব্যাংকে জমাদানের জন্য উত্তোলন', CURRENT_DATE - 3
    ),
    (
      'f0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000003',
      'debit', 43000.00, 'CHQ-778899', 'ইমাম ও মুয়াজ্জিন সাহেবের মাসিক হাদিয়া প্রদান বাবদ চেক উত্তোলন', CURRENT_DATE - 4
    ),
    (
      'f0000001-0000-0000-0000-000000000004', 'b0000001-0000-0000-0000-000000000005',
      'transfer', 15000.00, 'BKASH-TO-BANK', 'বিকাশ মার্চেন্ট থেকে ব্যাংক হিসাবে স্থানান্তর', CURRENT_DATE - 8
    )
  ON CONFLICT (id) DO UPDATE SET
    amount = EXCLUDED.amount,
    reference = EXCLUDED.reference,
    description = EXCLUDED.description;

  -- 9. PRAYER TIMES (Prayer Times Page & Smart TV Display /tv-display)
  DELETE FROM public.prayer_times WHERE id IN (
    'f0000009-0000-0000-0000-000000000001',
    'f0000009-0000-0000-0000-000000000002',
    'f0000009-0000-0000-0000-000000000003'
  ) OR effective_date::text IN (CURRENT_DATE::text, (CURRENT_DATE + 1)::text, (CURRENT_DATE - 1)::text);

  INSERT INTO public.prayer_times (
    id, effective_date, fajr, fajr_iqamah, dhuhr, dhuhr_iqamah, asr, asr_iqamah,
    maghrib, maghrib_iqamah, isha, isha_iqamah, jummah, notes
  )
  VALUES
    (
      'f0000009-0000-0000-0000-000000000001',
      CURRENT_DATE::text, '04:50:00', '05:15:00', '12:00:00', '13:15:00',
      '16:15:00', '16:30:00', '17:45:00', '17:55:00', '19:15:00', '19:30:00', '13:30:00',
      'আজকের নিয়মিত নামাজের সময়সূচী। জামাতের ৫ মিনিট পূর্বে আজান দেওয়া হয়।'
    ),
    (
      'f0000009-0000-0000-0000-000000000002',
      (CURRENT_DATE + 1)::text, '04:50:00', '05:15:00', '12:00:00', '13:15:00',
      '16:15:00', '16:30:00', '17:44:00', '17:55:00', '19:15:00', '19:30:00', '13:30:00',
      'আগামীকালের নির্ধারিত নামাজের সময়সূচী'
    ),
    (
      'f0000009-0000-0000-0000-000000000003',
      (CURRENT_DATE - 1)::text, '04:49:00', '05:15:00', '12:00:00', '13:15:00',
      '16:16:00', '16:30:00', '17:46:00', '17:55:00', '19:15:00', '19:30:00', '13:30:00',
      'গতকালের নামাজের সময়সূচী'
    );

  -- 10. NOTICES (Notices Page & Smart TV Display Announcements)
  INSERT INTO public.notices (
    id, title, content, kind, notice_date, published
  )
  VALUES
    (
      'f0000002-0000-0000-0000-000000000001',
      'পবিত্র জুমার নামাজের সময়সূচী ও খুতবা শুরুর সময়',
      'সম্মানিত মুসল্লি ভাইদের অবগতির জন্য জানানো যাচ্ছে যে, আগামী শুক্রবার থেকে জুমার আজান দুপুর ১২:৪৫ মিনিটে এবং খুতবা দুপুর ১:১৫ মিনিটে অনুষ্ঠিত হবে। জামাত শুরু হবে দুপুর ১:৩০ মিনিটে। সকলকে সময়মতো উপস্থিত হওয়ার অনুরোধ করা হলো।',
      'general', CURRENT_DATE - 1, true
    ),
    (
      'f0000002-0000-0000-0000-000000000002',
      'মসজিদ কমপ্লেক্সের ২য় তলা সম্প্রসারণ তহবিলে অনুদানের আবেদন',
      'মুসল্লিদের সংখ্যা বৃদ্ধির কারণে মসজিদের ২য় তলার সম্প্রসারণ ও টাইলস লাগানোর কাজ শুরু হতে যাচ্ছে। আনুমানিক বাজেট ১৫ লক্ষ টাকা। আগ্রহী দ্বীনদার ভাই ও বোনদের মুক্তহস্তে অনুদান প্রদানের বিনীত অনুরোধ জানানো যাচ্ছে।',
      'event', CURRENT_DATE - 4, true
    ),
    (
      'f0000002-0000-0000-0000-000000000003',
      'মাসিক কার্যনির্বাহী পরিচালনা কমিটির সাধারণ সভা আহ্বান',
      'আগামী মাসের প্রথম শুক্রবার বাদ মাগরিব মসজিদ কার্যালয়ে কার্যনির্বাহী কমিটির নিয়মিত মাসিক সভা অনুষ্ঠিত হবে। কমিটির সকল সম্মানিত সদস্যদের যথাসময়ে উপস্থিত থাকতে বিনীত অনুরোধ করা হলো।',
      'meeting', CURRENT_DATE - 6, true
    ),
    (
      'f0000002-0000-0000-0000-000000000004',
      'মসজিদে মোবাইল ফোন সাইলেন্ট রাখা সংক্রান্ত জরুরী বিজ্ঞপ্তি',
      'নামাজের পবিত্রতা বজায় রাখতে এবং মুসল্লিদের একাগ্রতা রক্ষার্থে মসজিদে প্রবেশের সাথে সাথে মোবাইল ফোন বন্ধ বা সাইলেন্ট রাখুন। জামাতের মধ্যে মোবাইল বেজে উঠলে সাথে সাথে সাইলেন্ট বাটনে চাপ দিন।',
      'emergency', CURRENT_DATE - 10, true
    )
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    kind = EXCLUDED.kind,
    published = EXCLUDED.published;

  -- 11. EVENTS (Mosque Events & Mahfils)
  INSERT INTO public.events (
    id, title, description, event_type, event_date, location
  )
  VALUES
    (
      'f0000003-0000-0000-0000-000000000001',
      'বাৎসরিক তাফসিরুল কুরআন ও ওয়াজ মাহফিল ২০২৬',
      'দেশের শীর্ষস্থানীয় প্রখ্যাত ওলামায়ে কেরাম ও মুফাসসিরীনে কেরামের উপস্থিতিতে বায়তুল মামুর জামে মসজিদ প্রাঙ্গণে দিনব্যাপী ঐতিহাসিক ওয়াজ মাহফিল ও বিশেষ মোনাজাত অনুষ্ঠিত হবে।',
      'ওয়াজ মাহফিল', (CURRENT_DATE + 12)::timestamptz + interval '17 hours', 'মসজিদ সংলগ্ন প্রধান ঈদগাহ মাঠ ও মসজিদ চত্বর'
    ),
    (
      'f0000003-0000-0000-0000-000000000002',
      'পবিত্র ঈদুল ফিতর জামাত প্রস্তুতি ও নিরাপত্তা সমন্বয় সভা',
      'এলাকার স্থানীয় কাউন্সিলর, ইমাম সাহেব এবং গণ্যমান্য ব্যক্তিবর্গের উপস্থিতিতে ঈদের প্রথম ও দ্বিতীয় জামাতের সময় নির্ধারণ ও মুসল্লিদের ব্যবস্থাপনা বিষয়ক আলোচনা।',
      'প্রস্তুতি সভা', (CURRENT_DATE + 5)::timestamptz + interval '19 hours', 'মসজিদ কনফারেন্স রুম, ২য় তলা'
    ),
    (
      'f0000003-0000-0000-0000-000000000003',
      'শিশু-কিশোরদের হিফজুল কুরআন ও ক্যালিগ্রাফি প্রতিযোগিতা',
      'এলাকার শিশু-কিশোরদের দ্বীনি শিক্ষায় উৎসাহিত করতে পবিত্র কুরআন তিলাওয়াত, তাজবিদ ও ইসলামিক হস্তলিপি প্রতিযোগিতা অনুষ্ঠিত হবে। বিজয়ীদের মধ্যে বিশেষ পুরস্কার বিতরণ করা হবে।',
      'প্রতিযোগিতা', (CURRENT_DATE + 18)::timestamptz + interval '9 hours', 'মসজিদ নূরানী হিফজুল কুরআন বিভাগ'
    ),
    (
      'f0000003-0000-0000-0000-000000000004',
      'সাপ্তাহিক রিয়াদুস সালেহীন হাদিস পাঠ ও দারস',
      'প্রতি বৃহস্পতিবার বাদ এশা ইমাম মাওলানা আব্দুল হান্নান সাহেবের পরিচালনায় গুরুত্বপূর্ণ জীবনঘনিষ্ঠ হাদিসের দারস ও প্রশ্ন-উত্তর পর্ব অনুষ্ঠিত হয়।',
      'সাপ্তাহিক দারস', (CURRENT_DATE + 2)::timestamptz + interval '20 hours', 'মসজিদের মূল প্রার্থনা হল'
    )
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    event_type = EXCLUDED.event_type,
    location = EXCLUDED.location;

  -- 12. COMMITTEES (Committee Management)
  INSERT INTO public.committees (
    id, name, tenure_start, tenure_end, status, description
  )
  VALUES
    (
      'c0000002-0000-0000-0000-000000000001',
      'বায়তুল মামুর জামে মসজিদ কার্যনির্বাহী পরিচালনা কমিটি (২০২৪-২০২৬)',
      '2024-01-01', '2026-12-31', 'active',
      'উপদেষ্টা পরিষদ ও মুসল্লিয়ানদের সর্বসম্মতিক্রমে অনুমোদিত পূর্ণাঙ্গ কার্যনির্বাহী কমিটি।'
    ),
    (
      'c0000002-0000-0000-0000-000000000002',
      'মসজিদ নির্মাণ ও অবকাঠামো উন্নয়ন উপকমিটি',
      '2024-06-01', '2026-06-01', 'active',
      'মসজিদের ২য় তলা সম্প্রসারণ ও আধুনিক অজুখানা নির্মাণ কাজের তদারকি সংক্রান্ত বিশেষ কমিটি।'
    )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    tenure_start = EXCLUDED.tenure_start,
    tenure_end = EXCLUDED.tenure_end,
    status = EXCLUDED.status,
    description = EXCLUDED.description;

  -- 13. COMMITTEE MEMBERS (Committee Members Page)
  DELETE FROM public.committee_members WHERE committee_id = 'c0000002-0000-0000-0000-000000000001'
     OR id IN (
       'c0000003-0000-0000-0000-000000000001',
       'c0000003-0000-0000-0000-000000000002',
       'c0000003-0000-0000-0000-000000000003',
       'c0000003-0000-0000-0000-000000000004',
       'c0000003-0000-0000-0000-000000000005',
       'c0000003-0000-0000-0000-000000000006'
     );

  INSERT INTO public.committee_members (
    id, committee_id, member_id, position, joined_at
  )
  VALUES
    ('c0000003-0000-0000-0000-000000000001', 'c0000002-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'president', '2024-01-01'),
    ('c0000003-0000-0000-0000-000000000002', 'c0000002-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000004', 'vice_president', '2024-01-01'),
    ('c0000003-0000-0000-0000-000000000003', 'c0000002-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000002', 'secretary', '2024-01-01'),
    ('c0000003-0000-0000-0000-000000000004', 'c0000002-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000007', 'joint_secretary', '2024-01-01'),
    ('c0000003-0000-0000-0000-000000000005', 'c0000002-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000003', 'treasurer', '2024-01-01'),
    ('c0000003-0000-0000-0000-000000000006', 'c0000002-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000009', 'member', '2024-01-01');

  -- 14. MEETINGS & RESOLUTIONS (Meetings Page)
  INSERT INTO public.meetings (
    id, title, meeting_date, location, kind, meeting_type, status, agenda, minutes
  )
  VALUES
    (
      'd0000001-0000-0000-0000-000000000001',
      'মসজিদের ছাদ আধুনিকায়ন ও সোলার প্যানেল স্থাপন বিষয়ক বিশেষ সভা',
      (CURRENT_DATE - 15)::timestamptz + interval '19 hours',
      'মসজিদ অফিস কক্ষ, উত্তরা',
      'committee', 'local', 'completed',
      '১. বিগত সভার কার্যবিবরণী অনুমোদন\n২. বিদ্যুৎ সাশ্রয়ে ২০ কিলোওয়াট অন-গ্রিড সোলার সিস্টেম প্রাক্কলন\n৩. বিভিন্ন ভেন্ডরের কোটেশন যাচাই ও চুক্তি চূড়ান্তকরণ',
      'উপস্থিত সকল সদস্যের সম্মতিক্রমে সোলার সিস্টেম স্থাপনের চূড়ান্ত সিদ্ধান্ত গৃহীত হয়েছে। সর্বনিম্ন দরদাতা হিসেবে সানপাওয়ার এনার্জিকে কার্যাদেশ প্রদানের সিদ্ধান্ত হয়।'
    ),
    (
      'd0000001-0000-0000-0000-000000000002',
      'রমজানুল মোবারক পূর্বপ্রস্তুতি ও নিরাপত্তা বিষয়ক সমন্বয় সভা',
      (CURRENT_DATE + 8)::timestamptz + interval '18 hours',
      'মসজিদ কনফারেন্স রুম',
      'general', 'local', 'scheduled',
      '১. তারাবিহ নামাজের হাফেজ নির্বাচন ও সম্মানী নির্ধারণ\n২. প্রতিদিনের গণ-ইফতার স্পন্সর ও ব্যবস্থাপনা\n৩. লাইলাতুল কদর ও ইতিকাফ মুসল্লিদের সুযোগ-সুবিধা তদারকি',
      NULL
    )
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    location = EXCLUDED.location,
    status = EXCLUDED.status,
    agenda = EXCLUDED.agenda,
    minutes = EXCLUDED.minutes;

  DELETE FROM public.meeting_attendance WHERE meeting_id = 'd0000001-0000-0000-0000-000000000001';

  INSERT INTO public.meeting_attendance (meeting_id, member_id, status, remarks)
  VALUES
    ('d0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'present', 'সভাপতিত্ব করেছেন'),
    ('d0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000002', 'present', 'সঞ্চালনা ও কার্যবিবরণী লিপিবদ্ধ'),
    ('d0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000003', 'present', 'আর্থিক প্রস্তাবনা উপস্থাপন'),
    ('d0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000004', 'present', 'প্রস্তাব সমর্থন করেছেন'),
    ('d0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000007', 'late', 'অফিসের কাজে ১০ মিনিট দেরিতে উপস্থিত');

  INSERT INTO public.resolutions (
    id, committee_id, meeting_id, title, content, resolution_date, status
  )
  VALUES
    (
      'd0000002-0000-0000-0000-000000000001',
      'c0000002-0000-0000-0000-000000000001',
      'd0000001-0000-0000-0000-000000000001',
      'মসজিদের ছাদে ২০ কিলোওয়াট সোলার প্যানেল প্রকল্প অনুমোদন',
      'মসজিদের বিদ্যুৎ বিল ৮০% হ্রাস করার লক্ষ্যে সানপাওয়ার লিমিটেডের মাধ্যমে ৫,৫০,০০০ টাকা বাজেটে ২০ কিলোওয়াট সোলার সিস্টেম স্থাপন সর্বসম্মতভাবে অনুমোদন করা হলো।',
      CURRENT_DATE - 15, 'passed'
    )
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    status = EXCLUDED.status;

  DELETE FROM public.resolution_votes WHERE resolution_id = 'd0000002-0000-0000-0000-000000000001';

  INSERT INTO public.resolution_votes (resolution_id, member_id, vote)
  VALUES
    ('d0000002-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'yes'),
    ('d0000002-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000002', 'yes'),
    ('d0000002-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000003', 'yes'),
    ('d0000002-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000004', 'yes');

  -- 15. ASSETS (Mosque Assets Page)
  INSERT INTO public.assets (
    id, name, category, purchase_date, purchase_price, current_value,
    condition, location, notes
  )
  VALUES
    (
      'a0000002-0000-0000-0000-000000000001',
      'গ্রী ২-টন ইনভার্টার স্প্লিট এসি (৬টি ইউনিট)', 'HVAC / এয়ার কন্ডিশনার',
      '2023-04-10', 510000.00, 450000.00,
      'good', 'মসজিদের নিচতলা ও মেইন জামাত হল', 'প্রতি বছর গরমের পূর্বে সার্ভিসিং করানো হয়।'
    ),
    (
      'a0000002-0000-0000-0000-000000000002',
      'আহুজা (Ahuja) ডিজিটাল অ্যাম্প্লিফায়ার ও সাউন্ড মিক্সার', 'সাউন্ড সিস্টেম',
      '2022-09-15', 135000.00, 110000.00,
      'good', 'ইমাম মেহরাব সংলগ্ন কন্ট্রোল ক্যাবিনেট', 'উচ্চ মানের ক্লিয়ার সাউন্ড, ৮টি ওয়্যারলেস মাইক্রোফোন সহ।'
    ),
    (
      'a0000002-0000-0000-0000-000000000003',
      'পারকিন্স ১৫ কেভিএ সাইলেন্ট ডিজেল জেনারেটর', 'বিদ্যুৎ ও ব্যাকআপ',
      '2021-11-20', 680000.00, 580000.00,
      'good', 'মসজিদ জেনারেটর রুম (উত্তর কোণ)', 'অটোমেটিক চেঞ্জওভার সুইচ সংযুক্ত।'
    ),
    (
      'a0000002-0000-0000-0000-000000000004',
      'সেন্ট্রাল আইপিএস (IPS) ও ৪টি ২০০ অ্যাম্পিয়ার টিউবুলার ব্যাটারি', 'বিদ্যুৎ ও ব্যাকআপ',
      '2023-01-05', 195000.00, 160000.00,
      'fair', 'মসজিদ স্টোর রুম', 'বিদ্যুৎ চলে গেলে সকল ফ্যান ও সাউন্ড সিস্টেম সার্বক্ষণিক চালু রাখে।'
    ),
    (
      'a0000002-0000-0000-0000-000000000005',
      '১৬ চ্যানেল ফুল এইচডি নাইট ভিশন সিসিটিভি সিস্টেম', 'নিরাপত্তা ও নজরদারি',
      '2023-08-12', 920000.00, 80000.00,
      'good', 'মসজিদ চত্বর, অযুখানা, মেইন গেট ও দোতলা', '১৬টি ডোম ও বুলেট ক্যামেরা, ৪ টেরাবাইট হার্ডডিস্ক।'
    ),
    (
      'a0000002-0000-0000-0000-000000000006',
      '৫৫ ইঞ্চি স্মার্ট এলইডি ডিসপ্লে টিভি (নামাজের সময়সূচীর জন্য)', 'ইলেকট্রনিক্স',
      '2024-02-18', 68000.00, 62000.00,
      'good', 'মসজিদের প্রবেশদ্বার সংলগ্ন দেয়াল', 'সরাসরি ওয়েব অ্যাপ্লিকেশন /tv-display পেজ ২৪/৭ লাইভ রান করে।'
    )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    purchase_price = EXCLUDED.purchase_price,
    current_value = EXCLUDED.current_value,
    condition = EXCLUDED.condition,
    location = EXCLUDED.location;

  -- 16. INVENTORY (Inventory & Stock Management)
  INSERT INTO public.inventory_items (
    id, name, category, unit, current_stock, min_stock, unit_price, notes
  )
  VALUES
    (
      'b0000002-0000-0000-0000-000000000001',
      'তুর্কি নামাজের সুতি টুপি', 'পোশাক ও সামগ্রী',
      'pcs', 120.00, 30.00, 65.00, 'মুসল্লিদের জন্য উন্মুক্ত স্ট্যাণ্ডে রাখা থাকে।'
    ),
    (
      'b0000002-0000-0000-0000-000000000002',
      'প্রাকৃতিক তাজা মিসওয়াক (প্যাকেটজাত)', 'সুন্নাহ সামগ্রী',
      'pcs', 180.00, 50.00, 20.00, 'মসজিদের অযুখখানার বুকশেলফে রাখা হয়।'
    ),
    (
      'b0000002-0000-0000-0000-000000000003',
      'পবিত্র নূরানী কুরআন শরীফ (বড় হরফ সংস্করণ)', 'পবিত্র কিতাব',
      'pcs', 75.00, 20.00, 450.00, 'মসজিদের মেহরাব ও রেইল বুক শেলফে সংরক্ষিত।'
    ),
    (
      'b0000002-0000-0000-0000-000000000004',
      'হারপিক পাওয়ার প্লাস টয়লেট ক্লিনার (৭৫০ মি.লি.)', 'পরিচ্ছন্নতা সামগ্রী',
      'bottle', 24.00, 10.00, 185.00, 'অযুখানা ও ওয়াশরুম পরিষ্কারের জন্য।'
    ),
    (
      'b0000002-0000-0000-0000-000000000005',
      'তরল হ্যান্ডওয়াশ লিকুইড (৫ লিটার জার)', 'পরিচ্ছন্নতা সামগ্রী',
      'jar', 8.00, 3.00, 750.00, 'অযুখখানার সাবান ডিসপেনসারে রিফিল করার জন্য।'
    ),
    (
      'b0000002-0000-0000-0000-000000000006',
      'রূম এয়ার ফ্রেশনার স্প্রে (সেন্ট অব মদিনাহ)', 'সুগন্ধি',
      'can', 18.00, 5.00, 320.00, 'প্রতি ওয়াক্ত নামাজের ১৫ মিনিট পূর্বে স্প্রে করা হয়।'
    )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    current_stock = EXCLUDED.current_stock,
    min_stock = EXCLUDED.min_stock,
    unit_price = EXCLUDED.unit_price;

  -- Stock Transactions
  INSERT INTO public.stock_transactions (
    id, item_id, kind, quantity, reason, txn_date
  )
  VALUES
    ('b0000003-0000-0000-0000-000000000001', 'b0000002-0000-0000-0000-000000000001', 'in', 100.00, 'হাজী নূরুল আমিন সাহেব কর্তৃক হাদিয়া প্রাপ্ত', CURRENT_DATE - 12),
    ('b0000003-0000-0000-0000-000000000002', 'b0000002-0000-0000-0000-000000000004', 'in', 30.00, 'মাসিক পাইকারি বাজার থেকে ক্রয়', CURRENT_DATE - 14),
    ('b0000003-0000-0000-0000-000000000003', 'b0000002-0000-0000-0000-000000000004', 'out', 6.00, 'খাদেমকে সাপ্তাহিক পরিষ্কারের জন্য প্রদান', CURRENT_DATE - 3)
  ON CONFLICT (id) DO UPDATE SET
    quantity = EXCLUDED.quantity,
    reason = EXCLUDED.reason;

  -- 17. QURBANI MANAGEMENT (Qurbani Animals & Shares Page)
  INSERT INTO public.qurbani_animals (
    id, type, cost, processing_cost, vendor, purchase_date, total_shares
  )
  VALUES
    (
      'c0000004-0000-0000-0000-000000000001',
      'দেশি লাল ষাঁড় গরু (পশুর নং ০১)', 175000.00, 10500.00,
      'গাবতলী পশুর হাট (মেসার্স সাদিক ডেইরি ফার্ম)', CURRENT_DATE - 45, 7
    ),
    (
      'c0000004-0000-0000-0000-000000000002',
      'অস্ট্রেলিয়ান ক্রস জাতের বলদ গরু (পশুর নং ০২)', 210000.00, 12600.00,
      'উত্তরা দিয়াবাড়ি পশুর হাট (রশিদ ডেইরি)', CURRENT_DATE - 45, 7
    )
  ON CONFLICT (id) DO UPDATE SET
    type = EXCLUDED.type,
    cost = EXCLUDED.cost,
    processing_cost = EXCLUDED.processing_cost,
    vendor = EXCLUDED.vendor,
    total_shares = EXCLUDED.total_shares;

  INSERT INTO public.qurbani_shares (
    id, animal_id, member_name, share_amount, contact, paid
  )
  VALUES
    ('c0000005-0000-0000-0000-000000000001', 'c0000004-0000-0000-0000-000000000001', 'আলহাজ্ব মোঃ রফিকুল ইসলাম', 26500.00, '01711234567', true),
    ('c0000005-0000-0000-0000-000000000002', 'c0000004-0000-0000-0000-000000000001', 'ইঞ্জিনিয়ার মোঃ কামরুল হাসান', 26500.00, '01819345678', true),
    ('c0000005-0000-0000-0000-000000000003', 'c0000004-0000-0000-0000-000000000001', 'হাজী মোঃ নূরুল আমিন', 26500.00, '01912456789', true),
    ('c0000005-0000-0000-0000-000000000004', 'c0000004-0000-0000-0000-000000000001', 'ডাঃ এ কে এম মিজানুর রহমান', 26500.00, '01715567890', true),
    ('c0000005-0000-0000-0000-000000000005', 'c0000004-0000-0000-0000-000000000001', 'মোঃ তারিকুল ইসলাম', 26500.00, '01718890123', true),
    ('c0000005-0000-0000-0000-000000000006', 'c0000004-0000-0000-0000-000000000001', 'আলহাজ্ব সুলতান মাহমুদ', 26500.00, '01811901234', true),
    ('c0000005-0000-0000-0000-000000000007', 'c0000004-0000-0000-0000-000000000001', 'মোঃ জহিরুল হক', 26500.00, '01911012345', false),
    -- Animal 2 Shares
    ('c0000005-0000-0000-0000-000000000008', 'c0000004-0000-0000-0000-000000000002', 'ব্যবসায়ী মোঃ ফজলুর রহমান', 31800.00, '01712998877', true),
    ('c0000005-0000-0000-0000-000000000009', 'c0000004-0000-0000-0000-000000000002', 'শাহেদ আহমেদ চৌধুরী', 31800.00, '01811554433', true),
    ('c0000005-0000-0000-0000-000000000010', 'c0000004-0000-0000-0000-000000000002', 'খন্দকার রেজাউল করিম', 31800.00, '01712123456', true)
  ON CONFLICT (id) DO UPDATE SET
    member_name = EXCLUDED.member_name,
    share_amount = EXCLUDED.share_amount,
    paid = EXCLUDED.paid;

  -- 18. GALLERY (Gallery Page)
  INSERT INTO public.gallery_images (
    id, title, description, image_url, category, media_type
  )
  VALUES
    (
      'd0000004-0000-0000-0000-000000000001',
      'মসজিদের দৃষ্টিনন্দন কেন্দ্রীয় মেহরাব ও গম্বুজ',
      'বায়তুল মামুর জামে মসজিদের ভেতরের দৃষ্টিনন্দন স্থাপত্য ও ক্যালিগ্রাফি শিল্প।',
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
      'স্থাপত্য', 'image'
    ),
    (
      'd0000004-0000-0000-0000-000000000002',
      'পবিত্র জুমার নামাজে মুসল্লিয়ানদের উপস্থিতি',
      'শুক্রবারের জুমার জামাতে নিচতলা ও দোতলা পূর্ণ হয়ে মুসল্লিদের একাগ্র সালাত আদায়।',
      'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80',
      'নামাজ ও ইবাদত', 'image'
    ),
    (
      'd0000004-0000-0000-0000-000000000003',
      'মসজিদের সুউচ্চ মিনার ও রাতের আলোকসজ্জা',
      'রাতের বেলায় বায়তুল মামুর মসজিদের বহিরাঙ্গন ও সুউচ্চ মিনারের আলোকোজ্জ্বল দৃশ্য।',
      'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80',
      'আলোকসজ্জা', 'image'
    ),
    (
      'd0000004-0000-0000-0000-000000000004',
      'রমজানের গণ-ইফতার আয়োজন ও দোয়া',
      'পবিত্র মাহে রমজানে প্রতিদিন এলাকার রোজাদার মুসল্লি ও পথচারীদের উন্মুক্ত ইফতার মাহফিল।',
      'https://images.unsplash.com/photo-1590076215667-874d47f9a2f6?auto=format&fit=crop&w=1200&q=80',
      'রমজান কার্যক্রম', 'image'
    )
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url;

  -- 19. AUDIT LOGS (Audit Logs Page)
  INSERT INTO public.audit_logs (
    id, actor_email, action, entity, entity_id, changes, created_at
  )
  VALUES
    (
      'e0000003-0000-0000-0000-000000000001',
      'admin@info.com', 'insert', 'donations', 'd0000003-0000-0000-0000-000000000001',
      '{"kind": "jummah", "amount": 32450, "donor_name": "সর্বসাধারণ মুসল্লিয়ান (জুমার বাক্স)"}'::jsonb,
      CURRENT_DATE - 2
    ),
    (
      'e0000003-0000-0000-0000-000000000002',
      'admin@info.com', 'update', 'prayer_times', 'f0000009-0000-0000-0000-000000000001',
      '{"old": {"maghrib": "17:46:00"}, "new": {"maghrib": "17:45:00"}}'::jsonb,
      CURRENT_DATE
    ),
    (
      'e0000003-0000-0000-0000-000000000003',
      'admin@info.com', 'insert', 'expenses', 'e0000002-0000-0000-0000-000000000004',
      '{"amount": 14650, "category": "বিদ্যুৎ বিল (DESCO)", "approved": true}'::jsonb,
      CURRENT_DATE - 10
    )
  ON CONFLICT (id) DO NOTHING;


-- ইনভেন্টরি স্টক ট্রিগার পুনঃসক্রিয়করণ
CREATE OR REPLACE FUNCTION public.apply_stock_txn()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.kind = 'in' THEN
    UPDATE public.inventory_items SET current_stock = current_stock + NEW.quantity WHERE id = NEW.item_id;
  ELSE
    UPDATE public.inventory_items SET current_stock = current_stock - NEW.quantity WHERE id = NEW.item_id;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS apply_stock_txn_trg ON public.stock_transactions;
CREATE TRIGGER apply_stock_txn_trg AFTER INSERT ON public.stock_transactions FOR EACH ROW EXECUTE FUNCTION public.apply_stock_txn();
