-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create analyses table (replaces localStorage history)
CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  image_data_url TEXT NOT NULL,
  diagnosis TEXT NOT NULL,
  confidence NUMERIC NOT NULL,
  treatment TEXT NOT NULL,
  prevention TEXT NOT NULL,
  severity TEXT NOT NULL,
  affected_area NUMERIC NOT NULL,
  location JSONB,
  weather JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create farm_profiles table
CREATE TABLE IF NOT EXISTS farm_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  location JSONB NOT NULL,
  size NUMERIC NOT NULL,
  crops TEXT[] NOT NULL,
  soil_type TEXT,
  irrigation TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create system_logs table
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'error', 'success')),
  message TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_timestamp ON analyses(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_farm_profiles_user_id ON farm_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp ON system_logs(timestamp DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_analyses_updated_at
  BEFORE UPDATE ON analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_farm_profiles_updated_at
  BEFORE UPDATE ON farm_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (users can only access their own data)
CREATE POLICY "Users can view their own analyses"
  ON analyses FOR SELECT
  USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can insert their own analyses"
  ON analyses FOR INSERT
  WITH CHECK (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can update their own analyses"
  ON analyses FOR UPDATE
  USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can delete their own analyses"
  ON analyses FOR DELETE
  USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can view their own farm profiles"
  ON farm_profiles FOR SELECT
  USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can insert their own farm profiles"
  ON farm_profiles FOR INSERT
  WITH CHECK (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can update their own farm profiles"
  ON farm_profiles FOR UPDATE
  USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can delete their own farm profiles"
  ON farm_profiles FOR DELETE
  USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can view their own system logs"
  ON system_logs FOR SELECT
  USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can insert their own system logs"
  ON system_logs FOR INSERT
  WITH CHECK (user_id = current_setting('app.user_id', true));
