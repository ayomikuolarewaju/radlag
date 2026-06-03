INSERT INTO members (
  membership_number,
  email,
  full_name,
  password_hash,
  membership_status,
  membership_verified_at
) VALUES (
  'ADMIN001',
  'admin@radlag.org',
  'RADLAG Administrator',
  'admin', 
  'active',
  NOW()
);