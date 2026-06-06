ALTER TABLE members ADD COLUMN IF NOT EXISTS expiry_date TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS qr_token TEXT UNIQUE;

-- Create policy to allow anonymous read for verification using qr_token
CREATE POLICY "Allow anonymous read member verification by qr_token" 
ON members FOR SELECT 
USING (qr_token IS NOT NULL);
