-- QuickLink Database Schema - Updated with Enterprise Features
-- Execute this SQL in your Neon dashboard SQL Editor

-- Add new columns to existing users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS api_key VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS team_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS is_team_owner BOOLEAN DEFAULT FALSE;

-- Add new column to urls table
ALTER TABLE urls 
ADD COLUMN IF NOT EXISTS created_via_api BOOLEAN DEFAULT FALSE;

-- Create API usage tracking table
CREATE TABLE IF NOT EXISTS api_usage (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    requests INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, month),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create teams table for team management
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    team_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    owner_id VARCHAR(255) NOT NULL,
    plan VARCHAR(50) DEFAULT 'enterprise',
    max_members INTEGER DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create team members table
CREATE TABLE IF NOT EXISTS team_members (
    id SERIAL PRIMARY KEY,
    team_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'member', -- owner, admin, member
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, user_id),
    FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create additional indexes for new features
CREATE INDEX IF NOT EXISTS idx_users_api_key ON users(api_key);
CREATE INDEX IF NOT EXISTS idx_api_usage_user_month ON api_usage(user_id, month);
CREATE INDEX IF NOT EXISTS idx_teams_owner ON teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);

-- Generate API key for existing enterprise user
UPDATE users SET 
  api_key = 'qk_demo_' || substr(md5(random()::text), 1, 32)
WHERE email = 'enterprise@example.com' AND api_key IS NULL;

-- Verify new features
SELECT 'Enterprise features added successfully!' as status;
SELECT 
  email, 
  plan, 
  api_key IS NOT NULL as has_api_key,
  subscription_status
FROM users 
WHERE plan IN ('pro', 'enterprise');

-- Show table structure
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
ORDER BY table_name, ordinal_position;