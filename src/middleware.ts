import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_ROUTES,
  GUEST_ONLY_ROUTES,
  NO_AUTH_ROUTES,
  PROTECTED_ROUTES,
} from "@/constants/routes";
import { betterFetch } from "@better-fetch/fetch";

import { env } from "@/env";
import type { Session } from "@/server/auth";
import { getSafeCallbackUrl } from "@/lib/url";

function matchesRoute(
  pathname: string,
  routes: readonly string[] | string[],
): boolean {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );
}

export default async function authMiddleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Skip auth check for public routes (performance optimization)
  if (matchesRoute(pathname, NO_AUTH_ROUTES)) {
    return NextResponse.next();
  }

  const isGuestOnlyRoute = matchesRoute(pathname, GUEST_ONLY_ROUTES);
  const isProtectedRoute = matchesRoute(pathname, PROTECTED_ROUTES);
  const isAdminRoute = matchesRoute(pathname, ADMIN_ROUTES);

  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: env.BETTER_AUTH_URL,
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
    },
  );

  // Not authenticated
  if (!session) {
    // Allow guest-only routes (login, register, etc.)
    if (isGuestOnlyRoute) {
      return NextResponse.next();
    }

    // Redirect to login if trying to access protected or admin routes
    if (isProtectedRoute || isAdminRoute) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Allow access to public routes
    return NextResponse.next();
  }

  // Authenticated user trying to access guest-only routes
  if (isGuestOnlyRoute) {
    const callbackParam = searchParams.get("callbackUrl");
    const callbackUrl = getSafeCallbackUrl(callbackParam);
    return NextResponse.redirect(new URL(callbackUrl, request.url));
  }

  // Check admin access (admin routes require admin role)
  if (isAdminRoute) {
    const user = session.user as { role?: string };
    if (user.role !== "admin") {
      // Redirect non-admin users to dashboard home
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Allow access to protected routes (user is authenticated)
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*$).*)",
  ],
};
