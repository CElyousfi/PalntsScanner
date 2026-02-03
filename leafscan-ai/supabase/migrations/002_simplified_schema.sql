-- Simplified approach: Store entire system state as JSONB
-- This avoids complex type mapping and makes migration easier

DROP TABLE IF EXISTS analyses CASCADE;
DROP TABLE IF EXISTS farm_profiles CASCADE;
DROP TABLE IF EXISTS system_logs CASCADE;

-- Create a single table to store user system state
CREATE TABLE IF NOT EXISTS user_system_state (
  user_id TEXT PRIMARY KEY,
  state JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_system_state_user_id ON user_system_state(user_id);

-- Create updated_at trigger
CREATE TRIGGER update_user_system_state_updated_at
  BEFORE UPDATE ON user_system_state
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE user_system_state ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own state"
  ON user_system_state FOR SELECT
  USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can insert their own state"
  ON user_system_state FOR INSERT
  WITH CHECK (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can update their own state"
  ON user_system_state FOR UPDATE
  USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can delete their own state"
  ON user_system_state FOR DELETE
  USING (user_id = current_setting('app.user_id', true));
