import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createSupabaseMiddlewareClient(req, res);
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  console.log('[Middleware]', {
    pathname: req.nextUrl.pathname,
    user: user?.email || 'guest',
    error: error?.message || 'none',
    cookies: req.cookies.getAll().map(c => c.name)
  });

  const isAuthenticated = !!user;
  const { pathname } = req.nextUrl;

  // Root - Always redirect to dashboard (guest mode enabled)
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Allow guest access to dashboard - No authentication required anymore
  // Users can access full app as guests

  // Redirect auth pages for logged-in users to dashboard
  if (isAuthenticated && pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/auth/:path*"],
};
