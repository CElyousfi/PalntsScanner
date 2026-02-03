# 🚀 Quick Authentication Setup

## 3-Step Setup (5 minutes)

### Step 1: Enable Email Auth in Supabase

1. Go to your Supabase Dashboard
2. Click **Authentication** → **Providers**
3. Enable **Email** provider
4. Click **Save**

✅ **Done!** Supabase automatically created the `auth.users` table for you!

---

### Step 2: Run Database Migration

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste this SQL:

```sql
-- Create user_system_state table that references auth.users
CREATE TABLE user_system_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index
CREATE INDEX idx_user_system_state_user_id ON user_system_state(user_id);

-- Create updated_at trigger
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

-- Enable Row Level Security
ALTER TABLE user_system_state ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can read own data"
ON user_system_state FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data"
ON user_system_state FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data"
ON user_system_state FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own data"
ON user_system_state FOR DELETE
USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON user_system_state TO authenticated;
GRANT ALL ON user_system_state TO service_role;
```

4. Click **Run** (bottom right)
5. You should see: "Success. No rows returned"

✅ **Done!** Database is ready!

---

### Step 3: Verify Setup

1. In Supabase Dashboard, go to **Table Editor**
2. You should see two tables:
   - `auth.users` (created automatically by Supabase)
   - `user_system_state` (created by your migration)

✅ **Done!** Authentication system is ready!

---

## Test It Out

1. Restart your dev server:
   ```bash
   npm run dev
   ```

2. Go to: http://localhost:3000/auth/signup

3. Create a test account:
   - Name: Test User
   - Email: test@example.com
   - Password: test123

4. You'll be auto-logged in and redirected to dashboard!

5. Check Supabase Dashboard → Authentication → Users
   - You should see your test user!

6. Check Supabase Dashboard → Table Editor → user_system_state
   - You should see a row with your user's data!

---

## How It Works

### Supabase's Built-in Auth

Supabase automatically provides:
- `auth.users` table (stores email, password hash, metadata)
- `auth.uid()` function (returns current user's UUID)
- JWT tokens
- Session management
- Password hashing
- Email verification (optional)

### Your Custom Table

`user_system_state` table:
- References `auth.users(id)` via foreign key
- Stores your app-specific data as JSONB
- One row per user
- Protected by Row Level Security (RLS)

### Data Flow

```
User Signs Up
    ↓
Supabase creates record in auth.users
    ↓
Your app creates record in user_system_state
    ↓
user_id in user_system_state = id in auth.users
    ↓
RLS ensures user can only access their own data
```

---

## Security Features

✅ **Row Level Security (RLS)**
- Users can ONLY see their own data
- Database-level enforcement
- No way to bypass

✅ **Foreign Key Constraint**
- user_id MUST exist in auth.users
- Invalid user_id rejected

✅ **CASCADE Delete**
- When user deleted from auth.users
- Their data automatically deleted from user_system_state

✅ **UUID Instead of Email**
- Uses UUID for user identification
- More secure than email
- Allows email changes

---

## Troubleshooting

### "relation auth.users does not exist"

**Solution:** Enable Email auth in Supabase Dashboard first!

### "permission denied for table user_system_state"

**Solution:** Run the GRANT statements in the migration

### "duplicate key value violates unique constraint"

**Solution:** User already has a state record. This is normal - upsert will update it.

---

## Next Steps

✅ Authentication is ready!
✅ Users can sign up/login
✅ Data is isolated per user
✅ Everything is secure

**Optional enhancements:**
- Email verification
- Password reset emails
- Social auth (Google, GitHub)
- Profile management
- Team/organization support

---

**🎉 You're done! Start creating accounts and scanning produce!**
