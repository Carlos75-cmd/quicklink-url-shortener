-- QuickLink Database Schema
-- Execute this SQL in your Neon dashboard SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  salt VARCHAR(255) NOT NULL,
  plan VARCHAR(20) DEFAULT 'free',
  subscription_id VARCHAR(255),
  subscription_status VARCHAR(20),
  subscription_start TIMESTAMP,
  subscription_end TIMESTAMP,
  urls_created INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create urls table
CREATE TABLE IF NOT EXISTS urls (
  id SERIAL PRIMARY KEY,
  original_url TEXT NOT NULL,
  short_code VARCHAR(20) UNIQUE NOT NULL,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id VARCHAR(255)
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_urls_short_code ON urls(short_code);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Insert test users (with hashed passwords for 'password123')
-- Note: These are example hashes, the actual app will create proper hashes
INSERT INTO users (user_id, email, name, password_hash, salt, plan, urls_created, created_at, last_activity) 
VALUES 
  ('user_test_free', 'free@example.com', 'Free User', 'dummy_hash_1', 'dummy_salt_1', 'free', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('user_test_pro', 'pro@example.com', 'Pro User', 'dummy_hash_2', 'dummy_salt_2', 'pro', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('user_test_enterprise', 'enterprise@example.com', 'Enterprise User', 'dummy_hash_3', 'dummy_salt_3', 'enterprise', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- Update pro user with subscription
UPDATE users SET 
  subscription_id = 'test_pro_subscription',
  subscription_status = 'active',
  subscription_start = CURRENT_TIMESTAMP,
  subscription_end = CURRENT_TIMESTAMP + INTERVAL '30 days'
WHERE email = 'pro@example.com';

-- Update enterprise user with subscription  
UPDATE users SET 
  subscription_id = 'test_enterprise_subscription',
  subscription_status = 'active',
  subscription_start = CURRENT_TIMESTAMP,
  subscription_end = CURRENT_TIMESTAMP + INTERVAL '30 days'
WHERE email = 'enterprise@example.com';

-- Verify tables were created
SELECT 'Tables created successfully!' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';