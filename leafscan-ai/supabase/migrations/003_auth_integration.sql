-- Update user_system_state to use UUID and reference auth.users
-- This properly integrates with Supabase's built-in authentication

-- Drop old table if exists
DROP TABLE IF EXISTS user_system_state CASCADE;

-- Create table with UUID user_id referencing auth.users
CREATE TABLE user_system_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster queries
CREATE INDEX idx_user_system_state_user_id ON user_system_state(user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_user_system_state_updated_at
    BEFORE UPDATE ON user_system_state
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE user_system_state ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can read own data" ON user_system_state;
DROP POLICY IF EXISTS "Users can insert own data" ON user_system_state;
DROP POLICY IF EXISTS "Users can update own data" ON user_system_state;
DROP POLICY IF EXISTS "Users can delete own data" ON user_system_state;
DROP POLICY IF EXISTS "Users can view their own state" ON user_system_state;
DROP POLICY IF EXISTS "Users can insert their own state" ON user_system_state;
DROP POLICY IF EXISTS "Users can update their own state" ON user_system_state;
DROP POLICY IF EXISTS "Users can delete their own state" ON user_system_state;

-- Create RLS policies using auth.uid()
CREATE POLICY "Users can read own data"
ON user_system_state
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data"
ON user_system_state
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data"
ON user_system_state
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own data"
ON user_system_state
FOR DELETE
USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON user_system_state TO authenticated;
GRANT ALL ON user_system_state TO service_role;

-- Comment on table
COMMENT ON TABLE user_system_state IS 'Stores user-specific application state as JSONB. Each user has one row containing their entire app state (scans, profiles, logs, etc.)';
COMMENT ON COLUMN user_system_state.user_id IS 'References auth.users(id). Each user has exactly one state record.';
COMMENT ON COLUMN user_system_state.state IS 'JSONB containing the entire user application state';
