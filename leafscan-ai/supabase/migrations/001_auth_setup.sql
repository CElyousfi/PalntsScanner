-- Enable Row Level Security
ALTER TABLE user_system_state ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read only their own data
CREATE POLICY "Users can read own data"
ON user_system_state
FOR SELECT
USING (auth.uid() = user_id::uuid);

-- Create policy to allow users to insert their own data
CREATE POLICY "Users can insert own data"
ON user_system_state
FOR INSERT
WITH CHECK (auth.uid() = user_id::uuid);

-- Create policy to allow users to update their own data
CREATE POLICY "Users can update own data"
ON user_system_state
FOR UPDATE
USING (auth.uid() = user_id::uuid);

-- Create policy to allow users to delete their own data
CREATE POLICY "Users can delete own data"
ON user_system_state
FOR DELETE
USING (auth.uid() = user_id::uuid);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_system_state_user_id ON user_system_state(user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_system_state_updated_at
    BEFORE UPDATE ON user_system_state
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
