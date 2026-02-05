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
    user: user?.email || 'none',
    error: error?.message || 'none',
    cookies: req.cookies.getAll().map(c => c.name)
  });

  const isAuthenticated = !!user;
  const { pathname } = req.nextUrl;

  // Root
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(isAuthenticated ? "/dashboard" : "/marketing", req.url)
    );
  }

  // Protect dashboard
  if (pathname.startsWith("/dashboard") && !isAuthenticated) {
    const redirectUrl = new URL("/auth/login", req.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Block auth pages for logged-in users
  if (isAuthenticated && pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/auth/:path*"],
};
