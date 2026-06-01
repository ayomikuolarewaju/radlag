-- Complete Membership Database Schema
-- Run this in Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Members table (only pre-approved members)
CREATE TABLE members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  membership_number VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  graduation_year INTEGER,
  graduation_set VARCHAR(50),
  phone_number VARCHAR(20),
  address TEXT,
  occupation VARCHAR(100),
  birthday DATE,
  location VARCHAR(100),
  membership_status VARCHAR(20) DEFAULT 'pending' CHECK (membership_status IN ('pending', 'active', 'suspended', 'expired')),
  membership_verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES members(id),
  last_login_at TIMESTAMP WITH TIME ZONE,
  last_payment_date DATE,
  login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Membership verification log
CREATE TABLE membership_verifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  verified_by UUID REFERENCES members(id),
  verification_method VARCHAR(20) CHECK (verification_method IN ('manual', 'automatic', 'admin')),
  notes TEXT,
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Login attempts log
CREATE TABLE login_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255),
  success BOOLEAN DEFAULT FALSE,
  ip_address INET,
  user_agent TEXT,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session management
CREATE TABLE member_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity log
CREATE TABLE member_activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  activity_type VARCHAR(50),
  description TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_membership_number ON members(membership_number);
CREATE INDEX idx_members_status ON members(membership_status);
CREATE INDEX idx_member_sessions_token ON member_sessions(session_token);
CREATE INDEX idx_login_attempts_email ON login_attempts(email);
CREATE INDEX idx_member_activities_member_id ON member_activities(member_id);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to check membership status before login
CREATE OR REPLACE FUNCTION check_membership_status(member_email VARCHAR)
RETURNS TABLE(
  is_valid BOOLEAN,
  status VARCHAR,
  message TEXT
) AS $$
DECLARE
  member_record members%ROWTYPE;
BEGIN
  SELECT * INTO member_record FROM members WHERE email = member_email;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'not_found', 'Member not found in database';
    RETURN;
  END IF;
  
  IF member_record.membership_status = 'pending' THEN
    RETURN QUERY SELECT FALSE, 'pending', 'Your membership is pending verification. Please contact the admin.';
    RETURN;
  END IF;
  
  IF member_record.membership_status = 'suspended' THEN
    RETURN QUERY SELECT FALSE, 'suspended', 'Your membership has been suspended. Please contact the admin.';
    RETURN;
  END IF;
  
  IF member_record.membership_status = 'expired' THEN
    RETURN QUERY SELECT FALSE, 'expired', 'Your membership has expired. Please renew your dues.';
    RETURN;
  END IF;
  
  RETURN QUERY SELECT TRUE, 'active', 'Membership is active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;