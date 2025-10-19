import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_ROUTES,
  GUEST_ONLY_ROUTES,
  NO_AUTH_ROUTES,
  PROTECTED_ROUTES,
} from "@/constants/routes";

import { getSafeCallbackUrl } from "@/lib/url";

/**
 * Better Auth session cookie name
 * Adjust if you've customized the cookiePrefix in your auth config
 */
const SESSION_COOKIE_NAME = "better-auth.session_token";

/**
 * Matches pathname against route patterns
 * Supports exact matches and prefix matching with trailing slash
 */
function matchesRoute(
  pathname: string,
  routes: readonly string[] | string[],
): boolean {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );
}

/**
 * Optimistic authentication middleware
 *
 * PERFORMANCE CRITICAL: This middleware ONLY performs fast cookie checks.
 * It does NOT validate sessions against the database.
 *
 * Why cookie-only checks?
 * - Middleware runs on EVERY request (static files, images, etc.)
 * - Database calls would create massive performance overhead
 * - Better Auth caches sessions for 5 minutes, but that's still a DB hit
 *
 * Actual session validation happens at:
 * 1. Page/Layout level using getServerSession()
 * 2. API/ORPC level in protected procedures
 *
 * This creates a defense-in-depth security model:
 * - Middleware: Fast routing decisions (optimistic)
 * - Pages/API: Actual security validation (authoritative)
 */
export default async function authMiddleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Skip auth check for public routes (performance optimization)
  if (matchesRoute(pathname, NO_AUTH_ROUTES)) {
    return NextResponse.next();
  }

  const isGuestOnlyRoute = matchesRoute(pathname, GUEST_ONLY_ROUTES);
  const isProtectedRoute = matchesRoute(pathname, PROTECTED_ROUTES);
  const isAdminRoute = matchesRoute(pathname, ADMIN_ROUTES);

  // Optimistic session check - only verify cookie presence, not validity
  // The actual session could be expired/invalid - that's validated at page level
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  const hasSessionCookie = !!sessionCookie?.value;

  // No session cookie found (likely not authenticated)
  if (!hasSessionCookie) {
    // Allow guest-only routes (sign-in, sign-up, forgot-password, etc.)
    if (isGuestOnlyRoute) {
      return NextResponse.next();
    }

    // Redirect to sign-in if trying to access protected or admin routes
    if (isProtectedRoute || isAdminRoute) {
      const signInUrl = new URL("/sgnin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Allow access to public routes (home, about, etc.)
    return NextResponse.next();
  }

  // Session cookie exists (optimistic authentication)
  // Important: We don't know if the session is valid yet - just that cookie exists

  // Redirect authenticated users away from guest-only routes
  if (isGuestOnlyRoute) {
    const callbackParam = searchParams.get("callbackUrl");
    const callbackUrl = getSafeCallbackUrl(callbackParam);
    return NextResponse.redirect(new URL(callbackUrl, request.url));
  }

  // For protected/admin routes, allow through
  // Role/permission validation MUST happen at the page/layout level
  // because we can't access the database here for performance reasons
  if (isProtectedRoute || isAdminRoute) {
    return NextResponse.next();
  }

  // Allow access to all other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*$).*)",
  ],
};
