import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('[Supabase Client] Initializing with:', {
    url: url ? `${url.substring(0, 20)}...` : 'MISSING',
    key: key ? `${key.substring(0, 20)}...` : 'MISSING'
  });
  
  if (!url || !key) {
    throw new Error('Missing Supabase environment variables! Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env');
  }
  
  return createBrowserClient(url, key);
}
