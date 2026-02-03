# 🔐 Authentication System Setup

## Overview

LeafScan AI now includes a comprehensive authentication system powered by **Supabase Auth**. Each user gets their own isolated workspace with fully separated data.

---

## Features

✅ **Email/Password Authentication**
✅ **User Registration & Login**
✅ **Password Reset**
✅ **Protected Routes**
✅ **User-Specific Data Isolation**
✅ **Row Level Security (RLS)**
✅ **Automatic Session Management**
✅ **Beautiful Auth UI**

---

## Setup Instructions

### 1. Supabase Configuration

Make sure your `.env.local` file has:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Enable Email Auth in Supabase

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable **Email** provider
3. Configure email templates (optional)
4. **Note:** Supabase automatically creates the `auth.users` table!

### 3. Database Migration

Run the SQL migration in your Supabase dashboard (SQL Editor):

```bash
# File: supabase/migrations/003_auth_integration.sql
```

This will:
- Create `user_system_state` table with UUID user_id
- Reference Supabase's built-in `auth.users` table
- Enable Row Level Security (RLS)
- Create policies for user data isolation
- Add indexes for performance
- Set up automatic timestamps
- Add CASCADE delete (when user deleted, their data deleted too)

---

## User Flow

### Sign Up
1. User visits `/auth/signup`
2. Enters name, email, password
3. Account created in Supabase Auth
4. Automatically logged in
5. Redirected to `/dashboard`
6. User-specific workspace initialized

### Login
1. User visits `/auth/login`
2. Enters email, password
3. Authenticated via Supabase
4. Redirected to `/dashboard`
5. User data loaded from Supabase

### Forgot Password
1. User visits `/auth/forgot-password`
2. Enters email
3. Receives password reset link
4. Clicks link to reset password

---

## Data Isolation

### How It Works

**Each user has completely isolated data:**

```typescript
// User A's data
user_id: "123-abc"
state: { history: [...], profiles: [...] }

// User B's data  
user_id: "456-def"
state: { history: [...], profiles: [...] }
```

**Row Level Security ensures:**
- Users can only read their own data
- Users can only write to their own data
- No cross-user data access
- Database-level enforcement

### Database Schema

```sql
CREATE TABLE user_system_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- user_id references Supabase's built-in auth.users table
-- Each user in auth.users can have exactly one state record
-- When a user is deleted, their state is automatically deleted (CASCADE)
```

---

## Protected Routes

All dashboard routes are automatically protected:

```typescript
// Wrapped in AuthProvider
<AuthProvider>
  <Dashboard />
</AuthProvider>

// Auto-redirects to /auth/login if not authenticated
```

### Manual Protection

```typescript
import ProtectedRoute from '@/components/ProtectedRoute'

export default function MyPage() {
  return (
    <ProtectedRoute>
      <YourContent />
    </ProtectedRoute>
  )
}
```

---

## Using Auth in Components

### Get Current User

```typescript
import { useAuth } from '@/context/AuthContext'

export default function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Please login</div>
  
  return <div>Welcome {user.name}!</div>
}
```

### Sign Out

```typescript
import { useAuth } from '@/context/AuthContext'

export default function LogoutButton() {
  const { logout } = useAuth()
  
  return (
    <button onClick={logout}>
      Sign Out
    </button>
  )
}
```

---

## API Routes

### Accessing User ID in API

```typescript
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  // Use user.id for database operations
  const userId = user.id
  
  // ...
}
```

---

## User Profile Structure

```typescript
interface UserProfile {
  id: string              // Supabase Auth UUID
  email: string           // User email
  name?: string           // Display name
  avatar?: string         // Profile picture URL
  region?: string         // Default: "Casablanca"
  role?: 'expert' | 'farmer'  // User role
  created_at?: string     // Account creation date
}
```

---

## Security Features

### Row Level Security (RLS)

```sql
-- Users can only access their own data
CREATE POLICY "Users can read own data"
ON user_system_state
FOR SELECT
USING (auth.uid() = user_id::uuid);
```

### Password Requirements

- Minimum 6 characters
- Hashed with bcrypt
- Stored securely in Supabase

### Session Management

- JWT tokens
- Automatic refresh
- Secure HTTP-only cookies
- CSRF protection

---

## Migration from Old System

### Automatic Migration

The system automatically migrates data from localStorage to Supabase:

```typescript
// On first login after auth setup
1. Check if user has data in Supabase
2. If not, check localStorage
3. Migrate localStorage data to Supabase
4. Backup localStorage data
5. Continue using Supabase
```

### Manual Migration

```typescript
import { migrateFromLocalStorage } from '@/lib/database'

// Migrate specific user
await migrateFromLocalStorage(userId)
```

---

## Testing

### Create Test User

```bash
# Via UI
1. Go to /auth/signup
2. Enter test credentials
3. Create account

# Via Supabase Dashboard
1. Go to Authentication → Users
2. Click "Add User"
3. Enter email/password
```

### Test Data Isolation

```bash
1. Create User A
2. Add some scans/data
3. Logout
4. Create User B
5. Verify User B sees no data from User A
```

---

## Troubleshooting

### "User not authenticated"

**Solution:** Check Supabase URL and keys in `.env.local`

### "Row Level Security violation"

**Solution:** Run the migration SQL to set up RLS policies

### "Email already exists"

**Solution:** User already registered, use login instead

### Data not persisting

**Solution:** Check Supabase connection and RLS policies

---

## Environment Variables

Required in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# Gemini (existing)
GEMINI_API_KEY=AIzaSyxxx...
```

---

## File Structure

```
/app
  /auth
    /login/page.tsx          # Login page
    /signup/page.tsx         # Sign up page
    /forgot-password/page.tsx # Password reset
  /dashboard                 # Protected routes
    
/lib
  /auth.ts                   # Auth functions
  /supabase.ts              # Supabase client
  /database.ts              # Database operations
  
/context
  /AuthContext.tsx          # Auth state management
  
/components
  /ProtectedRoute.tsx       # Route protection
  
/supabase
  /migrations
    /001_auth_setup.sql     # Database setup
```

---

## Next Steps

1. ✅ Run database migration
2. ✅ Test sign up flow
3. ✅ Test login flow
4. ✅ Test data isolation
5. ✅ Configure email templates (optional)
6. ✅ Add profile management (optional)
7. ✅ Add social auth (optional)

---

## Support

For issues or questions:
1. Check Supabase logs
2. Check browser console
3. Verify environment variables
4. Test RLS policies in Supabase dashboard

---

**🎉 Authentication system is ready!**

Each user now has their own isolated workspace with secure authentication powered by Supabase!
