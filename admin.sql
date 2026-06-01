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
  '$2a$10$...', -- Use bcrypt to hash password
  'active',
  NOW()
);